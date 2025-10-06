import clsx from 'clsx'
export default function Switch({ checked, onChange, className = '', disabled }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange?.(!checked)}
      className={clsx(
        'inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50',
        checked ? 'bg-red-600' : 'bg-neutral-300 dark:bg-neutral-700',
        className
      )}
    >
      <span
        className={clsx(
          'inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition',
          checked ? 'translate-x-5' : 'translate-x-1'
        )}
      />
    </button>
  )
}
