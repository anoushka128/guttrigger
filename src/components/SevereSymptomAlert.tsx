import { AlertTriangle } from 'lucide-react'

export default function SevereSymptomAlert() {
  return (
    <div className="flex gap-3 rounded-xl bg-red-50 border border-red-200 px-4 py-3">
      <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
      <p className="text-sm text-red-800 leading-relaxed">
        If you&apos;re experiencing throat tightness, difficulty breathing, swelling of lips or
        tongue, or severe reactions — seek medical attention immediately. Call emergency
        services if needed.
      </p>
    </div>
  )
}
