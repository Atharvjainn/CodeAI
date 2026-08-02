export interface ExecutionResult {
  stdout: string | null;
  stderr: string | null;
  compile_output: string | null;
  time: string | null;
  exit_code: number;
  status: { id: number; description: string };
}
