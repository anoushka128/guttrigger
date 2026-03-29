import { Info } from 'lucide-react'

export default function MedicalDisclaimer() {
  return (
    <div className="flex gap-3 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3">
      <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
      <p className="text-sm text-amber-800 leading-relaxed">
        GutTrigger helps you notice patterns in your gut health. It is not a substitute for
        medical advice, diagnosis, or treatment. Always consult a qualified healthcare
        professional.
      </p>
    </div>
  )
}
