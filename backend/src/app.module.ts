import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { PrismaModule } from "./prisma/prisma.module";
import { UsersModule } from "./users/users.module";
import { AiModule } from "./ai/ai.module.js";
import { ProblemsModule } from "./problems/problems.module.js";
import { SubmissionsModule } from "./submissions/submissions.module.js";
import { auth } from "./auth/auth";
import { AuthModule } from "@thallesp/nestjs-better-auth";

@Module({
  imports: [
    AuthModule.forRoot({
      auth,
      bodyParser: {
        json: { limit: "2mb" },
        urlencoded: { limit: "2mb", extended: true },
        rawBody: true,
      },
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    UsersModule,
    AiModule,
    ProblemsModule,
    SubmissionsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
