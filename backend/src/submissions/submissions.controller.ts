import { Controller, Post, Body, ValidationPipe } from "@nestjs/common";
import { SubmissionsService } from "./submissions.service.js";
import { SubmitCodeDto } from "./dto/submit-code.dto.js";
import { AllowAnonymous } from "@thallesp/nestjs-better-auth";

@Controller("submissions")
export class SubmissionsController {
  constructor(private readonly submissionsService: SubmissionsService) {}

  @AllowAnonymous()
  @Post()
  async submit(@Body(ValidationPipe) dto: SubmitCodeDto) {
    return this.submissionsService.submit(dto);
  }
}
