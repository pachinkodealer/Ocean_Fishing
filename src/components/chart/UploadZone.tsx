'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'

interface UploadZoneProps {
  onFile: (file: File) => void
  preview?: string | null
}

export function UploadZone({ onFile, preview }: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  function handleFile(file: File) {
    if (!file.type.startsWith('image/')) return
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be under 5MB')
      return
    }
    onFile(file)
  }

  return (
    <div
      className={`relative border-2 border-dashed rounded-xl transition-colors cursor-pointer
        ${dragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/30 hover:border-primary/50'}
        ${preview ? 'p-0 overflow-hidden' : 'p-10'}`}
      onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault()
        setDragging(false)
        const file = e.dataTransfer.files[0]
        if (file) handleFile(file)
      }}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
        }}
      />

      {preview ? (
        <img src={preview} alt="Chart preview" className="w-full rounded-xl object-contain max-h-80" />
      ) : (
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <div className="text-center">
            <p className="font-medium">Drop chart screenshot here</p>
            <p className="text-sm">or click to browse — PNG, JPG, WebP up to 5MB</p>
          </div>
          <Button variant="outline" size="sm" type="button">Choose File</Button>
        </div>
      )}
    </div>
  )
}
