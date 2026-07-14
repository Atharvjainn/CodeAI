import { LlmProvider, LlmResponse } from '../interfaces/llm-provider.interface.js';

export class GroqProvider implements LlmProvider {
  private readonly apiKey: string;
  private readonly model: string;
  private readonly temperature: number;
  private readonly maxTokens: number;
  private readonly timeoutMs: number;

  constructor(config: {
    apiKey: string;
    model: string;
    temperature: number;
    maxTokens: number;
    timeoutMs: number;
  }) {
    this.apiKey = config.apiKey;
    this.model = config.model;
    this.temperature = config.temperature;
    this.maxTokens = config.maxTokens;
    this.timeoutMs = config.timeoutMs;
  }

  async generate(prompt: string): Promise<LlmResponse> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: [{ role: 'user', content: prompt }],
          temperature: this.temperature,
          max_tokens: this.maxTokens,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorBody = await response.text().catch(() => '');
        throw new Error(`Groq API error ${response.status}: ${errorBody}`);
      }

      const data = (await response.json()) as {
        choices: { message: { content: string }; finish_reason: string }[];
      };

      const choice = data.choices?.[0];
      if (!choice) {
        throw new Error('Groq returned empty choices');
      }

      return {
        content: choice.message.content,
        finishReason: choice.finish_reason,
      };
    } finally {
      clearTimeout(timeout);
    }
  }
}
