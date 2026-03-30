import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function LandingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) redirect('/dashboard')

  return (
    <div className="min-h-screen bg-white">
      {/* HEADER */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm border-b border-stone-100">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌿</span>
            <span className="font-bold text-stone-900 text-lg tracking-tight">GutTrigger</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-stone-600 hover:text-stone-900 transition">Sign in</Link>
            <Link href="/signup" className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition">Get Started</Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="pt-24 pb-20 px-4 bg-gradient-to-b from-emerald-50/60 to-white">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
            <span>✦</span> Food trigger identification
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-stone-900 leading-tight mb-5">
            Finally understand<br />what your gut is<br className="hidden sm:block" /> trying to tell you
          </h1>
          <p className="text-lg text-stone-500 leading-relaxed mb-8 max-w-xl mx-auto">
            GutTrigger tracks your meals and symptoms to surface the specific foods most likely causing your discomfort — with pattern-based analysis, not guesswork.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/signup" className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-8 py-4 rounded-2xl text-base transition shadow-sm">
              Start tracking for free →
            </Link>
            <Link href="/login" className="bg-white border border-stone-200 hover:border-stone-300 text-stone-700 font-semibold px-8 py-4 rounded-2xl text-base transition">
              I already have an account
            </Link>
          </div>
          <p className="text-xs text-stone-400 mt-4">No credit card required · For informational use only</p>
        </div>

        {/* Mock dashboard preview */}
        <div className="max-w-sm mx-auto mt-14">
          <div className="bg-white rounded-3xl shadow-xl border border-stone-100 p-5 space-y-4">
            {/* Insight banner mock */}
            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
              <p className="text-xs font-semibold text-amber-700 mb-1">⚠ Possible trigger detected</p>
              <p className="text-sm text-stone-700 font-medium">Garlic appeared in 6 meals before bloating in 4 of them.</p>
            </div>
            {/* Food cards mock */}
            <div>
              <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-2">Possible Triggers</p>
              <div className="space-y-2">
                {[
                  { name: 'Garlic', level: 'High risk', color: 'text-red-600 bg-red-50', pct: 75 },
                  { name: 'Dairy', level: 'Moderate', color: 'text-amber-600 bg-amber-50', pct: 50 },
                ].map(f => (
                  <div key={f.name} className="flex items-center gap-3 p-3 rounded-xl bg-stone-50">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-stone-800">{f.name}</p>
                      <div className="mt-1.5 h-1.5 bg-stone-200 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-400 rounded-full" style={{ width: `${f.pct}%` }} />
                      </div>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${f.color}`}>{f.level}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Safe foods mock */}
            <div>
              <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-2">Safe Foods</p>
              <div className="flex gap-2 flex-wrap">
                {['Rice', 'Chicken', 'Zucchini'].map(f => (
                  <span key={f} className="bg-emerald-50 text-emerald-700 text-xs font-medium px-2.5 py-1.5 rounded-lg">✓ {f}</span>
                ))}
              </div>
            </div>
          </div>
          <p className="text-center text-xs text-stone-400 mt-3">Sample data for illustration</p>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 px-4 bg-stone-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-stone-900 mb-3">How it works</h2>
            <p className="text-stone-500">Three simple steps to understanding your gut</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-8">
            {[
              { step: '01', icon: '📝', title: 'Log your meals', desc: 'Quickly log what you eat — type it, scan a photo with AI, or pick from recent meals. Takes under 30 seconds.' },
              { step: '02', icon: '🤒', title: 'Track symptoms', desc: 'When you feel off, log your symptoms with severity and timing. Link them to recent meals.' },
              { step: '03', icon: '🔍', title: 'Discover patterns', desc: 'GutTrigger analyzes correlations between your meals and symptoms to surface likely triggers — with confidence scores.' },
            ].map(s => (
              <div key={s.step} className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
                <div className="text-3xl mb-4">{s.icon}</div>
                <div className="text-xs font-bold text-emerald-600 mb-2">STEP {s.step}</div>
                <h3 className="text-lg font-bold text-stone-900 mb-2">{s.title}</h3>
                <p className="text-sm text-stone-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-stone-900 mb-3">Everything you need</h2>
            <p className="text-stone-500">Built around one question: what&apos;s causing my symptoms?</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-5">
            {[
              { icon: '🍽️', title: 'Smart meal logging', desc: 'Log meals in seconds. AI photo detection identifies foods from a photo. Quick-log recent meals with one tap.' },
              { icon: '📊', title: 'Trigger analysis', desc: 'Statistical analysis identifies foods correlated with your symptoms, with confidence scores and cautious language.' },
              { icon: '✅', title: 'Safe food tracking', desc: "Foods you eat without symptoms are tracked too — so you know what's safe, not just what to avoid." },
              { icon: '📅', title: 'Visual timeline', desc: 'See your meals, symptoms, and check-ins on a timeline. Spot cause-and-effect patterns at a glance.' },
              { icon: '😣', title: 'Symptom tracking', desc: 'Log bloating, pain, nausea, fatigue and more — with severity, timing, and links to recent meals.' },
              { icon: '📈', title: 'Trend insights', desc: 'Track symptom frequency and severity over time. See whether things are getting better or worse.' },
            ].map(f => (
              <div key={f.title} className="flex gap-4 p-5 bg-stone-50 rounded-2xl border border-stone-100">
                <span className="text-2xl flex-shrink-0 mt-0.5">{f.icon}</span>
                <div>
                  <h3 className="font-bold text-stone-900 mb-1">{f.title}</h3>
                  <p className="text-sm text-stone-500 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-emerald-600">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Start understanding your gut today</h2>
          <p className="text-emerald-100 mb-8">Join people using GutTrigger to finally get answers about their digestive health.</p>
          <Link href="/signup" className="inline-block bg-white text-emerald-700 font-bold px-8 py-4 rounded-2xl text-base hover:bg-emerald-50 transition shadow-sm">
            Create free account →
          </Link>
        </div>
      </section>

      {/* DISCLAIMER + FOOTER */}
      <footer className="py-10 px-4 border-t border-stone-100">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-xs text-stone-400 leading-relaxed mb-6">
            ⚕️ <strong className="text-stone-500">Medical disclaimer:</strong> GutTrigger is for informational and self-tracking purposes only. It is not a medical device, does not provide diagnoses, and is not a substitute for professional medical advice. Always consult a qualified healthcare provider about digestive symptoms, especially severe or persistent ones. Food correlations shown in the app are patterns in your personal data — they are not confirmed medical findings.
          </p>
          <div className="flex items-center justify-center gap-6 text-xs text-stone-400">
            <span>🌿 GutTrigger</span>
            <Link href="/login" className="hover:text-stone-600 transition">Sign in</Link>
            <Link href="/signup" className="hover:text-stone-600 transition">Sign up</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
