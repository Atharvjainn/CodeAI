import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { AiController } from "./ai.controller.js";
import { AiService, LLM_PROVIDER } from "./ai.service.js";
import { GroqProvider } from "./providers/groq.provider.js";
import { GeminiProvider } from "./providers/gemini.provider.js";

@Module({
  imports: [ConfigModule],
  controllers: [AiController],
  exports: [AiService],
  providers: [
    AiService,
    {
      provide: LLM_PROVIDER,
      useFactory: (configService: ConfigService) => {
        const provider = configService.get<string>("AI_PROVIDER", "groq");

        const commonConfig = {
          apiKey: configService.getOrThrow<string>("AI_API_KEY"),
          model: configService.get<string>(
            "AI_MODEL",
            "llama-3.3-70b-versatile",
          ),
          temperature: Number(
            configService.get<string>("AI_TEMPERATURE", "0.7"),
          ),
          maxTokens: Number(configService.get<string>("AI_MAX_TOKENS", "4000")),
          timeoutMs: Number(
            configService.get<string>("AI_TIMEOUT_MS", "30000"),
          ),
        };

        if (provider === "gemini") {
          return new GeminiProvider({
            ...commonConfig,
            model: configService.get<string>("AI_MODEL", "gemini-2.5-flash"),
          });
        }

        return new GroqProvider(commonConfig);
      },
      inject: [ConfigService],
    },
  ],
})
export class AiModule {}
