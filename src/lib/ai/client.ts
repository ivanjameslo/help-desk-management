import OpenAI from "openai";

type AiProvider = "openrouter" | "openai";

type AiConfig = {
  client: OpenAI;
  model: string;
  provider: AiProvider;
};

function getProvider(): AiProvider {
  const provider = process.env.AI_PROVIDER?.toLowerCase() ?? "openrouter";

  if (provider !== "openrouter" && provider !== "openai") {
    throw new Error(`Unsupported AI_PROVIDER: ${provider}`);
  }

  return provider;
}

export function getAiConfig(): AiConfig {
  const provider = getProvider();

  const model = process.env.AI_MODEL;

  if (!model) {
    throw new Error("AI_MODEL is not configured.");
  }

  if (provider === "openai") {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      throw new Error("OPENAI_API_KEY is not configured.");
    }

    return {
      provider,
      model,

      client: new OpenAI({
        apiKey,
      }),
    };
  }

  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not configured.");
  }

  const defaultHeaders: Record<string, string> = {};

  if (process.env.OPENROUTER_SITE_URL) {
    defaultHeaders["HTTP-Referer"] = process.env.OPENROUTER_SITE_URL;
  }

  if (process.env.OPENROUTER_APP_NAME) {
    defaultHeaders["X-Title"] = process.env.OPENROUTER_APP_NAME;
  }

  return {
    provider,
    model,

    client: new OpenAI({
      apiKey,

      baseURL: "https://openrouter.ai/api/v1",

      defaultHeaders,
    }),
  };
}
