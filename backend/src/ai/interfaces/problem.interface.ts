export interface Example {
  input: string;
  output: string;
  explanation?: string;
}

export interface TestCase {
  input: string;
  expectedOutput: string;
}

export interface Problem {
  title: string;
  slug: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  problemStatement: string;
  detailedDescription: string;
  inputFormat: string;
  outputFormat: string;
  constraints: string[];
  examples: Example[];
  starterCode: string;
  hiddenTestCases: TestCase[];
  visibleTestCases: TestCase[];
  hints: string[];
  expectedTimeComplexity: string;
  expectedSpaceComplexity: string;
}
