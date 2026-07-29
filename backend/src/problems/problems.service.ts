import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client.js';
import { AiService } from '../ai/ai.service.js';
import { GenerateProblemDto } from '../ai/dto/generate-problem.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class ProblemsService {
  private readonly logger = new Logger(ProblemsService.name);

  constructor(
    private readonly aiService: AiService,
    private readonly prisma: PrismaService,
  ) {}

  async generate(dto: GenerateProblemDto) {
    this.logger.log(`AI generation started — prompt: "${dto.prompt.substring(0, 80)}..."`);

    const problem = await this.aiService.generateProblem(dto);

    this.logger.log(`AI generation completed — slug: "${problem.slug}"`);

    this.logger.log(`Database persistence started — slug: "${problem.slug}"`);

    try {
      const persisted = await this.prisma.problem.create({
        data: {
          title: problem.title,
          slug: problem.slug,
          difficulty: problem.difficulty,
          tags: problem.tags as unknown as Prisma.InputJsonValue,
          problemStatement: problem.problemStatement,
          detailedDescription: problem.detailedDescription,
          inputFormat: problem.inputFormat,
          outputFormat: problem.outputFormat,
          constraints: problem.constraints as unknown as Prisma.InputJsonValue,
          examples: problem.examples as unknown as Prisma.InputJsonValue,
          starterCode: problem.starterCode,
          helperCode: problem.helperCode ?? null,
          driverCode: problem.driverCode ?? null,
          hiddenTestCases: problem.hiddenTestCases as unknown as Prisma.InputJsonValue,
          visibleTestCases: problem.visibleTestCases as unknown as Prisma.InputJsonValue,
          hints: problem.hints as unknown as Prisma.InputJsonValue,
          expectedTimeComplexity: problem.expectedTimeComplexity,
          expectedSpaceComplexity: problem.expectedSpaceComplexity,
        },
      });

      this.logger.log(`Database persistence completed — slug: "${persisted.slug}", id: "${persisted.id}"`);

      return persisted;
    } catch (error) {
      this.logger.error(`Persistence failed — slug: "${problem.slug}"`);

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException(
            `Problem with slug "${problem.slug}" already exists. Try a different prompt.`,
          );
        }

        if (error.code === 'P2000' || error.code === 'P2006') {
          throw new BadRequestException('Invalid data format for database persistence.');
        }

        if (error.code.startsWith('P10')) {
          throw new ServiceUnavailableException('Database connection failed. Try again later.');
        }
      }

      throw new InternalServerErrorException('Failed to save the generated problem.');
    }
  }
}
