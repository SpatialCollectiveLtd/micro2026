export const dynamic = 'force-dynamic'

export default function NotFound() {
  return (
    <div className="relative min-h-screen bg-neutral-950 text-neutral-100 overflow-hidden">
      {/* Subtle map-like background */}
      <div className="pointer-events-none absolute inset-0 opacity-40" style={{ background:
        'radial-gradient(600px 300px at 20% 0%, rgba(239,68,68,0.12), transparent 60%), radial-gradient(600px 300px at 80% 100%, rgba(59,130,246,0.12), transparent 60%)' }} />
      <div className="absolute inset-0 [background-image:linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)]; [background-size:24px_24px,24px_24px]"></div>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-6 text-center">
        <div className="mb-4 text-6xl font-extrabold tracking-tight">404</div>
        <div className="mb-6 text-lg text-neutral-300">It looks like you&apos;ve taken a wrong turn.</div>

        {/* Lost on the Map animation (SVG) */}
        <div className="mb-8 w-full max-w-xl">
          <svg viewBox="0 0 600 240" className="h-auto w-full" aria-label="Lost on the map animation" role="img">
            {/* Dotted path (drawn) */}
            <path id="lost-path" d="M 60 200 C 180 160, 220 40, 320 80 S 520 200, 540 120" fill="none" stroke="#ffffff" strokeOpacity="0.5" strokeWidth="2" strokeDasharray="6 8" className="path" />
            {/* Locator pin (wiggle, then follow path) */}
            <g>
              <g id="pin" transform="translate(60,200)">
                <path d="M0,-14 C-7,-14 -12,-9 -12,-2 C-12,6 0,16 0,16 C0,16 12,6 12,-2 C12,-9 7,-14 0,-14 Z" fill="#ef4444" />
                <circle cx="0" cy="-4" r="4" fill="#fff" />
              </g>
              <animateMotion xlinkHref="#pin" dur="6s" repeatCount="indefinite" keyPoints="0;0;1" keyTimes="0;0.25;1" calcMode="linear">
                <mpath href="#lost-path" />
              </animateMotion>
            </g>
          </svg>
        </div>

        <a href="/dashboard" className="group relative inline-flex items-center gap-2 rounded-lg bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-neutral-950">
          <span>Back to Dashboard</span>
          <span className="inline-block translate-x-0 transition-transform group-hover:translate-x-0.5">→</span>
        </a>

        {/* Button pulse highlight to suggest action */}
        <style>{`
          .path { stroke-dashoffset: 200; animation: drawPath 6s ease-in-out infinite; }
          @keyframes drawPath {
            0% { stroke-dashoffset: 200; }
            25% { stroke-dashoffset: 0; }
            60% { stroke-dashoffset: 0; }
            100% { stroke-dashoffset: 200; }
          }
        `}</style>
      </div>
    </div>
  )
}
