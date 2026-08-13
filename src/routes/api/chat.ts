import { createFileRoute } from "@tanstack/react-router";
import { google } from "@ai-sdk/google";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { inspectionNews, products, type Product } from "@/data/consumer";

const BASE_SYSTEM_PROMPT = `You are the AgroHelp website assistant. Help visitors understand product origin, quality checks, QR codes on packaging, and how to contact farms.

Reply concisely (2-4 sentences), warmly, and in the language used by the visitor. Use only the WEBSITE DATA below for facts about products, farms, dates, locations, and inspections. If the requested fact is not in the data, say that it is not available on the AgroHelp website; do not guess. For questions outside this scope, politely suggest contacting the hotline: +7 800 555-01-23.`;

const MAX_MESSAGES = 30;
const MAX_MESSAGE_CHARS = 4_000;
const MAX_PRODUCT_ID_CHARS = 64;

type ChatPayload = { messages?: UIMessage[]; productId?: string };

function formatProduct(product: Product) {
  return {
    code: product.id,
    name: product.name,
    farm: product.farm,
    region: product.region,
    producedAt: product.producedAt,
    journey: product.timeline,
    inspections: product.inspections,
  };
}

function getWebsiteContext(productId?: string) {
  const normalizedId = productId?.trim().toUpperCase();
  const selectedProduct = normalizedId ? products[normalizedId] : undefined;
  const catalog = selectedProduct
    ? [formatProduct(selectedProduct)]
    : Object.values(products).map(formatProduct);

  return JSON.stringify({
    selectedProductCode: selectedProduct?.id ?? null,
    catalog,
    inspectionNews,
  });
}

function hasValidMessageSize(messages: UIMessage[]): boolean {
  return messages.every((message) => {
    const textLength = message.parts.reduce(
      (length, part) => length + (part.type === "text" ? part.text.length : 0),
      0,
    );
    return textLength <= MAX_MESSAGE_CHARS;
  });
}

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
          return new Response("Chat is not configured. Add GOOGLE_GENERATIVE_AI_API_KEY.", {
            status: 503,
          });
        }

        let payload: ChatPayload;
        try {
          payload = (await request.json()) as ChatPayload;
        } catch {
          return new Response("Request body must be valid JSON", { status: 400 });
        }

        const { messages, productId } = payload;
        if (
          !Array.isArray(messages) ||
          messages.length === 0 ||
          messages.length > MAX_MESSAGES ||
          !hasValidMessageSize(messages) ||
          (productId !== undefined &&
            (typeof productId !== "string" || productId.length > MAX_PRODUCT_ID_CHARS))
        ) {
          return new Response("Invalid message payload", { status: 400 });
        }

        const result = streamText({
          model: google("gemini-3.6-flash"),
          system: `${BASE_SYSTEM_PROMPT}\n\nWEBSITE DATA (authoritative):\n${getWebsiteContext(productId)}`,
          messages: await convertToModelMessages(messages),
        });

        return result.toUIMessageStreamResponse({
          originalMessages: messages,
          headers: { "Cache-Control": "no-store" },
          onError: (error) => {
            console.error("Gemini chat request failed", error);
            return "The assistant is temporarily unavailable. Please try again later or contact the hotline: +7 800 555-01-23.";
          },
        });
      },
    },
  },
});
