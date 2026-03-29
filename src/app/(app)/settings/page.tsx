import { requireDbUser } from '@/lib/auth'
import { SYMPTOM_CATEGORIES, FOOD_CATEGORIES } from '@/lib/utils'
import SettingsClient from './_components/SettingsClient'
import MedicalDisclaimer from '@/components/MedicalDisclaimer'

export default async function SettingsPage() {
  const user = await requireDbUser()
  const profile = user.profile

  const trackedSymptoms = profile?.trackedSymptoms ?? []
  const dietaryRestrictions = profile?.dietaryRestrictions ?? []

  return (
    <div className="pt-8 pb-8 space-y-6">
      {/* Header */}
      <div className="px-1">
        <h1 className="text-2xl font-semibold text-stone-900">Settings</h1>
        <p className="text-sm text-stone-500 mt-1">{user.email}</p>
      </div>

      {/* Profile card */}
      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 space-y-4">
        <h2 className="text-sm font-semibold text-stone-500 uppercase tracking-wide">Profile</h2>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 text-lg font-semibold">
            {(user.name ?? user.email)?.[0]?.toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-stone-900">{user.name || 'Your name'}</p>
            <p className="text-sm text-stone-500">{user.email}</p>
          </div>
        </div>
        <SettingsClient userName={user.name ?? ''} userEmail={user.email} />
      </div>

      {/* Tracked symptoms */}
      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 space-y-3">
        <h2 className="text-sm font-semibold text-stone-500 uppercase tracking-wide">Tracked Symptoms</h2>
        {trackedSymptoms.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {trackedSymptoms.map((s: string) => {
              const cat = SYMPTOM_CATEGORIES.find(c => c.id === s)
              return (
                <span key={s} className="inline-flex items-center gap-1 text-xs font-medium bg-stone-100 text-stone-700 rounded-full px-3 py-1">
                  {cat?.emoji} {cat?.label ?? s}
                </span>
              )
            })}
          </div>
        ) : (
          <p className="text-sm text-stone-400">No symptoms tracked yet</p>
        )}
        <p className="text-xs text-stone-400">To change, complete onboarding again.</p>
      </div>

      {/* Dietary restrictions */}
      {dietaryRestrictions.length > 0 && (
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 space-y-3">
          <h2 className="text-sm font-semibold text-stone-500 uppercase tracking-wide">Dietary Restrictions</h2>
          <div className="flex flex-wrap gap-2">
            {dietaryRestrictions.map((r: string) => (
              <span key={r} className="text-xs font-medium bg-emerald-50 text-emerald-700 rounded-full px-3 py-1">
                {r.replace('_', ' ')}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Reminders */}
      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 space-y-3">
        <h2 className="text-sm font-semibold text-stone-500 uppercase tracking-wide">Reminders</h2>
        <p className="text-sm text-stone-500">
          {profile?.remindersEnabled
            ? 'Reminders are enabled. You have ' + (profile.mealsPerDay ?? 3) + ' meal reminders per day.'
            : 'Reminders are currently off.'}
        </p>
        <p className="text-xs text-stone-400">Notification delivery depends on your browser/device settings.</p>
      </div>

      {/* Medical disclaimer */}
      <MedicalDisclaimer />

      {/* About */}
      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 space-y-2">
        <h2 className="text-sm font-semibold text-stone-500 uppercase tracking-wide">About</h2>
        <p className="text-sm text-stone-600">GutTrigger v0.1.0</p>
        <p className="text-xs text-stone-400">
          Built to help you understand your gut — not replace your doctor.
        </p>
      </div>

      {/* Sign out — rendered in client component below */}
    </div>
  )
}
