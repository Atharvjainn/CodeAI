export interface LlmResponse {
  content: string;
  finishReason: string;
}

export interface LlmProvider {
  generate(prompt: string): Promise<LlmResponse>;
}
