export default function FileUpload({ name = 'file', accept = '.csv', required = true }) {
  return (
    <div>
      <input type="file" name={name} accept={accept} required={required} className="block w-full text-sm file:mr-4 file:rounded-md file:border-0 file:bg-neutral-100 file:px-3 file:py-1.5 file:text-sm file:font-medium hover:file:bg-neutral-200 dark:file:bg-neutral-800 dark:hover:file:bg-neutral-700" />
      <p className="mt-1 text-xs text-neutral-500">CSV with a single image URL per line.</p>
    </div>
  )
}
