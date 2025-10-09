"use client"
import WorkerLayout from '@/app/(worker)/layout'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch'
import Skeleton from '@/components/Skeleton'

export default function TasksPage() {
  const [task, setTask] = useState(null)
  const [loading, setLoading] = useState(true)
  const [answering, setAnswering] = useState(false)
  const [transition, setTransition] = useState(false)
  const [imgSize, setImgSize] = useState({ w: 0, h: 0 })
  const [progress, setProgress] = useState({ completedToday: 0, dailyTarget: 0 })
  const [noneRemaining, setNoneRemaining] = useState(false)
  const viewRef = useRef(null)

  const fetchNext = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/tasks/next')
    const json = await res.json()
    setTask(json.task)
    setProgress(json.progress || { completedToday: 0, dailyTarget: 0 })
    setNoneRemaining(Boolean(json.noneRemaining))
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchNext()
  }, [fetchNext])

  const onAnswer = useCallback(async (ans) => {
    if (!task || answering) return
    setAnswering(true)
    // slide out
    setTransition(true)
    await new Promise((r) => setTimeout(r, 250))
    const res = await fetch('/api/tasks/answer', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ taskId: task.id, answer: ans }),
    })
    if (!res.ok) {
      // roll back animation on error
      setTransition(false)
      setAnswering(false)
      return
    }
    // load next
    await fetchNext()
    // slide in
    setTransition(false)
    setAnswering(false)
  }, [task, answering, fetchNext])

  const content = useMemo(() => {
    if (loading) return (
      <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
        <Skeleton className="h-[45dvh] w-full rounded-lg md:h-[55dvh] lg:h-[60dvh]" />
        <div className="mt-4">
          <Skeleton className="h-6 w-2/3" />
        </div>
      </div>
    )
    if (!task && noneRemaining) {
      return (
        <div className="grid place-items-center rounded-2xl border border-white/10 bg-white/5 p-8 text-center shadow-xl backdrop-blur-md dark:border-neutral-800/60 dark:bg-neutral-900/60">
          <div className="mb-2 text-2xl font-semibold">All tasks complete</div>
          <div className="text-sm text-neutral-500">You’ve finished all available tasks for now. Check back later.</div>
        </div>
      )
    }
    if (!task) return <div className="p-6 text-sm text-neutral-500">Loading next task…</div>
    return (
      <div className={`transition-transform duration-300 ${transition ? '-translate-x-8 opacity-0' : 'translate-x-0 opacity-100'}`}>
        {/* Progress + Fullscreen */}
        <div className="mb-3 flex items-center justify-between">
          <div className="text-sm font-medium">Progress: {progress.completedToday} / {progress.dailyTarget || '—'} today</div>
          <button
            className="rounded-md border border-neutral-200 px-3 py-1.5 text-sm dark:border-neutral-800"
            onClick={() => {
              const el = viewRef.current
              if (!el) return
              if (document.fullscreenElement) {
                document.exitFullscreen().catch(() => {})
              } else {
                el.requestFullscreen?.().catch(() => {})
              }
            }}
          >
            Fullscreen
          </button>
        </div>

        {/* Viewer area */}
        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-950 pb-6">
          {/* Immersive-only: bounded zoom & pan (constrained container) */}
          <div ref={viewRef} className="relative z-0 w-full overflow-hidden rounded-lg bg-black h-[45dvh] sm:h-[50dvh] md:h-[60dvh] max-h-[70dvh]">
            <TransformWrapper
              limitToBounds
              centerOnInit
              doubleClick={{ disabled: false, step: 0.7 }}
              wheel={{ step: 0.15 }}
              pinch={{ step: 0.15 }}
              minScale={1}
              maxScale={5}
            >
              <TransformComponent wrapperClass="h-full w-full" contentClass="flex h-full w-full items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={task.image.url}
                  alt="task image"
                  className="max-h-full max-w-full select-none"
                  draggable={false}
                  onLoad={(e) => {
                    const { naturalWidth, naturalHeight } = e.currentTarget
                    if (naturalWidth && naturalHeight) setImgSize({ w: naturalWidth, h: naturalHeight })
                  }}
                  onError={(e) => { e.currentTarget.style.display='none'; const holder=document.createElement('div'); holder.className='flex h-full w-full items-center justify-center text-sm text-red-300'; holder.textContent='The image cannot be loaded'; e.currentTarget.parentElement?.appendChild(holder) }}
                />
              </TransformComponent>
            </TransformWrapper>
          </div>

          {/* Question */}
          <div className="relative z-10 mt-4 rounded-lg border border-neutral-200 bg-white p-3 text-base shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            {task.image.question}
          </div>

          {/* Answer buttons */}
          <div className="relative z-10 mt-4 flex items-center gap-3">
            <button
              disabled={answering}
              onClick={() => onAnswer(true)}
              className="flex-1 rounded-md bg-red-600 px-4 py-3 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
            >
              {answering ? <span className="inline-flex items-center gap-2"><span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> Submitting…</span> : 'Yes'}
            </button>
            <button
              disabled={answering}
              onClick={() => onAnswer(false)}
              className="flex-1 rounded-md border border-neutral-900 px-4 py-3 text-sm font-semibold text-neutral-900 hover:bg-neutral-100 disabled:opacity-50 dark:border-white dark:text-white dark:hover:bg-neutral-800"
            >
              {answering ? <span className="inline-flex items-center gap-2"><span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-neutral-900/30 border-t-neutral-900 dark:border-white/30 dark:border-t-white" /> Submitting…</span> : 'No'}
            </button>
          </div>
        </div>
      </div>
    )
  }, [loading, task, answering, transition, onAnswer, imgSize, noneRemaining, progress.completedToday, progress.dailyTarget])

  return (
    <WorkerLayout>
      <div className="w-full px-3 pb-24 sm:px-4">{content}</div>
    </WorkerLayout>
  )
}
