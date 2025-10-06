"use client"
import { useEffect, useState } from 'react'
import Input from '@/components/ui/input'
import Textarea from '@/components/ui/textarea'
import Checkbox from '@/components/ui/checkbox'
import Button from '@/components/ui/button'
import { Table, THead, TR, TH, TD } from '@/components/ui/table'

export default function NoticesPage() {
  const [settlements, setSettlements] = useState([])
  const [notices, setNotices] = useState([])
  const [form, setForm] = useState({ title: '', message: '', priority: 'MEDIUM', allUsers: true, settlements: [] })

  useEffect(() => {
    const load = async () => {
      const sres = await fetch('/api/admin/settlements'); const s = await sres.json(); if (s.ok) setSettlements(s.settlements)
      await reload()
    }
    load()
  }, [])

  async function reload() {
    const nres = await fetch('/api/admin/notices'); const n = await nres.json(); if (n.ok) setNotices(n.notices)
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <h1 className="text-2xl font-semibold">Notices</h1>

      <form action="/api/admin/notices" method="post" className="space-y-3 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <div className="text-xs text-neutral-500 mb-1">Title</div>
            <Input name="title" required />
          </div>
          <div>
            <div className="text-xs text-neutral-500 mb-1">Priority</div>
            <select name="priority" className="block w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900" defaultValue="MEDIUM">
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
          </div>
        </div>
        <div>
          <div className="text-xs text-neutral-500 mb-1">Message</div>
          <Textarea name="message" required />
        </div>
        <div className="flex items-center gap-2"><Checkbox name="allUsers" defaultChecked /><span className="text-sm">All Users</span></div>
        <div>
          <div className="text-xs text-neutral-500 mb-2">Target Settlements (unchecked All Users)</div>
          <div className="grid gap-2 sm:grid-cols-2">
            {settlements.map(s => (
              <label key={s.id} className="flex items-center gap-2 text-sm"><Checkbox name="settlements" value={s.id} /><span>{s.name}</span></label>
            ))}
          </div>
        </div>
        <div className="flex justify-end"><Button type="submit">Create Notice</Button></div>
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
