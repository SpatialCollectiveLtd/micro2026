"use client"
import { useEffect } from 'react'

export default function ConfirmationModal({ open, title = 'Are you sure?', message, confirmText = 'Confirm', cancelText = 'Cancel', onConfirm, onCancel, loading = false }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === 'Escape') onCancel?.() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onCancel])

  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" onClick={onCancel}>
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/60 p-5 text-left shadow-xl backdrop-blur-md dark:border-neutral-800/60 dark:bg-neutral-900/60" onClick={(e) => e.stopPropagation()}>
        <div className="mb-2 text-lg font-semibold">{title}</div>
        {message && <div className="mb-4 text-sm text-neutral-700 dark:text-neutral-300">{message}</div>}
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onCancel} className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm dark:border-neutral-700">{cancelText}</button>
          <button type="button" disabled={loading} onClick={onConfirm} className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50">{loading ? 'Working…' : confirmText}</button>
        </div>
      </div>
    </div>
  )
}
