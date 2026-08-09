import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

export function createAiGatewayProvider(apiKey: string) {
  return createOpenAICompatible({
    name: "vercel-ai-gateway",
    apiKey,
    baseURL: "https://ai-gateway.vercel.sh/v1",
    headers: {
      "HTTP-Referer": process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "",
    },
  });
}
