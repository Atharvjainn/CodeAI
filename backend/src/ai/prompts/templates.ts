import { Difficulty, Language } from '../types/index.js';

const STARTER_CODE_CONVENTIONS: Record<Language, string> = {
  [Language.CPP]: `Use the following starter code template:
  class Solution {
  public:
      // method signature matching the problem
  };`,
  [Language.JAVASCRIPT]: `Use the following starter code template:
  function solve(input) {
      // Your code here
  }`,
  [Language.PYTHON]: `Use the following starter code template:
  def solve(input):
      pass`,
  [Language.JAVA]: `Use the following starter code template:
  class Solution {
      public static void main(String[] args) {
          // Your code here
      }
  }`,
};

export function buildSystemPrompt(language: Language): string {
  return `You are an expert competitive programming problem generator.

You MUST respond with a single valid JSON object. Do NOT wrap it in markdown code blocks or any other formatting. Return ONLY raw JSON.

The JSON object must follow this exact schema:

{
  "title": "string — short name of the problem",
  "slug": "string — kebab-case-url-friendly-identifier",
  "difficulty": "easy" | "medium" | "hard",
  "tags": ["string — at least one relevant tag like 'array', 'hash-map', 'dp', etc."],
  "problemStatement": "string — one paragraph describing the problem",
  "detailedDescription": "string — longer explanation with context and examples walkthrough",
  "inputFormat": "string — describe the input structure",
  "outputFormat": "string — describe the expected output",
  "constraints": ["string — each constraint as a separate string like '1 ≤ n ≤ 10^5'"],
  "examples": [
    {
      "input": "string — raw input",
      "output": "string — expected output",
      "explanation": "string — optional explanation"
    }
  ],
  "starterCode": "string — starter code / function stub that the user will edit (the user-facing solution template)",
  "helperCode": "string — helper code like #include directives, utility functions, and data structures needed by the solution (NOT shown to the user, used only during compilation)",
  "driverCode": "string — driver code with main() that reads input, calls the user's function, and prints output (NOT shown to the user, used only during execution)",
  "hiddenTestCases": [
    { "input": "string", "expectedOutput": "string" }
  ],
  "visibleTestCases": [
    { "input": "string", "expectedOutput": "string" }
  ],
  "hints": ["string — helpful hints, at least one"],
  "expectedTimeComplexity": "string — like O(n log n)",
  "expectedSpaceComplexity": "string — like O(n)"
}

Rules:
- Problem must be realistic and solvable.
- Test cases must be correct — the expected output must match running the correct solution against the input.
- Visible test cases are simple examples. Hidden test cases cover edge cases and large inputs.
- Time and space complexity must match the intended optimal solution.
- Generate at least 2 visible and 3 hidden test cases.

Starter code conventions for ${language}:
${STARTER_CODE_CONVENTIONS[language]}`;
}

export function buildUserPrompt(
  userPrompt: string,
  language: Language,
  difficulty?: Difficulty,
): string {
  const diff = difficulty ?? 'any';
  return `Generate a ${diff} difficulty coding problem based on this description: "${userPrompt}"
Language: ${language}`;
}
