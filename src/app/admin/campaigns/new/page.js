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
  const [duplicates, setDuplicates] = useState([])
  const [originalCsvText, setOriginalCsvText] = useState('')
  const [showDupDialog, setShowDupDialog] = useState(false)

  const resetForm = () => {
    setTitle('')
    setQuestion('')
    setFile(null)
    setSelected(new Set())
    setDuplicates([])
    setOriginalCsvText('')
    setShowDupDialog(false)
    setMsg({ type: '', text: '' })
  }

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
      const text = await file.text()
      setOriginalCsvText(text)
      const form = new FormData()
      form.append('title', title.trim())
      form.append('question', question.trim())
      form.append('file', new File([text], file.name, { type: file.type || 'text/csv' }))
      for (const id of selected) form.append('settlements', id)

      const res = await fetch('/api/admin/campaigns', { method: 'POST', body: form })
      const data = await res.json().catch(() => ({ ok: false, error: 'Unexpected server response' }))
      if (!res.ok || data?.ok === false) {
        if (res.status === 409 && data?.duplicates?.length) {
          setDuplicates(data.duplicates)
            setShowDupDialog(true)
            setMsg({ type: 'error', text: 'Duplicate URLs detected. Review below.' })
        } else {
          setMsg({ type: 'error', text: data?.error || 'Upload failed' })
        }
        return
      }
  setMsg({ type: 'success', text: data.message || 'Campaign created successfully' })
  // Reset form on success
  resetForm()
    } catch (err) {
      setMsg({ type: 'error', text: 'Network error. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  const onSkipDuplicates = async () => {
    if (!originalCsvText) return
    setLoading(true)
    setMsg({ type: '', text: '' })
    try {
      // Build filtered CSV excluding duplicateIndex lines (keep first occurrences).
      const dupIdx = new Set(duplicates.map(d => d.duplicateIndex))
      const lines = originalCsvText.split(/\r?\n/)
      const filtered = lines.filter((_, idx) => !dupIdx.has(idx) && _.trim())
      if (!filtered.length) {
        setMsg({ type: 'error', text: 'All lines were duplicates—please upload a corrected CSV.' })
        return
      }
      const blob = new Blob([filtered.join('\n')], { type: 'text/csv' })
      const patchedFile = new File([blob], (file?.name || 'images.csv').replace(/\.csv$/i,'') + '_dedup.csv', { type: 'text/csv' })
      const form = new FormData()
      form.append('title', title.trim())
      form.append('question', question.trim())
      form.append('file', patchedFile)
      for (const id of selected) form.append('settlements', id)
      const res = await fetch('/api/admin/campaigns', { method: 'POST', body: form })
      const data = await res.json().catch(() => ({ ok: false, error: 'Unexpected server response' }))
      if (!res.ok || data?.ok === false) {
        setMsg({ type: 'error', text: data?.error || 'Upload failed after de-dup' })
        return
      }
  setMsg({ type: 'success', text: data.message || 'Campaign created (duplicates removed).' })
  resetForm()
    } catch (e) {
      setMsg({ type: 'error', text: 'Failed to re-submit without duplicates.' })
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

      {showDupDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="max-h-[80vh] w-full max-w-2xl overflow-hidden rounded-xl border border-white/15 bg-white/90 p-6 shadow-2xl backdrop-blur-md dark:border-neutral-700 dark:bg-neutral-900/80">
            <h2 className="text-lg font-semibold mb-2">Duplicate Image URLs Detected</h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">We found duplicate URL entries in your CSV. We keep the first occurrence and remove later duplicates. Choose &quot;Remove Duplicates &amp; Continue&quot; to proceed now, or &quot;Cancel Import&quot; to discard this upload and submit a corrected CSV.</p>
            <div className="mb-4 max-h-56 overflow-auto rounded border border-neutral-200 dark:border-neutral-700 bg-white/60 dark:bg-neutral-800/40">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                  <tr>
                    <th className="px-2 py-1">First Line</th>
                    <th className="px-2 py-1">Dup Line</th>
                    <th className="px-2 py-1">URL</th>
                  </tr>
                </thead>
                <tbody>
                  {duplicates.map(d => (
                    <tr key={d.url + d.duplicateIndex} className="border-t border-neutral-200 dark:border-neutral-700">
                      <td className="px-2 py-1 font-mono">{d.firstIndex + 1}</td>
                      <td className="px-2 py-1 font-mono text-red-600 dark:text-red-400">{d.duplicateIndex + 1}</td>
                      <td className="px-2 py-1 break-all">{d.url}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-end gap-3">
              <Button variant="outline" type="button" onClick={resetForm}>Cancel Import</Button>
              <Button type="button" onClick={onSkipDuplicates} disabled={loading}>{loading ? 'Processing…' : 'Remove Duplicates & Continue'}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
