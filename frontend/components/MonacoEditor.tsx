'use client'

import Editor, { OnMount } from '@monaco-editor/react'
import { useRef } from 'react'

interface MonacoEditorProps {
  value: string
  onChange: (value: string | undefined) => void
  language?: string
  height?: string
}

export default function MonacoEditor({
  value,
  onChange,
  language = 'cpp',
  height = '500px',
}: MonacoEditorProps) {
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null)

  const handleMount: OnMount = (editor) => {
    editorRef.current = editor
  }

  return (
    <Editor
      height={height}
      language={language}
      value={value}
      onChange={onChange}
      onMount={handleMount}
      theme="vs-dark"
      options={{
        fontSize: 14,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        padding: { top: 12 },
      }}
    />
  )
}