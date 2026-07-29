'use client'

import { useState } from 'react'
import MonacoEditor from '@/components/MonacoEditor'
import Spinner from '@/components/Spinner'
import { generateProblem } from '@/services/test'

export default function EditorPage() {
  const [prompt, setPrompt] = useState('')
  const [code, setCode] = useState('// write your solution here')
  const [response, setResponse] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleExecute = async () => {
    if (!prompt.trim()) return
    setLoading(true)
    setError(null)
    setResponse(null)
    try {
      const result = await generateProblem(prompt)
      setResponse(JSON.stringify(result, null, 2))
      if (result?.data?.starterCode) {
        setCode(result.data.starterCode)
      }
    } catch {
      setError('Something went wrong')
    } finally {
      setLoading(false)
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

      <div className="flex-1 border border-gray-300 rounded overflow-hidden">
        <MonacoEditor
          value={code}
          onChange={(v) => setCode(v ?? '')}
          language="cpp"
        />
      </div>
    </div>
  )
}