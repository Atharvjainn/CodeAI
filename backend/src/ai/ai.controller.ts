import { Body, Controller, Post, ValidationPipe } from '@nestjs/common';
import { AiService } from './ai.service.js';
import { GenerateProblemDto } from './dto/generate-problem.dto.js';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('generate-problem')
  async generateProblem(@Body(ValidationPipe) dto: GenerateProblemDto) {
    const problem = await this.aiService.generateProblem(dto);
    return { success: true, data: problem };
  }
}
