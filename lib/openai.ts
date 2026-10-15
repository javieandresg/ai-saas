import OpenAI from "openai";

export const CHAT_MODEL = "gpt-6-luna";
export const IMAGE_MODEL = "gpt-image-2.5-flare";

let client: OpenAI | undefined;

// Created on first use so a missing OPENAI_API_KEY surfaces as a 500 from the route, not a build failure.
export const getOpenAI = () => {
  client ??= new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return client;
};
