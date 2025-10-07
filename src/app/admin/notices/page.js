"use client"
import { useEffect, useState } from 'react'
import Input from '@/components/ui/input'
import Textarea from '@/components/ui/textarea'
import Checkbox from '@/components/ui/checkbox'
import Button from '@/components/ui/button'
import { Table, THead, TR, TH, TD } from '@/components/ui/table'

export default function NoticesPage() {
  const [settlements, setSettlements] = useState([])
  const [users, setUsers] = useState([])
  const [notices, setNotices] = useState([])
  const [form, setForm] = useState({ title: '', message: '', priority: 'MEDIUM', allUsers: true, settlements: [] })
  const [msg, setMsg] = useState({ type: '', text: '' })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const load = async () => {
      const sres = await fetch('/api/admin/settlements'); const s = await sres.json(); if (s.ok) setSettlements(s.settlements)
      const ures = await fetch('/api/admin/users?pageSize=100'); const u = await ures.json(); if (u.ok) setUsers(u.users)
      await reload()
    }
    load()
  }, [])

  async function reload() {
    const nres = await fetch('/api/admin/notices'); const n = await nres.json(); if (n.ok) setNotices(n.notices)
  }

  const valid = form.title.trim() && form.message.trim() && (!form.allUsers ? (form.settlements.length > 0 || form.userId) : true)

  async function onSubmit(e) {
    e.preventDefault()
    setMsg({ type: '', text: '' })
    if (!valid) { setMsg({ type: 'error', text: 'Please fill Title and Message, and select settlements when All Users is unchecked.' }); return }
    setLoading(true)
    try {
      const fd = new FormData()
      fd.append('title', form.title.trim())
      fd.append('message', form.message.trim())
      fd.append('priority', form.priority)
      if (form.allUsers) fd.append('allUsers', 'on')
  if (form.userId) fd.append('userId', form.userId)
      for (const sid of form.settlements) fd.append('settlements', sid)
      const res = await fetch('/api/admin/notices', { method: 'POST', body: fd })
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Create failed' }))
        setMsg({ type: 'error', text: data?.error || 'Create failed' })
        return
      }
      setMsg({ type: 'success', text: 'Notice created successfully' })
      setForm({ title: '', message: '', priority: 'MEDIUM', allUsers: true, settlements: [] })
      await reload()
    } finally { setLoading(false) }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <h1 className="text-2xl font-semibold">Notices</h1>

      <form onSubmit={onSubmit} className="space-y-3 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <div className="text-xs text-neutral-500 mb-1">Title</div>
            <Input name="title" value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))} required />
            {!form.title.trim() && <div className="mt-1 text-xs text-red-600">Title is required</div>}
          </div>
          <div>
            <div className="text-xs text-neutral-500 mb-1">Priority</div>
            <select name="priority" className="block w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900" value={form.priority} onChange={(e) => setForm(f => ({ ...f, priority: e.target.value }))}>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
          </div>
        </div>
        <div>
          <div className="text-xs text-neutral-500 mb-1">Target User (optional)</div>
          <select className="block w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900" value={form.userId || ''} onChange={(e) => setForm(f => ({ ...f, userId: e.target.value || null }))}>
            <option value="">— None —</option>
            {users.map(u => <option key={u.id} value={u.id}>{u.name || u.phone}</option>)}
          </select>
          <div className="mt-1 text-xs text-neutral-500">If set, this notice will also appear for the selected user.</div>
        </div>
        <div>
          <div className="text-xs text-neutral-500 mb-1">Message</div>
          <Textarea name="message" value={form.message} onChange={(e) => setForm(f => ({ ...f, message: e.target.value }))} required />
          {!form.message.trim() && <div className="mt-1 text-xs text-red-600">Message is required</div>}
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" checked={form.allUsers} onChange={(e) => setForm(f => ({ ...f, allUsers: e.target.checked, settlements: e.target.checked ? [] : f.settlements }))} />
          <span className="text-sm">All Users</span>
        </div>
        <div>
          <div className="text-xs text-neutral-500 mb-2">Target Settlements (unchecked All Users)</div>
          <div className="grid gap-2 sm:grid-cols-2">
            {settlements.map(s => {
              const checked = form.settlements.includes(s.id)
              return (
                <label key={s.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    disabled={form.allUsers}
                    checked={checked}
                    onChange={(e) => setForm(f => ({ ...f, settlements: e.target.checked ? [...f.settlements, s.id] : f.settlements.filter(x => x !== s.id) }))}
                  />
                  <span className={form.allUsers ? 'opacity-50' : ''}>{s.name}</span>
                </label>
              )
            })}
          </div>
          {!form.allUsers && form.settlements.length === 0 && <div className="mt-1 text-xs text-red-600">Select at least one settlement</div>}
        </div>
        {msg.text && (
          <div className={msg.type === 'success' ? 'rounded-md border border-green-400/30 bg-green-500/10 p-2 text-sm text-green-700' : 'rounded-md border border-red-400/30 bg-red-500/10 p-2 text-sm text-red-700'}>
            {msg.text}
          </div>
        )}
        <div className="flex justify-end"><Button type="submit" disabled={!valid || loading}>{loading ? 'Creating…' : 'Create Notice'}</Button></div>
      </form>

      <Table>
        <THead>
          <tr>
            <TH>Title</TH>
            <TH>Priority</TH>
            <TH>Audience</TH>
            <TH>Active</TH>
            <TH>Created</TH>
            <TH>Actions</TH>
          </tr>
        </THead>
        <tbody>
          {notices.map(n => (
            <TR key={n.id}>
              <TD>{n.title}</TD>
              <TD>{n.priority}</TD>
              <TD>{n.allUsers ? 'All Users' : (n.settlements?.map(x => x.settlement.name).join(', ') || '-')}</TD>
              <TD>{n.active ? 'Yes' : 'No'}</TD>
              <TD>{new Date(n.createdAt).toLocaleString()}</TD>
              <TD>
                <form action={`/api/admin/notices/${n.id}`} method="post" onSubmit={async (e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); await fetch(e.currentTarget.action, { method: 'PATCH', body: fd }); await reload() }} className="inline">
                  <input type="hidden" name="title" defaultValue={n.title} />
                  <input type="hidden" name="message" defaultValue={n.message} />
                  <input type="hidden" name="priority" defaultValue={n.priority} />
                  <input type="hidden" name="allUsers" defaultValue={n.allUsers ? 'on' : ''} />
                  <input type="hidden" name="active" defaultValue={n.active ? 'on' : ''} />
                  <Button variant="outline" type="submit">Toggle Save</Button>
                </form>
                <form action={`/api/admin/notices/${n.id}`} method="post" onSubmit={async (e) => { e.preventDefault(); if (!confirm('Delete notice?')) return; await fetch(e.currentTarget.action, { method: 'DELETE' }); await reload() }} className="inline ml-2">
                  <Button variant="outline" type="submit">Delete</Button>
                </form>
              </TD>
            </TR>
          ))}
        </tbody>
      </Table>
    </div>
  )
}
