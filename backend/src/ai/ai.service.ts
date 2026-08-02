import {
  BadGatewayException,
  GatewayTimeoutException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { GenerateProblemDto } from "./dto/generate-problem.dto.js";
import { LlmProvider } from "./interfaces/llm-provider.interface.js";

export const LLM_PROVIDER = "LLM_PROVIDER";
import { Problem } from "./interfaces/problem.interface.js";
import { buildSystemPrompt, buildUserPrompt } from "./prompts/templates.js";
import { ProblemSchema } from "./validators/problem-schema.js";
import { Language } from "./types/index.js";

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly maxRetries: number;
  private readonly rateLimitMax: number;
  private readonly rateLimitTtl: number;
  private requestTimestamps: number[] = [];

  constructor(
    @Inject(LLM_PROVIDER) private readonly llm: LlmProvider,
    private readonly configService: ConfigService,
  ) {
    this.maxRetries = Number(
      this.configService.get<string>("AI_MAX_RETRIES", "2"),
    );
    this.rateLimitMax = Number(
      this.configService.get<string>("AI_RATE_LIMIT_MAX", "10"),
    );
    this.rateLimitTtl = Number(
      this.configService.get<string>("AI_RATE_LIMIT_TTL", "60000"),
    );
  }

  async generateProblem(dto: GenerateProblemDto): Promise<Problem> {
    this.checkRateLimit();

    const language = dto.language ?? Language.CPP;
    const fullPrompt =
      buildSystemPrompt(language) +
      "\n\n" +
      buildUserPrompt(dto.prompt, language, dto.difficulty);

    const lastError: { attempt: number; message: string } = {
      attempt: 0,
      message: "",
    };

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          this.logger.warn(
            `Retry attempt ${attempt}/${this.maxRetries} — ${lastError.message}`,
          );
          await this.sleep(attempt * 1000);
        }

        this.logger.debug(
          `LLM request — prompt: "${dto.prompt.substring(0, 80)}...", language: ${language}`,
        );

        const llmResponse = await this.llm.generate(fullPrompt);
        const content = llmResponse.content;

        this.logger.debug(
          `LLM response received — finish_reason: ${llmResponse.finishReason}`,
        );

        const parsed = this.parseJson(content);

        if (!parsed) {
          lastError.attempt = attempt;
          lastError.message = "Failed to parse JSON from LLM response";
          this.logger.warn(
            `Parse failed — raw response snippet: "${content.substring(0, 200)}..."`,
          );
          continue;
        }

        const result = ProblemSchema.safeParse(parsed);

        if (result.success) {
          this.logger.log(
            `Problem generated — slug: "${result.data.slug}", difficulty: ${result.data.difficulty}`,
          );
          return result.data;
        }

        lastError.attempt = attempt;
        lastError.message = `Schema validation failed: ${result.error.message}`;
        this.logger.warn(`Validation failed — ${result.error.message}`);
      } catch (error) {
        if (
          error instanceof HttpException &&
          error.getStatus() === HttpStatus.TOO_MANY_REQUESTS
        ) {
          throw error;
        }

        const message =
          error instanceof Error ? error.message : "Unknown error";
        lastError.attempt = attempt;
        lastError.message = message;
        this.logger.warn(`Attempt ${attempt} failed — ${message}`);
      }
    }

    if (
      lastError.message.includes("fetch") ||
      lastError.message.includes("timeout") ||
      lastError.message.includes("abort")
    ) {
      throw new GatewayTimeoutException(
        "LLM provider unreachable after retries",
      );
    }

    throw new BadGatewayException(
      `Failed to generate problem after ${this.maxRetries + 1} attempts. Last error: ${lastError.message}`,
    );
  }

  private parseJson(raw: string): Record<string, unknown> | null {
    let cleaned = raw.trim();

    // Step 1: strip markdown code block fences if present
    const jsonBlockMatch = cleaned.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
    if (jsonBlockMatch) {
      cleaned = jsonBlockMatch[1].trim();
    }

    // Step 2: strip anything before first { and after last }
    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      cleaned = cleaned.substring(firstBrace, lastBrace + 1);
    }

    // Step 3: direct parse
    try {
      return JSON.parse(cleaned) as Record<string, unknown>;
    } catch (error: any) {
      console.error("JSON Parse Error:", error);
      console.error("Raw:", JSON.stringify(cleaned));

      return null;
    }
  }

  private checkRateLimit(): void {
    const now = Date.now();
    this.requestTimestamps = this.requestTimestamps.filter(
      (t) => now - t < this.rateLimitTtl,
    );

    if (this.requestTimestamps.length >= this.rateLimitMax) {
      throw new HttpException(
        "Rate limit exceeded. Try again later.",
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    this.requestTimestamps.push(now);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
