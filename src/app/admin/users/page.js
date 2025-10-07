"use client"
import { useCallback, useEffect, useMemo, useState } from 'react'
import Input from '@/components/ui/input'
import { Table, THead, TR, TH, TD } from '@/components/ui/table'
import Button from '@/components/ui/button'
import Checkbox from '@/components/ui/checkbox'

export default function UsersPage() {
  const [users, setUsers] = useState([])
  const [settlements, setSettlements] = useState([])
  const [filters, setFilters] = useState({ phone: '', role: '', settlementId: '', page: 1, pageSize: 20, sort: 'createdAt:desc' })
  const [total, setTotal] = useState(0)
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '', role: 'WORKER', settlementId: '' })
  const [loading, setLoading] = useState(false)

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
      const res = await fetch('/api/admin/settlements')
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
    if (!form.phone) return
    setLoading(true)
    try {
      const res = await fetch('/api/admin/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, settlementId: form.settlementId || null }) })
      const data = await res.json()
      if (data.ok) {
        setShowCreate(false)
        setForm({ name: '', phone: '', role: 'WORKER', settlementId: '' })
        await loadData(filters)
      }
    } finally { setLoading(false) }
  }

  const roles = ['WORKER', 'ADMIN']

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
          <select className="block w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900" value={filters.role} onChange={(e) => setFilters((f) => ({ ...f, role: e.target.value }))}>
            <option value="">All</option>
            {roles.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div>
          <div className="text-xs text-neutral-500 mb-1">Settlement</div>
          <select className="block w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900" value={filters.settlementId} onChange={(e) => setFilters((f) => ({ ...f, settlementId: e.target.value }))}>
            <option value="">All</option>
            {settlements.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div>
          <div className="text-xs text-neutral-500 mb-1">Sort</div>
          <select className="block w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900" value={filters.sort} onChange={(e) => setFilters((f) => ({ ...f, sort: e.target.value }))}>
            <option value="createdAt:desc">Newest</option>
            <option value="createdAt:asc">Oldest</option>
            <option value="name:asc">Name A→Z</option>
            <option value="name:desc">Name Z→A</option>
            <option value="phone:asc">Phone ↑</option>
            <option value="phone:desc">Phone ↓</option>
          </select>
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
              <Input placeholder="Phone" value={form.phone} onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))} required />
              <select className="block w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900" value={form.role} onChange={(e) => setForm(f => ({ ...f, role: e.target.value }))}>
                {roles.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
              <select className="block w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900" value={form.settlementId} onChange={(e) => setForm(f => ({ ...f, settlementId: e.target.value }))}>
                <option value="">No Settlement</option>
                {settlements.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              <div className="flex items-center gap-2 text-sm"><Checkbox checked={true} readOnly /> Active by default</div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" type="button" onClick={() => setShowCreate(false)}>Cancel</Button>
                <Button type="submit" disabled={loading}>{loading ? 'Creating…' : 'Create'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
