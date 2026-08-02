'use client'

import { useState } from 'react'
import MonacoEditor from '@/components/MonacoEditor'
import Spinner from '@/components/Spinner'
import { generateProblem } from '@/services/test'
import { submitCode } from '@/services/submissions'

interface ProblemData {
  starterCode: string
  driverCode?: string
  visibleTestCases: { input: string; stdin: string; expectedOutput: string }[]
  hiddenTestCases: { input: string; stdin: string; expectedOutput: string }[]
  language: string
}

interface TestResult {
  passed: boolean
  visible: boolean
  input: string
  expectedOutput: string
  actualOutput: string
  stderr: string | null
}

export default function EditorPage() {
  const [prompt, setPrompt] = useState('')
  const [code, setCode] = useState('// write your solution here')
  const [response, setResponse] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [problemData, setProblemData] = useState<ProblemData | null>(null)

  const [results, setResults] = useState<TestResult[] | null>(null)
  const [passed, setPassed] = useState(0)
  const [total, setTotal] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const handleExecute = async () => {
    if (!prompt.trim()) return
    setLoading(true)
    setError(null)
    setResponse(null)
    setResults(null)
    setProblemData(null)
    try {
      const result = await generateProblem(prompt)
      setResponse(JSON.stringify(result, null, 2))
      if (result?.data?.starterCode) {
        setCode(result.data.starterCode)
      }
      if (result?.data) {
        setProblemData({
          starterCode: result.data.starterCode,
          driverCode: result.data.driverCode,
          visibleTestCases: result.data.visibleTestCases ?? [],
          hiddenTestCases: result.data.hiddenTestCases ?? [],
          language: 'cpp',
        })
      }
    } catch {
      setError('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!problemData) return
    setSubmitting(true)
    setSubmitError(null)
    setResults(null)
    try {
      const res = await submitCode({
        userCode: code,
        driverCode: problemData.driverCode ?? '',
        language: problemData.language,
        visibleTestCases: problemData.visibleTestCases,
        hiddenTestCases: problemData.hiddenTestCases,
      })
      setPassed(res.passed)
      setTotal(res.total)
      setResults(res.results)
    } catch {
      setSubmitError('Submission failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen p-6 gap-4">
      <h1 className="text-2xl font-bold">Problem Generator</h1>

      <div className="flex gap-3">
        <input
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter the prompt to generate the problem"
          className="flex-1 border border-gray-300 rounded px-4 py-2 text-base outline-none focus:border-blue-500"
        />
        <button
          onClick={handleExecute}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold px-6 py-2 rounded cursor-pointer disabled:cursor-not-allowed"
        >
          Execute
        </button>
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-gray-600">
          <Spinner />
          <span>Generating problem...</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-300 text-red-700 rounded p-4">
          {error}
        </div>
      )}

      {response && (
        <div className="bg-gray-50 border border-gray-300 rounded p-4 overflow-auto max-h-80">
          <pre className="text-sm text-gray-800 whitespace-pre-wrap">{response}</pre>
        </div>
      )}

      <div className="flex-1 border border-gray-300 rounded overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-4 py-2 bg-gray-100 border-b border-gray-300">
          <span className="text-sm font-medium text-gray-700">Solution</span>
          {problemData && (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white text-sm font-semibold px-4 py-1.5 rounded cursor-pointer disabled:cursor-not-allowed"
            >
              {submitting ? 'Running...' : 'Submit'}
            </button>
          )}
        </div>
        <MonacoEditor
          value={code}
          onChange={(v) => setCode(v ?? '')}
          language={problemData?.language ?? 'cpp'}
        />
      </div>

      {submitting && (
        <div className="flex items-center gap-2 text-gray-600">
          <Spinner />
          <span>Evaluating test cases...</span>
        </div>
      )}

      {submitError && (
        <div className="bg-red-50 border border-red-300 text-red-700 rounded p-4">
          {submitError}
        </div>
      )}

      {results && (
        <div className="border border-gray-300 rounded overflow-hidden">
          <div className="bg-gray-100 px-4 py-2 border-b border-gray-300 font-semibold text-gray-800">
            Results — {passed} / {total} passed
          </div>
          <div className="divide-y divide-gray-200">
            {results.map((r, i) => (
              <div key={i} className={`px-4 py-3 text-sm ${r.passed ? 'bg-green-50' : 'bg-red-50'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`inline-block w-2 h-2 rounded-full ${r.passed ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span className="font-medium">Test #{i + 1}</span>
                  <span className="text-xs text-gray-500">{r.visible ? 'Visible' : 'Hidden'}</span>
                </div>
                {r.visible && (
                  <div className="grid grid-cols-3 gap-2 mt-1 text-xs text-gray-600">
                    <div><span className="font-medium">Input:</span> {r.input}</div>
                    <div><span className="font-medium">Expected:</span> {r.expectedOutput}</div>
                    <div><span className="font-medium">Got:</span> {r.actualOutput}</div>
                  </div>
                )}
                {!r.visible && (
                  <div className="text-xs text-gray-500">Hidden test case</div>
                )}
                {r.stderr && (
                  <div className="mt-1 text-xs text-red-600">stderr: {r.stderr}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
