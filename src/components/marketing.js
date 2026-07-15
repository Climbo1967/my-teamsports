import Link from "next/link";

const NAV_LINKS = [
  { href: "/how-it-works", label: "How It Works" },
  { href: "/pricing", label: "Pricing" },
  { href: "/faq", label: "FAQ" },
  { href: "/about", label: "About" },
  { href: "/blog", label: "Blog" },
];

export function SiteNav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[var(--color-navy)]/95 backdrop-blur-xl border-b border-white/5 px-6 h-[70px] flex items-center justify-between">
      <Link href="/" className="flex items-center gap-3">
        <div className="w-11 h-11 bg-gradient-to-br from-[var(--color-accent-blue)] to-blue-700 rounded-xl flex items-center justify-center text-lg shadow-lg shadow-blue-500/20">
          ⚾
        </div>
        <span className="font-[family-name:var(--font-oswald)] font-bold text-xl tracking-wide text-white">
          MY-TEAM <span className="text-[var(--color-accent-blue)]">SPORTS</span>
        </span>
      </Link>
      <div className="hidden md:flex items-center gap-8">
        {NAV_LINKS.map((l) => (
          <Link key={l.href} href={l.href} className="text-sm font-medium text-slate-400 hover:text-white transition-colors">
            {l.label}
          </Link>
        ))}
        <Link href="/login" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Login</Link>
        <Link href="/signup" className="bg-[var(--color-accent-green)] text-white text-sm font-semibold px-5 py-2 rounded-md hover:bg-green-500 transition-all">
          Get Started Free
        </Link>
      </div>
      <div className="md:hidden flex items-center gap-4">
        <Link href="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
          Login
        </Link>
        <Link href="/signup" className="bg-[var(--color-accent-green)] text-white text-sm font-semibold px-4 py-2 rounded-md">
          Start Free
        </Link>
      </div>
    </nav>
  );
}

export function SiteFooter() {
  return (
    <footer className="px-6 py-12 text-center border-t border-white/5 bg-[var(--color-navy-mid)]">
      <p className="font-[family-name:var(--font-oswald)] text-sm font-semibold text-slate-500 mb-3">MY-TEAM SPORTS.com</p>
      <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mb-4 text-xs">
        <Link href="/how-it-works" className="text-slate-500 hover:text-white transition-colors">How It Works</Link>
        <Link href="/pricing" className="text-slate-500 hover:text-white transition-colors">Pricing</Link>
        <Link href="/faq" className="text-slate-500 hover:text-white transition-colors">FAQ</Link>
        <Link href="/about" className="text-slate-500 hover:text-white transition-colors">About</Link>
        <Link href="/blog" className="text-slate-500 hover:text-white transition-colors">Blog</Link>
        <Link href="/signup" className="text-slate-500 hover:text-white transition-colors">Create a Team</Link>
        <Link href="/login" className="text-slate-500 hover:text-white transition-colors">Coach Login</Link>
      </div>
      <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 mb-4 text-xs">
        <Link href="/privacy" className="text-slate-500 hover:text-white transition-colors">Privacy</Link>
        <Link href="/terms" className="text-slate-500 hover:text-white transition-colors">Terms</Link>
        <Link href="/child-safety" className="text-slate-500 hover:text-white transition-colors">Child Safety</Link>
      </div>
      <p className="text-xs text-slate-600">&copy; 2026 My-Team Sports. All rights reserved.</p>
    </footer>
  );
}

export function CTASection() {
  return (
    <section className="px-6 py-24 text-center relative bg-gradient-to-b from-[var(--color-navy-mid)] to-[var(--color-navy)]">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-green-500/30 to-transparent" />
      <div className="max-w-[600px] mx-auto bg-gradient-to-br from-green-500/[0.08] to-blue-500/[0.06] border border-green-500/20 rounded-3xl p-12 md:p-14">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">YOUR TEAM&apos;S HOME<br />IS WAITING.</h2>
        <p className="text-slate-400 mb-8 text-lg leading-relaxed">
          It&apos;s live. It&apos;s ready. It takes 5 minutes, and it&apos;s half off for the 2026 season.
        </p>
        <Link
          href="/signup"
          className="inline-block bg-[var(--color-accent-green)] text-white font-[family-name:var(--font-oswald)] text-lg font-semibold tracking-wide px-10 py-4 rounded-xl hover:bg-green-500 transition-all duration-200 hover:-translate-y-0.5 shadow-lg shadow-green-500/25 hover:shadow-green-500/35"
        >
          CREATE YOUR TEAM NOW
        </Link>
        <p className="mt-4 text-xs text-slate-500">No credit card. No app. No catch.</p>
      </div>
    </section>
  );
}

export function PageHero({ badge, title, accent, subtitle }) {
  return (
    <section className="relative px-6 pt-36 pb-16 overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-navy)] via-[#0d1f3c] to-[var(--color-navy-mid)]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120%] h-[70%] bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.08),transparent_70%)]" />
      </div>
      <div className="relative z-10 max-w-[820px] mx-auto text-center">
        {badge ? (
          <div className="inline-flex items-center gap-2.5 bg-green-500/10 border border-green-500/30 text-green-400 text-xs font-bold tracking-widest uppercase px-5 py-2.5 rounded-full mb-7">
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-accent-green)] animate-live" />
            {badge}
          </div>
        ) : null}
        <h1 className="text-5xl md:text-7xl font-bold leading-none tracking-tight mb-5">
          {title}
          {accent ? <><br /><span className="text-[var(--color-accent-blue)]">{accent}</span></> : null}
        </h1>
        {subtitle ? (
          <p className="text-lg md:text-xl font-light text-slate-400 max-w-[640px] mx-auto leading-relaxed">{subtitle}</p>
        ) : null}
      </div>
    </section>
  );
}
