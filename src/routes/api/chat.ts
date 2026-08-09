import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createAiGatewayProvider } from "@/lib/ai-gateway.server";

const SYSTEM_PROMPT = `You are a friendly AI assistant for AgroLink, helping consumers understand product origin, quality checks, QR codes on packaging, and how to contact farms.

Reply concisely (2-4 sentences), warmly, and in English. If a question is out of scope, politely suggest contacting the hotline: +7 800 555-01-23.

What you know:
- Every AgroLink product has a QR code (e.g. TOM-2026-001) with a full history: sowing, harvest, packaging, lab tests.
- Checks: pesticides, heavy metals, microbiology. All results are public.
- Pilot farms: "Zarya" (tomatoes), "Polesye" (cucumbers), "Utro" (eggs).`;

const MAX_MESSAGES = 30;
const MAX_MESSAGE_CHARS = 4_000;

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
        let payload: { messages?: UIMessage[] };
        try {
          payload = (await request.json()) as { messages?: UIMessage[] };
        } catch {
          return new Response("Request body must be valid JSON", { status: 400 });
        }

        const { messages } = payload;
        if (
          !Array.isArray(messages) ||
          messages.length === 0 ||
          messages.length > MAX_MESSAGES ||
          !hasValidMessageSize(messages)
        ) {
          return new Response("Invalid message payload", { status: 400 });
        }

        const key = process.env.AI_GATEWAY_API_KEY;
        if (!key) {
          console.error("Chat service is not configured: AI_GATEWAY_API_KEY is missing.");
          return new Response("Chat service is temporarily unavailable", { status: 503 });
        }

        const gateway = createAiGatewayProvider(key);
        const result = streamText({
          model: gateway("openai/gpt-5.4"),
          system: SYSTEM_PROMPT,
          messages: await convertToModelMessages(messages),
        });

        return result.toUIMessageStreamResponse({
          originalMessages: messages,
          headers: { "Cache-Control": "no-store" },
        });
      },
    },
  },
});
