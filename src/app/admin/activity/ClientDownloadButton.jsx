"use client"
import React from 'react'
import Button from '@/components/ui/button'

export default function ClientDownloadButton() {
  const [gen, setGen] = React.useState(false)
  return (
    <a href="/api/admin/reports/activity?format=csv" onClick={() => setGen(true)}>
      <Button disabled={gen}>
        {gen ? (
          <span className="inline-flex items-center gap-2">
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            Generating…
          </span>
        ) : (
          'Download CSV'
        )}
      </Button>
    </a>
  )
}
