"use client"
import Label from '@/components/ui/label'
import Input from '@/components/ui/input'
import Textarea from '@/components/ui/textarea'
import Checkbox from '@/components/ui/checkbox'
import Button from '@/components/ui/button'
import FileUpload from '@/components/ui/file-upload'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'

export const dynamic = 'force-dynamic'

export default function NewCampaignPage() {
  const [settlements, setSettlements] = useState([])
  const [title, setTitle] = useState('')
  const [question, setQuestion] = useState('')
  const [selected, setSelected] = useState(new Set())
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState({ type: '', text: '' })

  useEffect(() => {
    ;(async () => {
      const res = await fetch('/api/settlements')
      const data = await res.json().catch(() => ({ ok: false }))
      if (data?.ok) setSettlements(data.settlements)
    })()
  }, [])

  const valid = title.trim() && question.trim() && file && selected.size > 0 && !loading

  const onSubmit = async (e) => {
    e.preventDefault()
    setMsg({ type: '', text: '' })
    if (!valid) {
      setMsg({ type: 'error', text: 'Please fill all required fields and select at least one settlement.' })
      return
    }
    setLoading(true)
    try {
      const form = new FormData()
      form.append('title', title.trim())
      form.append('question', question.trim())
      form.append('file', file)
      for (const id of selected) form.append('settlements', id)

      const res = await fetch('/api/admin/campaigns', { method: 'POST', body: form })
      const data = await res.json().catch(() => ({ ok: false, error: 'Unexpected server response' }))
      if (!res.ok || data?.ok === false) {
        setMsg({ type: 'error', text: data?.error || 'Upload failed' })
        return
      }
      setMsg({ type: 'success', text: data.message || 'Campaign created successfully' })
      // Reset minimal fields
      setTitle('')
      setQuestion('')
      setFile(null)
      setSelected(new Set())
    } catch (err) {
      setMsg({ type: 'error', text: 'Network error. Please try again.' })
    } finally {
      setLoading(false)
    }
  }
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <h1 className="text-2xl font-semibold">Create Campaign</h1>
      <form onSubmit={onSubmit} encType="multipart/form-data" className="space-y-6 rounded-2xl border border-white/15 bg-white/10 p-6 shadow-xl backdrop-blur-md dark:border-neutral-800/60 dark:bg-neutral-900/60">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Title</Label>
            <Input name="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
            {!title.trim() && <div className="mt-1 text-xs text-red-600">Title is required</div>}
          </div>
          <div>
            <Label>Image URLs CSV</Label>
            <div>
              <input type="file" accept=".csv" onChange={(e) => setFile(e.target.files?.[0] || null)} required className="block w-full text-sm file:mr-4 file:rounded-md file:border-0 file:bg-neutral-100 file:px-3 file:py-1.5 file:text-sm file:font-medium hover:file:bg-neutral-200 dark:file:bg-neutral-800 dark:hover:file:bg-neutral-700" />
              <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">CSV with a single image URL per line.</p>
            </div>
            {!file && <div className="mt-1 text-xs text-red-600">CSV file is required</div>}
          </div>
        </div>
        <div>
          <Label>Question</Label>
          <Textarea name="question" value={question} onChange={(e) => setQuestion(e.target.value)} required />
          {!question.trim() && <div className="mt-1 text-xs text-red-600">Question is required</div>}
        </div>
        <div>
          <Label className="mb-2">Target Settlements</Label>
          <div className="rounded-lg border border-white/15 bg-white/5 p-3 backdrop-blur-sm dark:border-neutral-800/60 dark:bg-neutral-900/40">
            <div className="grid gap-2 sm:grid-cols-2">
              {settlements.map((s) => {
                const checked = selected.has(s.id)
                return (
                  <label key={s.id} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => {
                        setSelected((prev) => {
                          const next = new Set(prev)
                          if (e.target.checked) next.add(s.id)
                          else next.delete(s.id)
                          return next
                        })
                      }}
                    />
                    <span>{s.name}</span>
                  </label>
                )
              })}
            </div>
          </div>
          {selected.size === 0 && <div className="mt-1 text-xs text-red-600">Select at least one settlement</div>}
        </div>
        {msg.text && (
          <div className={msg.type === 'success' ? 'rounded-md border border-green-400/30 bg-green-500/10 p-3 text-sm text-green-700' : 'rounded-md border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-700'}>
            {msg.text}
          </div>
        )}
        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" asChild>
            <Link href="/admin/campaigns">Cancel</Link>
          </Button>
          <Button type="submit" disabled={!valid}>{loading ? 'Creating…' : 'Create Campaign'}</Button>
        </div>
      </form>
    </div>
  )
}
