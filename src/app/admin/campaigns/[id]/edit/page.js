"use client"
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Input from '@/components/ui/input'
import Textarea from '@/components/ui/textarea'
import Button from '@/components/ui/button'

export default function EditCampaignPage({ params }) {
  const router = useRouter()
  const { id } = params

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [title, setTitle] = useState('')
  const [question, setQuestion] = useState('')

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        setLoading(true)
        const res = await fetch(`/api/admin/campaigns/${id}`, { cache: 'no-store' })
        if (!res.ok) throw new Error('Failed to load campaign')
        const data = await res.json()
        if (!cancelled) {
          setTitle(data.campaign?.title || '')
          setQuestion(data.campaign?.question || '')
        }
      } catch (e) {
        if (!cancelled) setError(e.message || 'Failed to load')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [id])

  async function onSave(e) {
    e.preventDefault()
    setError('')
    if (!title.trim()) {
      setError('Title is required')
      return
    }
    if (!question.trim()) {
      setError('Question is required')
      return
    }
    try {
      setSaving(true)
      const res = await fetch(`/api/admin/campaigns/${id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), question: question.trim() })
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || data?.ok === false) {
        throw new Error(data?.message || 'Failed to save changes')
      }
      router.push(`/admin/campaigns/${id}`)
    } catch (e) {
      setError(e.message || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-semibold">Edit Campaign</h1>
      {error && (
        <div className="mb-4 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-300">
          {error}
        </div>
      )}
      {loading ? (
        <div className="text-sm text-neutral-500">Loading…</div>
      ) : (
        <form onSubmit={onSave} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Title</label>
            <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Campaign title" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Question</label>
            <Textarea rows={4} value={question} onChange={e => setQuestion(e.target.value)} placeholder="What should workers answer?" />
          </div>
          <div className="flex items-center gap-2">
            <Button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
          </div>
        </form>
      )}
    </div>
  )
}
