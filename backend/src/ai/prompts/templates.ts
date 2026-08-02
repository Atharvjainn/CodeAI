import { Difficulty, Language } from "../types/index.js";

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

const DRIVER_CODE_CONVENTIONS: Record<Language, string> = {
  [Language.CPP]: `For C++, the driverCode MUST look exactly like this structure (only main, no includes, no namespace, no class definition):
  int main() {
      // read input from stdin
      // create an instance of Solution
      // call the required method
      // print the result to stdout
      return 0;
  }`,
  [Language.JAVASCRIPT]: `For JavaScript, the driverCode MUST only contain the top-level entry logic:
  // read input
  // call solve(input)
  // print the result
  No imports, no function redefinitions.`,
  [Language.PYTHON]: `For Python, the driverCode MUST only contain the top-level entry logic:
  # read input
  # call solve(input)
  # print the result
  No imports, no function redefinitions.`,
  [Language.JAVA]: `For Java, the driverCode MUST only contain the main method body:
  public static void main(String[] args) {
      // read input
      // create an instance of Solution
      // call the required method
      // print the result
  }
  No imports, no class wrapper, no class definitions.`,
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
  "driverCode": "string — driver code with main() that reads input, calls the user's function, and prints output (NOT shown to the user, used only during execution)",
  "hiddenTestCases": [
    { "input": "string — human-readable display format like 'nums = [1, 2, 3], target = 9'", "stdin": "string — raw stdin format (newline-separated values without brackets/commas) like '3\\n1 2 3\\n9'", "expectedOutput": "string — raw expected stdout like '0 1'" }
  ],
  "visibleTestCases": [
    { "input": "string — human-readable display format", "stdin": "string — raw stdin format", "expectedOutput": "string — raw expected stdout" }
  ],
  "hints": ["string — helpful hints, at least one"],
  "expectedTimeComplexity": "string — like O(n log n)",
  "expectedSpaceComplexity": "string — like O(n)"
}

Rules:
- Problem must be realistic and solvable.
- Test cases must be correct — the expected output must match running the correct solution against the stdin.
- Visible test cases are simple examples. Hidden test cases cover edge cases and large inputs.
- For each test case, provide: 'input' (human-readable, shown in UI), 'stdin' (raw stdin for execution with values separated by newlines, no brackets/commas), and 'expectedOutput' (raw stdout expected from the program).
- Time and space complexity must match the intended optimal solution.
- Generate at least 2 visible and 3 hidden test cases.

Code separation rules (CRITICAL):
The final program will be assembled by the platform exactly like this:
  platform-provided helper code (includes/imports) + starterCode (user-edited) + driverCode

driverCode MUST:
- Contain ONLY the entry point logic.
- Reference the user's Solution class or solve function (which is defined in starterCode).
- NOT contain any #include, import, using namespace std, or class definitions.
- NOT redefine the Solution class, the solve function, or any symbol already defined in starterCode.
- Read input from stdin and print output to stdout.

Driver code conventions for ${language}:
${DRIVER_CODE_CONVENTIONS[language]}

Starter code conventions for ${language}:
${STARTER_CODE_CONVENTIONS[language]}`;
}

export function buildUserPrompt(
  userPrompt: string,
  language: Language,
  difficulty?: Difficulty,
): string {
  const diff = difficulty ?? "any";
  return `Generate a ${diff} difficulty coding problem based on this description: "${userPrompt}"
Language: ${language}`;
}
