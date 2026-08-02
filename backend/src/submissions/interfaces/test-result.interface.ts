export interface TestResult {
  passed: boolean;
  visible: boolean;
  input: string;
  expectedOutput: string;
  actualOutput: string;
  stderr: string | null;
}
