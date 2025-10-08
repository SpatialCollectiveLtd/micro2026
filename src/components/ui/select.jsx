"use client"
import { Fragment } from 'react'
import { Listbox, Transition } from '@headlessui/react'
import { FiCheck, FiChevronDown } from 'react-icons/fi'
import { clsx } from 'clsx'

// Props:
// - value: current selected option object (should have .value, .label)
// - onChange: (option) => void
// - options: [{ value, label }]
// - placeholder?: string
// - className?: string
export default function Select({ value, onChange, options = [], placeholder = 'Select…', className = '' }) {
  return (
    <Listbox value={value} onChange={onChange}>
      <div className={clsx('relative', className)}>
        <Listbox.Button
          className={
            'relative w-full cursor-pointer rounded-md border border-black/10 bg-white/60 px-3 py-2 text-left text-sm text-neutral-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] backdrop-blur-md transition hover:bg-white/70 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-white/10 dark:bg-neutral-900/60 dark:text-white dark:hover:bg-neutral-900/70'
          }
        >
          <span className={clsx('block truncate', !value && 'text-neutral-400')}>{value?.label || placeholder}</span>
          <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
            <FiChevronDown className="h-4 w-4 opacity-70" aria-hidden="true" />
          </span>
        </Listbox.Button>

        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Listbox.Options
            className={
              'absolute z-50 mt-2 max-h-60 w-full overflow-auto rounded-md border border-black/10 bg-white/70 p-1 text-sm shadow-[0_8px_30px_rgb(0_0_0_/_0.06)] backdrop-blur-lg focus:outline-none dark:border-white/10 dark:bg-neutral-900/70'
            }
          >
            {options.map((opt) => (
              <Listbox.Option
                key={opt.value}
                className={({ active }) =>
                  clsx(
                    'relative cursor-pointer select-none rounded-md px-3 py-2 text-neutral-900 hover:bg-white/70 dark:text-white dark:hover:bg-neutral-800/70',
                    active && 'bg-white/70 dark:bg-neutral-800/70'
                  )
                }
                value={opt}
              >
                {({ selected }) => (
                  <div className="flex items-center justify-between gap-2">
                    <span className={clsx('block truncate', selected && 'font-medium')}>{opt.label}</span>
                    {selected && <FiCheck className="h-4 w-4 opacity-80" />}
                  </div>
                )}
              </Listbox.Option>
            ))}
            {options.length === 0 && (
              <div className="px-3 py-2 text-neutral-500 dark:text-neutral-400">No options</div>
            )}
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
  )
}
