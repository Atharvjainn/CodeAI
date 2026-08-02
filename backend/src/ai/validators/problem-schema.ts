import { z } from "zod";

const ExampleSchema = z.object({
  input: z.string().min(1, "Example input is required"),
  output: z.string().min(1, "Example output is required"),
  explanation: z.string().optional(),
});

const TestCaseSchema = z.object({
  input: z.string().min(1, "Test case input is required"),
  stdin: z.string().min(1, "Test case stdin is required"),
  expectedOutput: z.string().min(1, "Test case expected output is required"),
});

export const ProblemSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  slug: z
    .string()
    .min(1)
    .max(200)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be kebab-case"),
  difficulty: z.enum(["easy", "medium", "hard"]),
  tags: z.array(z.string().min(1)).min(1, "At least one tag is required"),
  problemStatement: z
    .string()
    .min(10, "Problem statement must be at least 10 characters"),
  detailedDescription: z
    .string()
    .min(10, "Detailed description must be at least 10 characters"),
  inputFormat: z.string().min(1, "Input format is required"),
  outputFormat: z.string().min(1, "Output format is required"),
  constraints: z
    .array(z.string().min(1))
    .min(1, "At least one constraint is required"),
  examples: z.array(ExampleSchema).min(1, "At least one example is required"),
  starterCode: z.string().min(1, "Starter code is required"),
  driverCode: z
    .string()
    .optional()
    .refine(
      (code) =>
        !code ||
        (!code.includes("#include") &&
          !code.includes("using namespace std") &&
          !code.includes("class Solution")),
      "Driver code must only contain the entry point: no includes, no namespace, no class definitions",
    ),
  hiddenTestCases: z
    .array(TestCaseSchema)
    .min(1, "At least one hidden test case is required"),
  visibleTestCases: z
    .array(TestCaseSchema)
    .min(1, "At least one visible test case is required"),
  hints: z.array(z.string()).min(0),
  expectedTimeComplexity: z
    .string()
    .min(1, "Expected time complexity is required"),
  expectedSpaceComplexity: z
    .string()
    .min(1, "Expected space complexity is required"),
});
