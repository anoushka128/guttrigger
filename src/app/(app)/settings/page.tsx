import { requireDbUser } from '@/lib/auth'
import { SYMPTOM_CATEGORIES } from '@/lib/utils'
import SettingsClient from './_components/SettingsClient'
import MedicalDisclaimer from '@/components/MedicalDisclaimer'

export default async function SettingsPage() {
  const user = await requireDbUser()
  const profile = user.profile

  const trackedSymptoms = profile?.trackedSymptoms ?? []
  const dietaryRestrictions = profile?.dietaryRestrictions ?? []

  const initials = (user.name ?? user.email)?.[0]?.toUpperCase() ?? '?'

  return (
    <div className="pt-8 pb-10 space-y-5">
      {/* Header */}
      <div className="px-1">
        <h1 className="text-2xl font-bold text-stone-900">Settings</h1>
        <p className="text-sm text-stone-500 mt-0.5">Manage your account and preferences</p>
      </div>

      {/* ── Account section ─────────────────────────────── */}
      <section aria-label="Account">
        <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest px-1 mb-2">Account</p>
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden divide-y divide-stone-100">
          {/* Profile row */}
          <div className="flex items-center gap-4 px-5 py-4">
            <div className="w-11 h-11 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 text-base font-bold flex-shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-stone-900 truncate">{user.name || 'Your name'}</p>
              <p className="text-sm text-stone-500 truncate">{user.email}</p>
            </div>
          </div>
          {/* Sign out */}
          <div className="px-5 py-4">
            <SettingsClient userName={user.name ?? ''} userEmail={user.email} />
          </div>
        </div>
      </section>

      {/* ── Health tracking section ─────────────────────── */}
      <section aria-label="Health tracking">
        <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest px-1 mb-2">Health Tracking</p>
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden divide-y divide-stone-100">
          {/* Tracked symptoms */}
          <div className="px-5 py-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-stone-800">Tracked Symptoms</p>
              {trackedSymptoms.length > 0 && (
                <span className="text-xs text-stone-400">{trackedSymptoms.length} selected</span>
              )}
            </div>
            {trackedSymptoms.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {trackedSymptoms.map((s: string) => {
                  const cat = SYMPTOM_CATEGORIES.find(c => c.id === s)
                  return (
                    <span
                      key={s}
                      className="inline-flex items-center gap-1 text-xs font-medium bg-stone-50 text-stone-700 rounded-full px-2.5 py-1 border border-stone-100"
                    >
                      {cat?.emoji} {cat?.label ?? s}
                    </span>
                  )
                })}
              </div>
            ) : (
              <p className="text-sm text-stone-400">No symptoms tracked yet</p>
            )}
            <p className="text-xs text-stone-400">To update, complete onboarding again.</p>
          </div>

          {/* Dietary restrictions */}
          {dietaryRestrictions.length > 0 && (
            <div className="px-5 py-4 space-y-3">
              <p className="text-sm font-semibold text-stone-800">Dietary Restrictions</p>
              <div className="flex flex-wrap gap-1.5">
                {dietaryRestrictions.map((r: string) => (
                  <span
                    key={r}
                    className="text-xs font-medium bg-emerald-50 text-emerald-700 rounded-full px-2.5 py-1 border border-emerald-100"
                  >
                    {r.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── Reminders section ────────────────────────────── */}
      <section aria-label="Reminders">
        <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest px-1 mb-2">Reminders</p>
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm px-5 py-4 space-y-1">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-stone-800">Meal reminders</p>
            <span
              className={[
                'text-xs font-medium px-2.5 py-1 rounded-full',
                profile?.remindersEnabled
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-stone-100 text-stone-500',
              ].join(' ')}
            >
              {profile?.remindersEnabled ? 'On' : 'Off'}
            </span>
          </div>
          {profile?.remindersEnabled && (
            <p className="text-sm text-stone-500">
              {profile.mealsPerDay ?? 3} reminders per day
            </p>
          )}
          <p className="text-xs text-stone-400 pt-0.5">
            Delivery depends on your browser and device settings.
          </p>
        </div>
      </section>

      {/* ── Medical disclaimer ────────────────────────────── */}
      <MedicalDisclaimer />

      {/* ── About section ────────────────────────────────── */}
      <section aria-label="About">
        <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest px-1 mb-2">About</p>
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm px-5 py-4 space-y-1">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-stone-800">GutTrigger</p>
            <span className="text-xs text-stone-400 font-medium">v0.1.0</span>
          </div>
          <p className="text-xs text-stone-400 leading-relaxed">
            Built to help you understand your gut — not replace your doctor.
          </p>
        </div>
      </section>
    </div>
  )
}
