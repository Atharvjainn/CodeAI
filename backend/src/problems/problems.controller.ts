import { Body, Controller, Post, ValidationPipe } from "@nestjs/common";
import { GenerateProblemDto } from "../ai/dto/generate-problem.dto.js";
import { ProblemsService } from "./problems.service.js";

@Controller("problems")
export class ProblemsController {
  constructor(private readonly problemsService: ProblemsService) {}

  @Post("generate")
  async generate(@Body(ValidationPipe) dto: GenerateProblemDto) {
    const problem = await this.problemsService.generate(dto);
    return { success: true, data: problem };
  }
}
