"use client"
import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import Input from '@/components/ui/input'
import { Table, THead, TR, TH, TD } from '@/components/ui/table'
import Button from '@/components/ui/button'
import Checkbox from '@/components/ui/checkbox'
import Select from '@/components/ui/select'
import ConfirmationModal from '@/components/ui/confirmation-modal'

export default function UsersPage() {
  const [users, setUsers] = useState([])
  const [settlements, setSettlements] = useState([])
  const [filters, setFilters] = useState({ phone: '', role: '', settlementId: '', page: 1, pageSize: 20, sort: 'createdAt:desc' })
  const [total, setTotal] = useState(0)
  const [showCreate, setShowCreate] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '', role: 'WORKER', settlementId: '' })
  const [edit, setEdit] = useState({ open: false, id: '', name: '', phone: '', settlementId: '' })
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState({ type: '', text: '' })
  const [importState, setImportState] = useState({ uploading: false, file: null, result: null, error: '' })
  const [confirm, setConfirm] = useState({ open: false, action: null, user: null, loading: false })

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

  const roles = useMemo(() => ['WORKER', 'ADMIN'], [])
  const roleOptions = useMemo(() => [{ value: '', label: 'All' }, ...roles.map(r => ({ value: r, label: r }))], [roles])
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
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowImport(true)}>Import CSV</Button>
          <Button onClick={() => setShowCreate(true)}>Create New User</Button>
        </div>
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
              <TD>
                {u.name ? (
                  <Link href={`/admin/users/${u.id}`} className="text-blue-600 hover:underline dark:text-blue-400">{u.name}</Link>
                ) : (
                  <Link href={`/admin/users/${u.id}`} className="text-blue-600 hover:underline dark:text-blue-400">-</Link>
                )}
              </TD>
              <TD className="font-medium">{u.phone}</TD>
              <TD>{u.role}</TD>
              <TD>{u.settlement?.name || '-'}</TD>
              <TD>{u.active ? 'Active' : 'Inactive'}</TD>
              <TD>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setEdit({ open: true, id: u.id, name: u.name || '', phone: u.phone, settlementId: u.settlement?.id || '' })}>Edit</Button>
                  <Button variant="outline" onClick={() => setConfirm({ open: true, action: 'toggle-active', user: u, loading: false })}>{u.active ? 'Suspend' : 'Unsuspend'}</Button>
                  <Button variant="outline" onClick={() => setConfirm({ open: true, action: 'delete', user: u, loading: false })}>Delete</Button>
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

      {showImport && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" onClick={() => setShowImport(false)}>
          <div className="w-full max-w-lg rounded-xl border border-neutral-200 bg-white p-4 shadow-lg dark:border-neutral-800 dark:bg-neutral-950" onClick={(e) => e.stopPropagation()}>
            <div className="mb-3 text-lg font-semibold">Import Users from CSV</div>
            <div className="mb-3 text-sm text-neutral-600 dark:text-neutral-300">
              Upload a CSV with headers: <span className="font-mono">name</span>, <span className="font-mono">phone</span>, <span className="font-mono">settlementName</span>.
              Optional headers: <span className="font-mono">role</span> (WORKER/ADMIN), <span className="font-mono">active</span> (true/false). Max 5MB.
            </div>
              <form className="space-y-3" onSubmit={async (e) => {
              e.preventDefault()
              setImportState(s => ({ ...s, uploading: true, result: null, error: '' }))
              const fd = new FormData(e.currentTarget)
              try {
                const res = await fetch('/api/admin/users/import', { method: 'POST', body: fd })
                const data = await res.json()
                if (!res.ok || !data.ok) throw new Error(data?.error || 'Import failed')
                setImportState(s => ({ ...s, uploading: false, result: data }))
                await loadData(filters)
              } catch (err) {
                setImportState(s => ({ ...s, uploading: false, error: err.message || 'Import failed' }))
              }
            }}>
              <input type="file" name="file" accept=".csv" required className="block w-full text-sm file:mr-4 file:rounded-md file:border-0 file:bg-neutral-100 file:px-3 file:py-1.5 file:text-sm file:font-medium hover:file:bg-neutral-200 dark:file:bg-neutral-800 dark:hover:file:bg-neutral-700" />
              <div className="mt-2 rounded-md border border-white/15 bg-white/5 p-2 text-xs text-neutral-600 backdrop-blur-sm dark:border-neutral-800/60 dark:bg-neutral-900/40 dark:text-neutral-300">
                <div className="font-medium mb-1">Example format</div>
                <pre className="whitespace-pre-wrap">name,phone,settlementName,role,active
Jane Worker,0712345678,Nairobi,WORKER,true
John Admin,0799988877,,ADMIN,false</pre>
                <div className="mt-1">Headers can be in any order. role defaults to WORKER, active defaults to true.</div>
              </div>
              {importState.error && (
                <div className="rounded-md border border-red-400/30 bg-red-500/10 p-2 text-sm text-red-700">{importState.error}</div>
              )}
              {importState.result && (
                <div className="rounded-md border border-neutral-200 p-3 text-sm dark:border-neutral-800">
                  <div className="mb-2 font-medium">Summary</div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>Processed: <span className="font-medium">{importState.result.processed}</span></div>
                    <div>Created: <span className="font-medium">{importState.result.created}</span></div>
                    <div>Skipped: <span className="font-medium">{importState.result.skipped}</span></div>
                  </div>
                  {importState.result.errors?.length > 0 && (
                    <div className="mt-2 max-h-40 overflow-auto">
                      <div className="mb-1 text-sm font-medium">Errors (showing up to 50):</div>
                      <ul className="list-disc pl-5 text-xs">
                        {importState.result.errors.map((e, i) => (
                          <li key={i}>Row {e.row}: {e.message}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
              <div className="flex justify-end gap-2">
                <Button variant="outline" type="button" onClick={() => setShowImport(false)}>Close</Button>
                <Button type="submit" disabled={importState.uploading}>{importState.uploading ? (<span className="inline-flex items-center gap-2"><span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> Importing…</span>) : 'Upload'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {edit.open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" onClick={() => setEdit(e => ({ ...e, open: false }))}>
          <div className="w-full max-w-md rounded-xl border border-neutral-200 bg-white p-4 shadow-lg dark:border-neutral-800 dark:bg-neutral-950" onClick={(e) => e.stopPropagation()}>
            <div className="mb-3 text-lg font-semibold">Edit User</div>
            <form className="space-y-3" onSubmit={async (e2) => {
              e2.preventDefault()
              setLoading(true)
              setMsg({ type: '', text: '' })
              try {
                const res = await fetch(`/api/admin/users/${edit.id}`, {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ name: edit.name || null, phone: edit.phone, settlementId: edit.settlementId || null })
                })
                const data = await res.json().catch(() => ({}))
                if (!res.ok || !data.ok) throw new Error(data?.error || 'Update failed')
                setEdit({ open: false, id: '', name: '', phone: '', settlementId: '' })
                await loadData(filters)
              } catch (err) {
                setMsg({ type: 'error', text: err.message || 'Update failed' })
              } finally {
                setLoading(false)
              }
            }}>
              <Input placeholder="Name (optional)" value={edit.name} onChange={(e) => setEdit(s => ({ ...s, name: e.target.value }))} />
              <div>
                <Input placeholder="Phone" value={edit.phone} onChange={(e) => setEdit(s => ({ ...s, phone: e.target.value }))} required />
                {!edit.phone && <div className="mt-1 text-xs text-red-600">Phone is required</div>}
              </div>
              <Select
                value={edit.settlementId ? { value: edit.settlementId, label: settlements.find(s => s.id === edit.settlementId)?.name || 'Selected' } : null}
                onChange={(opt) => setEdit(s => ({ ...s, settlementId: opt?.value || '' }))}
                options={[{ value: '', label: 'No Settlement' }, ...settlements.map(s => ({ value: s.id, label: s.name }))]}
              />
              {msg.text && (
                <div className={msg.type === 'error' ? 'rounded-md border border-red-400/30 bg-red-500/10 p-2 text-sm text-red-700' : 'rounded-md border border-green-400/30 bg-green-500/10 p-2 text-sm text-green-700'}>
                  {msg.text}
                </div>
              )}
              <div className="flex justify-end gap-2">
                <Button variant="outline" type="button" onClick={() => setEdit(e => ({ ...e, open: false }))}>Cancel</Button>
                <Button type="submit" disabled={loading || !edit.phone}>{loading ? 'Saving…' : 'Save Changes'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmationModal
        open={confirm.open}
        title={confirm.action === 'delete' ? 'Delete user?' : (confirm.user?.active ? 'Suspend user?' : 'Unsuspend user?')}
        message={confirm.action === 'delete' ? 'This action cannot be undone.' : (confirm.user?.active ? 'They will not be able to log in or access tasks.' : 'They will regain access to tasks and login.')}
        confirmText={confirm.action === 'delete' ? 'Delete' : (confirm.user?.active ? 'Suspend' : 'Unsuspend')}
        onCancel={() => setConfirm({ open: false, action: null, user: null, loading: false })}
        loading={confirm.loading}
        onConfirm={async () => {
          if (!confirm.user) return
          setConfirm((c) => ({ ...c, loading: true }))
          try {
            if (confirm.action === 'delete') {
              await fetch(`/api/admin/users/${confirm.user.id}`, { method: 'DELETE' })
            } else if (confirm.action === 'toggle-active') {
              const next = !confirm.user.active
              await fetch(`/api/admin/users/${confirm.user.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ active: next }) })
            }
            await loadData(filters)
            setConfirm({ open: false, action: null, user: null, loading: false })
          } catch {
            setConfirm({ open: false, action: null, user: null, loading: false })
          }
        }}
      />
    </div>
  )
}
