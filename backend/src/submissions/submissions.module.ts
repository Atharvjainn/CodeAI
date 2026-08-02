import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { SubmissionsController } from "./submissions.controller.js";
import { SubmissionsService } from "./submissions.service.js";

@Module({
  imports: [ConfigModule],
  controllers: [SubmissionsController],
  providers: [SubmissionsService],
})
export class SubmissionsModule {}
