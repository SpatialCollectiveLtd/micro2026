"use client"
import { Fragment, useMemo, useState } from 'react'
import { Combobox as HCombobox, Transition } from '@headlessui/react'

export default function Combobox({ value, onChange, options, by = 'value', display = 'label', placeholder = 'Select…', disabled = false }) {
  const [query, setQuery] = useState('')
  const filtered = useMemo(() => {
    if (!query.trim()) return options
    const q = query.trim().toLowerCase()
    return options.filter(o => (String(o[display] ?? '').toLowerCase().includes(q)))
  }, [options, query, display])
  return (
    <HCombobox value={value} onChange={onChange} disabled={disabled} by={by}>
      <div className="relative">
        <HCombobox.Input
          className="w-full rounded-md border border-neutral-200 bg-white/70 px-3 py-2 text-sm outline-none backdrop-blur dark:border-neutral-800 dark:bg-neutral-900/70"
          displayValue={(o) => o ? o[display] : ''}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
        />
        <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0" afterLeave={() => setQuery('')}>
          <HCombobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border border-neutral-200 bg-white/90 p-1 text-sm shadow-lg backdrop-blur dark:border-neutral-800 dark:bg-neutral-900/90">
            {filtered.length === 0 ? (
              <div className="relative cursor-default select-none px-3 py-2 text-neutral-500">No results</div>
            ) : (
              filtered.map((opt) => (
                <HCombobox.Option key={opt.value} value={opt} className={({ active }) => `cursor-pointer select-none rounded px-3 py-2 ${active ? 'bg-neutral-100 dark:bg-neutral-800' : ''}`}>
                  {({ selected }) => (
                    <span className={`${selected ? 'font-medium' : 'font-normal'}`}>{opt[display]}</span>
                  )}
                </HCombobox.Option>
              ))
            )}
          </HCombobox.Options>
        </Transition>
      </div>
    </HCombobox>
  )
}
