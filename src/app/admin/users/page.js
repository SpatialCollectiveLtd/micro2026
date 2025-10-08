"use client"
import { useCallback, useEffect, useMemo, useState } from 'react'
import Input from '@/components/ui/input'
import { Table, THead, TR, TH, TD } from '@/components/ui/table'
import Button from '@/components/ui/button'
import Checkbox from '@/components/ui/checkbox'
import Select from '@/components/ui/select'

export default function UsersPage() {
  const [users, setUsers] = useState([])
  const [settlements, setSettlements] = useState([])
  const [filters, setFilters] = useState({ phone: '', role: '', settlementId: '', page: 1, pageSize: 20, sort: 'createdAt:desc' })
  const [total, setTotal] = useState(0)
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '', role: 'WORKER', settlementId: '' })
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState({ type: '', text: '' })

  const loadData = useCallback(async (params = {}) => {
    const q = new URLSearchParams(params).toString()
    const res = await fetch(`/api/admin/users?${q}`)
    const data = await res.json()
    if (data.ok) { setUsers(data.users); setTotal(data.total) }
  }, [])
  // initial load only; subsequent fetches are triggered by onFilter/pagination actions
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { loadData(filters) }, [])
  useEffect(() => {
    const fn = async () => {
      const res = await fetch('/api/settlements')
      const data = await res.json()
      if (data.ok) setSettlements(data.settlements)
    }
    fn()
  }, [])

  const onFilter = async (e) => {
    e.preventDefault()
    await loadData(filters)
  }

  const createUser = async (e) => {
    e.preventDefault()
    setMsg({ type: '', text: '' })
    if (!form.phone) { setMsg({ type: 'error', text: 'Phone is required' }); return }
    setLoading(true)
    try {
      const res = await fetch('/api/admin/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, settlementId: form.settlementId || null }) })
      const data = await res.json()
      if (res.ok && data.ok) {
        setShowCreate(false)
        setForm({ name: '', phone: '', role: 'WORKER', settlementId: '' })
        await loadData(filters)
      } else {
        setMsg({ type: 'error', text: data?.error || 'Create failed' })
      }
    } finally { setLoading(false) }
  }

  const roles = ['WORKER', 'ADMIN']
  const roleOptions = useMemo(() => [{ value: '', label: 'All' }, ...roles.map(r => ({ value: r, label: r }))], [])
  const roleSelected = useMemo(() => roleOptions.find(o => o.value === filters.role) || roleOptions[0], [roleOptions, filters.role])
  const settlementOptions = useMemo(() => [{ value: '', label: 'All' }, ...settlements.map(s => ({ value: s.id, label: s.name }))], [settlements])
  const settlementSelected = useMemo(() => settlementOptions.find(o => o.value === filters.settlementId) || settlementOptions[0], [settlementOptions, filters.settlementId])
  const sortOptions = useMemo(() => ([
    { value: 'createdAt:desc', label: 'Newest' },
    { value: 'createdAt:asc', label: 'Oldest' },
    { value: 'name:asc', label: 'Name A→Z' },
    { value: 'name:desc', label: 'Name Z→A' },
    { value: 'phone:asc', label: 'Phone ↑' },
    { value: 'phone:desc', label: 'Phone ↓' },
  ]), [])
  const sortSelected = useMemo(() => sortOptions.find(o => o.value === filters.sort) || sortOptions[0], [sortOptions, filters.sort])

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Users</h1>
        <Button onClick={() => setShowCreate(true)}>Create New User</Button>
      </div>

  <form onSubmit={onFilter} className="grid gap-3 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-950 sm:grid-cols-5">
        <div>
          <div className="text-xs text-neutral-500 mb-1">Phone</div>
          <Input value={filters.phone} onChange={(e) => setFilters((f) => ({ ...f, phone: e.target.value }))} placeholder="Search phone" />
        </div>
        <div>
          <div className="text-xs text-neutral-500 mb-1">Role</div>
          <Select value={roleSelected} onChange={(opt) => setFilters(f => ({ ...f, role: opt.value }))} options={roleOptions} />
        </div>
        <div>
          <div className="text-xs text-neutral-500 mb-1">Settlement</div>
          <Select value={settlementSelected} onChange={(opt) => setFilters(f => ({ ...f, settlementId: opt.value }))} options={settlementOptions} />
        </div>
        <div>
          <div className="text-xs text-neutral-500 mb-1">Sort</div>
          <Select value={sortSelected} onChange={(opt) => setFilters(f => ({ ...f, sort: opt.value }))} options={sortOptions} />
        </div>
        <div className="flex items-end">
          <Button type="submit" className="w-full">Filter</Button>
        </div>
      </form>

      <Table>
        <THead>
          <tr>
            <TH>Name</TH>
            <TH>Phone</TH>
            <TH>Role</TH>
            <TH>Settlement</TH>
            <TH>Status</TH>
            <TH>Actions</TH>
          </tr>
        </THead>
        <tbody>
          {users.map(u => (
            <TR key={u.id}>
              <TD>{u.name || '-'}</TD>
              <TD className="font-medium">{u.phone}</TD>
              <TD>{u.role}</TD>
              <TD>{u.settlement?.name || '-'}</TD>
              <TD>{u.active ? 'Active' : 'Inactive'}</TD>
              <TD>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={async () => {
                    const name = prompt('Edit name (leave blank for none):', u.name || '')
                    if (name === null) return
                    await fetch(`/api/admin/users/${u.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name }) })
                    await loadData(filters)
                  }}>Edit</Button>
                  <Button variant="outline" onClick={async () => {
                    const next = !u.active
                    if (!next && !confirm('Suspend this user? They will not be able to access tasks.')) return
                    await fetch(`/api/admin/users/${u.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ active: next }) })
                    await loadData(filters)
                  }}>{u.active ? 'Suspend' : 'Unsuspend'}</Button>
                  <Button variant="outline" onClick={async () => {
                    if (!confirm('Delete this user? This cannot be undone.')) return
                    await fetch(`/api/admin/users/${u.id}`, { method: 'DELETE' })
                    await loadData(filters)
                  }}>Delete</Button>
                </div>
              </TD>
            </TR>
          ))}
        </tbody>
      </Table>

      <div className="flex items-center justify-between text-sm">
        <div>Showing {(filters.page-1)*filters.pageSize + 1}-{Math.min(filters.page*filters.pageSize, total)} of {total}</div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => { const page = Math.max(1, filters.page-1); setFilters(f => ({ ...f, page })); loadData({ ...filters, page }) }} disabled={filters.page <= 1}>Prev</Button>
          <Button variant="outline" onClick={() => { const page = filters.page + 1; if ((page-1)*filters.pageSize >= total) return; setFilters(f => ({ ...f, page })); loadData({ ...filters, page }) }} disabled={filters.page*filters.pageSize >= total}>Next</Button>
        </div>
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" onClick={() => setShowCreate(false)}>
          <div className="w-full max-w-md rounded-xl border border-neutral-200 bg-white p-4 shadow-lg dark:border-neutral-800 dark:bg-neutral-950" onClick={(e) => e.stopPropagation()}>
            <div className="mb-3 text-lg font-semibold">Create User</div>
            <form onSubmit={createUser} className="space-y-3">
              <Input placeholder="Name (optional)" value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} />
              <div>
                <Input placeholder="Phone" value={form.phone} onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))} required />
                {!form.phone && <div className="mt-1 text-xs text-red-600">Phone is required</div>}
              </div>
              <Select
                value={{ value: form.role, label: form.role }}
                onChange={(opt) => setForm(f => ({ ...f, role: opt.value }))}
                options={roles.map(r => ({ value: r, label: r }))}
              />
              <Select
                value={form.settlementId ? { value: form.settlementId, label: settlements.find(s => s.id === form.settlementId)?.name || 'Selected' } : null}
                onChange={(opt) => setForm(f => ({ ...f, settlementId: opt?.value || '' }))}
                options={[{ value: '', label: 'No Settlement' }, ...settlements.map(s => ({ value: s.id, label: s.name }))]}
              />
              <div className="flex items-center gap-2 text-sm"><Checkbox checked={true} readOnly /> Active by default</div>
              {msg.text && (
                <div className={msg.type === 'error' ? 'rounded-md border border-red-400/30 bg-red-500/10 p-2 text-sm text-red-700' : 'rounded-md border border-green-400/30 bg-green-500/10 p-2 text-sm text-green-700'}>
                  {msg.text}
                </div>
              )}
              <div className="flex justify-end gap-2">
                <Button variant="outline" type="button" onClick={() => setShowCreate(false)}>Cancel</Button>
                <Button type="submit" disabled={loading || !form.phone}>{loading ? 'Creating…' : 'Create'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
