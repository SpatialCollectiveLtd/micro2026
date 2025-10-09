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
  const containerRef = useRef(null)

  // Cross-browser fullscreen with graceful fallback (pseudo fullscreen)
  function useFullscreen(ref) {
    const [isFs, setIsFs] = useState(false)
    useEffect(() => {
      function onChange() {
        const active = Boolean(document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement)
        setIsFs(active)
      }
      document.addEventListener('fullscreenchange', onChange)
      document.addEventListener('webkitfullscreenchange', onChange)
      document.addEventListener('MSFullscreenChange', onChange)
      return () => {
        document.removeEventListener('fullscreenchange', onChange)
        document.removeEventListener('webkitfullscreenchange', onChange)
        document.removeEventListener('MSFullscreenChange', onChange)
      }
    }, [])
    const enter = useCallback(async () => {
      const el = ref.current
      if (!el) return
      try {
        if (el.requestFullscreen) await el.requestFullscreen()
        else if (el.webkitRequestFullscreen) await el.webkitRequestFullscreen()
        else if (el.msRequestFullscreen) await el.msRequestFullscreen()
        else throw new Error('no fs')
      } catch {
        // pseudo fullscreen fallback
        el.classList.add('pseudo-fs')
        document.documentElement.classList.add('no-scroll')
        setIsFs(true)
      }
    }, [ref])
    const exit = useCallback(async () => {
      try {
        if (document.exitFullscreen) await document.exitFullscreen()
        else if (document.webkitExitFullscreen) await document.webkitExitFullscreen()
        else if (document.msExitFullscreen) await document.msExitFullscreen()
      } catch {}
      const el = ref.current
      if (el) el.classList.remove('pseudo-fs')
      document.documentElement.classList.remove('no-scroll')
      setIsFs(false)
    }, [ref])
    const toggle = useCallback(() => {
      if (isFs || document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement) exit()
      else enter()
    }, [isFs, enter, exit])
    return { isFullscreen: isFs, enter, exit, toggle }
  }

  const fs = useFullscreen(containerRef)

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
        {/* Progress + Fullscreen (non-fullscreen header) */}
        {!fs.isFullscreen && (
          <div className="mb-3 flex items-center justify-between">
            <div className="text-sm font-medium">Progress: {progress.completedToday} / {progress.dailyTarget || '—'} today</div>
            <button
              className="rounded-md border border-neutral-200 px-3 py-1.5 text-sm dark:border-neutral-800"
              onClick={fs.toggle}
            >
              Fullscreen
            </button>
          </div>
        )}

        {/* Viewer + QA container (fullscreen capable) */}
        <div
          ref={containerRef}
          className={
            fs.isFullscreen
              ? 'fixed inset-0 z-40 bg-black'
              : 'rounded-xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-950 pb-6'
          }
        >
          {/* Top glass bar in fullscreen */}
          {fs.isFullscreen && (
            <div className="pointer-events-none absolute left-0 right-0 top-0 z-50 p-2">
              <div className="pointer-events-auto mx-auto max-w-screen-sm rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm text-white backdrop-blur-md flex items-center justify-between">
                <div>Progress: {progress.completedToday} / {progress.dailyTarget || '—'} today</div>
                <button onClick={fs.toggle} className="rounded-md border border-white/20 px-2 py-1 text-xs text-white/90 hover:bg-white/10">Exit</button>
              </div>
            </div>
          )}

          {/* Immersive viewer area */}
          <div ref={viewRef} className={fs.isFullscreen ? 'absolute inset-0 z-0' : 'relative z-0 w-full overflow-hidden rounded-lg bg-black h-[45dvh] sm:h-[50dvh] md:h-[60dvh] max-h-[70dvh]'}>
            <TransformWrapper
              limitToBounds
              centerOnInit
              doubleClick={{ disabled: false, step: 0.7 }}
              wheel={{ step: 0.15 }}
              pinch={{ step: 0.15 }}
              minScale={1}
              maxScale={5}
            >
              <TransformComponent wrapperClass={fs.isFullscreen ? 'h-full w-full' : 'h-full w-full'} contentClass="flex h-full w-full items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={task.image.url}
                  alt="task image"
                  className={fs.isFullscreen ? 'max-h-full max-w-full select-none' : 'max-h-full max-w-full select-none'}
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

          {/* Non-fullscreen question + buttons inside card */}
          {!fs.isFullscreen && (
            <>
              <div className="relative z-10 mt-4 rounded-lg border border-neutral-200 bg-white p-3 text-base shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                {task.image.question}
              </div>
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
            </>
          )}

          {/* Fullscreen bottom glass controls */}
          {fs.isFullscreen && (
            <div className="pointer-events-none absolute left-0 right-0 bottom-0 z-50 p-2 pb-3">
              <div className="pointer-events-auto mx-auto max-w-screen-sm rounded-xl border border-white/10 bg-white/10 p-3 text-white backdrop-blur-md">
                <div className="mb-2 text-center text-sm text-white/90">{task.image.question}</div>
                <div className="flex items-center gap-3">
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
                    className="flex-1 rounded-md border border-white/30 px-4 py-3 text-sm font-semibold text-white hover:bg-white/10 disabled:opacity-50"
                  >
                    {answering ? <span className="inline-flex items-center gap-2"><span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> Submitting…</span> : 'No'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        <style jsx global>{`
          .pseudo-fs { position: fixed !important; inset: 0 !important; z-index: 50 !important; background: #000 !important; padding: 8px; display: flex; flex-direction: column; height: 100dvh; }
          .no-scroll { overflow: hidden; }
        `}</style>
      </div>
    )
  }, [loading, task, answering, transition, onAnswer, noneRemaining, progress.completedToday, progress.dailyTarget, fs.isFullscreen, fs.toggle])

  return (
    <WorkerLayout>
      <div className="w-full px-3 pb-24 sm:px-4">{content}</div>
    </WorkerLayout>
  )
}
