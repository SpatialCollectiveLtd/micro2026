export default function Checkbox({ className = '', ...props }) {
  return (
    <input type="checkbox" className={`h-4 w-4 rounded border-neutral-300 text-red-600 focus:ring-red-500 ${className}`} {...props} />
  )
}
