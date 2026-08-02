import { api } from '@/lib/api'

interface TestCasePayload {
  input: string
  stdin: string
  expectedOutput: string
}

interface SubmitPayload {
  userCode: string
  driverCode: string
  language: string
  visibleTestCases: TestCasePayload[]
  hiddenTestCases: TestCasePayload[]
}

interface TestResult {
  passed: boolean
  visible: boolean
  input: string
  expectedOutput: string
  actualOutput: string
  stderr: string | null
}

interface SubmitResponse {
  passed: number
  total: number
  results: TestResult[]
}

export async function submitCode(payload: SubmitPayload) {
  console.log('Submitting code with payload:', payload);
  const res = await api.post<SubmitResponse>('/submissions', payload)
  return res.data
}
