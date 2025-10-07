"use client"
export default function CampaignActions({ id, archived }) {
  return (
    <>
      {!archived ? (
        <button
          className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm text-red-700 dark:border-neutral-700"
          onClick={async () => {
            if (!confirm('Archive this campaign? It will no longer be visible to workers.')) return
            await fetch(`/api/admin/campaigns/${id}`, {
              method: 'PATCH',
              headers: { 'content-type': 'application/json' },
              body: JSON.stringify({ archived: true })
            })
            location.reload()
          }}
        >
          Archive
        </button>
      ) : (
        <button
          className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm text-green-700 dark:border-neutral-700"
          onClick={async () => {
            await fetch(`/api/admin/campaigns/${id}`, {
              method: 'PATCH',
              headers: { 'content-type': 'application/json' },
              body: JSON.stringify({ archived: false })
            })
            location.reload()
          }}
        >
          Unarchive
        </button>
      )}
      {archived && (
        <button
          className="rounded-md border border-red-300 bg-red-600 px-3 py-1.5 text-sm font-semibold text-white"
          onClick={async () => {
            if (!confirm('Permanently delete this campaign and all related tasks/responses? This cannot be undone.')) return
            const res = await fetch(`/api/admin/campaigns/${id}`, { method: 'DELETE' })
            if (res.ok) location.href = '/admin/campaigns'
          }}
        >
          Delete
        </button>
      )}
    </>
  )
}
