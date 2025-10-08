"use client"
import WorkerLayout from '@/app/(worker)/layout'
import { useCallback, useEffect, useMemo, useState } from 'react'
import TechLoader from '@/components/TechLoader'
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch'

export default function TasksPage() {
  const [immersive, setImmersive] = useState(true)
  const [task, setTask] = useState(null)
  const [loading, setLoading] = useState(true)
  const [answering, setAnswering] = useState(false)
  const [transition, setTransition] = useState(false)

  const fetchNext = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/tasks/next')
    const json = await res.json()
    setTask(json.task)
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
      <div className="flex items-center justify-center py-12">
        <TechLoader label="Loading next task…" />
      </div>
    )
    if (!task) return <div className="p-6 text-sm text-neutral-500">All done for now. 🎉</div>
    return (
      <div className={`transition-transform duration-300 ${transition ? '-translate-x-8 opacity-0' : 'translate-x-0 opacity-100'}`}>
        {/* View toggle */}
        <div className="mb-3 flex items-center justify-between">
          <div className="text-sm font-medium">View</div>
          <div className="inline-flex rounded-md border border-neutral-200 p-1 text-sm dark:border-neutral-800">
            <button
              className={`rounded px-3 py-1 ${immersive ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900' : ''}`}
              onClick={() => setImmersive(true)}
            >
              Immersive
            </button>
            <button
              className={`rounded px-3 py-1 ${!immersive ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900' : ''}`}
              onClick={() => setImmersive(false)}
            >
              Focused
            </button>
          </div>
        </div>

        {/* Viewer area */}
        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
          {immersive ? (
            // Immersive: bounded zoom & pan
            <div className="h-[60vh] w-full rounded-lg bg-black">
              <TransformWrapper
                limitToBounds
                centerOnInit
                doubleClick={{ disabled: false, step: 0.7 }}
                wheel={{ step: 0.15 }}
                pinch={{ step: 0.15 }}
                minScale={1}
                maxScale={5}
              >
                <TransformComponent wrapperClass="h-full w-full" contentClass="flex items-center justify-center h-full w-full">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={task.image.url} alt="task image" className="max-h-full max-w-full select-none" draggable={false} onError={(e) => { e.currentTarget.style.display='none'; const holder=document.createElement('div'); holder.className='flex h-full w-full items-center justify-center text-sm text-red-300'; holder.textContent='The image cannot be loaded'; e.currentTarget.parentElement?.appendChild(holder) }} />
                </TransformComponent>
              </TransformWrapper>
            </div>
          ) : (
            // Focused: fit entire image within container
            <div className="h-[50vh] w-full overflow-hidden rounded-lg bg-black grid place-items-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={task.image.url} alt="task image" className="max-h-full max-w-full object-contain select-none" draggable={false} onError={(e) => { e.currentTarget.style.display='none'; const holder=document.createElement('div'); holder.className='flex h-full w-full items-center justify-center text-sm text-red-300'; holder.textContent='The image cannot be loaded'; e.currentTarget.parentElement?.appendChild(holder) }} />
            </div>
          )}

          {/* Question Overlay */}
          <div className="mt-4 rounded-lg border border-neutral-200 bg-white p-3 text-base shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            {task.image.question}
          </div>

          {/* Answer buttons */}
          <div className="mt-4 flex items-center gap-3">
            <button
              disabled={answering}
              onClick={() => onAnswer(true)}
              className="flex-1 rounded-md bg-red-600 px-4 py-3 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
            >
              Yes
            </button>
            <button
              disabled={answering}
              onClick={() => onAnswer(false)}
              className="flex-1 rounded-md border border-neutral-900 px-4 py-3 text-sm font-semibold text-neutral-900 hover:bg-neutral-100 disabled:opacity-50 dark:border-white dark:text-white dark:hover:bg-neutral-800"
            >
              No
            </button>
          </div>
          {answering && (
            <div className="mt-4 flex items-center justify-center">
              <TechLoader label="Submitting answer…" />
            </div>
          )}
        </div>
      </div>
    )
  }, [loading, task, immersive, answering, transition, onAnswer])

  return (
    <WorkerLayout>
      {content}
    </WorkerLayout>
  )
}
