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
              'absolute z-50 mt-2 max-h-60 w-full overflow-auto rounded-md border border-black/15 bg-white/85 p-1 text-sm text-neutral-900 shadow-[0_8px_30px_rgb(0_0_0_/_0.08)] backdrop-blur-xl focus:outline-none dark:border-white/10 dark:bg-neutral-900/85 dark:text-neutral-50'
            }
          >
            {options.map((opt) => (
              <Listbox.Option
                key={opt.value}
                className={({ active }) =>
                  clsx(
                    'relative cursor-pointer select-none rounded-md px-3 py-2',
                    active ? 'bg-white/80 text-neutral-900 dark:bg-neutral-800/80 dark:text-white' : 'text-current',
                  )
                }
                value={opt}
              >
                {({ selected }) => (
                  <div className="flex items-center justify-between gap-2">
                    <span className={clsx('block truncate', selected ? 'font-semibold' : '')}>{opt.label}</span>
                    {selected && <FiCheck className="h-4 w-4 opacity-90" />}
                  </div>
                )}
              </Listbox.Option>
            ))}
            {options.length === 0 && (
              <div className="px-3 py-2 text-neutral-600 dark:text-neutral-300">No options</div>
            )}
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
  )
}
