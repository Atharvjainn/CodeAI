import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { SubmitCodeDto } from "./dto/submit-code.dto.js";
import { TestResult } from "./interfaces/test-result.interface.js";
import { ExecutionResult } from "./interfaces/execution-result.interface.js";
import { HELPER_CODE } from "./constants/helper-code.js";
import { Language } from "../ai/types/index.js";

const LANGUAGE_JUDGE0_ID: Record<string, number> = {
  cpp: 54,
  javascript: 63,
  python: 71,
  java: 62,
};

const HIDDEN_MASK = "***";

@Injectable()
export class SubmissionsService {
  private readonly logger = new Logger(SubmissionsService.name);
  private readonly executionUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.executionUrl =
      this.configService.getOrThrow<string>("CODE_EXECUTION_URL");
  }

  async submit(dto: SubmitCodeDto) {
    const languageId = LANGUAGE_JUDGE0_ID[dto.language];
    const allTests = [
      ...dto.visibleTestCases.map((tc) => ({ ...tc, visible: true })),
      ...dto.hiddenTestCases.map((tc) => ({ ...tc, visible: false })),
    ];

    const results: TestResult[] = [];
    let passed = 0;

    for (const test of allTests) {
      const sourceCode = [
        HELPER_CODE[dto.language],
        dto.userCode,
        this.sanitizeDriverCode(dto.driverCode, dto.language),
      ]
        .filter(Boolean)
        .join("\n");

      try {
        const execution: ExecutionResult = await this.executeCode(
          sourceCode,
          languageId,
          test.stdin,
        );

        const actualOutput = (execution.stdout ?? "").trim();
        const expectedOutput = test.expectedOutput.trim();
        const testPassed = actualOutput === expectedOutput;
        const errorOutput =
          execution.compile_output || execution.stderr || null;

        if (testPassed) passed++;

        results.push({
          passed: testPassed,
          visible: test.visible,
          input: test.visible ? test.input : HIDDEN_MASK,
          expectedOutput: test.visible ? test.expectedOutput : HIDDEN_MASK,
          actualOutput: test.visible ? actualOutput : HIDDEN_MASK,
          stderr: errorOutput,
        });
      } catch (error) {
        this.logger.error(`Test case execution failed — ${error}`);
        results.push({
          passed: false,
          visible: test.visible,
          input: test.visible ? test.input : HIDDEN_MASK,
          expectedOutput: test.visible ? test.expectedOutput : HIDDEN_MASK,
          actualOutput: "Execution error",
          stderr: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return { passed, total: allTests.length, results };
  }

  private sanitizeDriverCode(driverCode: string, language: string): string {
    if (language === Language.CPP || language === Language.JAVA) {
      const mainMatch = driverCode.search(/int\s+main\b/);
      if (mainMatch !== -1) {
        return driverCode.slice(mainMatch);
      }
    }

    return driverCode
      .split('\n')
      .filter((line) => {
        const trimmed = line.trim();
        return (
          !trimmed.startsWith('#include') &&
          !trimmed.startsWith('using namespace') &&
          !trimmed.startsWith('import ') &&
          !trimmed.startsWith('require(')
        );
      })
      .join('\n');
  }

  private async executeCode(
    sourceCode: string,
    languageId: number,
    stdin: string,
  ): Promise<ExecutionResult> {
    const response = await fetch(`${this.executionUrl}/submissions?wait=true`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Auth-Token": "dev-token",
      },
      body: JSON.stringify({
        source_code: sourceCode,
        language_id: languageId,
        stdin,
      }),
    });

    if (!response.ok) {
      throw new ServiceUnavailableException(
        `Code execution service returned ${response.status}`,
      );
    }

    return response.json() as Promise<ExecutionResult>;
  }
}
