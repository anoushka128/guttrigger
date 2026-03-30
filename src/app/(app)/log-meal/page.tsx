'use client'

import { useState, useTransition, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createMeal } from '@/app/actions/meals'
import { MEAL_TYPES } from '@/lib/utils'

type LogLevel = 1 | 2 | 3
type Step = 1 | 2 | 3

interface FoodItem {
  id: string
  name: string
  portionSize: 'Small' | 'Medium' | 'Large' | ''
  ingredients: IngredientItem[]
  showIngredients: boolean
}

interface IngredientItem {
  id: string
  name: string
  quantity: string
}

interface FormData {
  mealType: string
  title: string
  date: string
  time: string
  location: 'home' | 'restaurant' | 'other'
  notes: string
  foods: FoodItem[]
}

function getNow() {
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  const date = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
  const time = `${pad(now.getHours())}:${pad(now.getMinutes())}`
  return { date, time }
}

function newFood(): FoodItem {
  return {
    id: crypto.randomUUID(),
    name: '',
    portionSize: '',
    ingredients: [],
    showIngredients: false,
  }
}

function newIngredient(): IngredientItem {
  return { id: crypto.randomUUID(), name: '', quantity: '' }
}

const LOCATION_OPTIONS = [
  { id: 'home', label: 'Home', emoji: '🏠' },
  { id: 'restaurant', label: 'Restaurant', emoji: '🍴' },
  { id: 'other', label: 'Other', emoji: '📍' },
] as const

const PORTION_SIZES = ['Small', 'Medium', 'Large'] as const

export default function LogMealPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const photoInputRef = useRef<HTMLInputElement>(null)

  const { date: nowDate, time: nowTime } = getNow()

  const [step, setStep] = useState<Step>(1)
  const [logLevel, setLogLevel] = useState<LogLevel | null>(null)
  const [formData, setFormData] = useState<FormData>({
    mealType: '',
    title: '',
    date: nowDate,
    time: nowTime,
    location: 'home',
    notes: '',
    foods: [],
  })
  const [successBanner, setSuccessBanner] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Photo / AI detection state
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analyzeError, setAnalyzeError] = useState<string | null>(null)
  const [detectedCount, setDetectedCount] = useState<number | null>(null)

  function updateField<K extends keyof FormData>(key: K, value: FormData[K]) {
    setFormData(prev => ({ ...prev, [key]: value }))
  }

  function addFood() {
    setFormData(prev => ({ ...prev, foods: [...prev.foods, newFood()] }))
  }

  function removeFood(id: string) {
    setFormData(prev => ({ ...prev, foods: prev.foods.filter(f => f.id !== id) }))
  }

  function updateFood(id: string, field: keyof FoodItem, value: unknown) {
    setFormData(prev => ({
      ...prev,
      foods: prev.foods.map(f => f.id === id ? { ...f, [field]: value } : f),
    }))
  }

  function addIngredient(foodId: string) {
    setFormData(prev => ({
      ...prev,
      foods: prev.foods.map(f =>
        f.id === foodId
          ? { ...f, ingredients: [...f.ingredients, newIngredient()] }
          : f
      ),
    }))
  }

  function removeIngredient(foodId: string, ingId: string) {
    setFormData(prev => ({
      ...prev,
      foods: prev.foods.map(f =>
        f.id === foodId
          ? { ...f, ingredients: f.ingredients.filter(i => i.id !== ingId) }
          : f
      ),
    }))
  }

  function updateIngredient(foodId: string, ingId: string, field: keyof IngredientItem, value: string) {
    setFormData(prev => ({
      ...prev,
      foods: prev.foods.map(f =>
        f.id === foodId
          ? {
              ...f,
              ingredients: f.ingredients.map(i =>
                i.id === ingId ? { ...i, [field]: value } : i
              ),
            }
          : f
      ),
    }))
  }

  function handlePhotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoFile(file)
    setDetectedCount(null)
    setAnalyzeError(null)
    const reader = new FileReader()
    reader.onload = (ev) => setPhotoPreview(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  function clearPhoto() {
    setPhotoPreview(null)
    setPhotoFile(null)
    setDetectedCount(null)
    setAnalyzeError(null)
    if (photoInputRef.current) photoInputRef.current.value = ''
  }

  async function handleDetectFoods() {
    if (!photoFile || !photoPreview) return
    setIsAnalyzing(true)
    setAnalyzeError(null)
    setDetectedCount(null)

    try {
      const base64 = photoPreview.split(',')[1]
      const mediaType = photoFile.type

      const res = await fetch('/api/analyze-meal-photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageData: base64, mediaType }),
      })

      if (!res.ok) throw new Error('Failed to analyze image')

      const { foods } = await res.json() as { foods: Array<{ name: string; portionSize?: string }> }

      if (foods.length === 0) {
        setAnalyzeError('No foods detected. You can add them manually below.')
        setIsAnalyzing(false)
        return
      }

      const newFoods: FoodItem[] = foods.map(f => ({
        id: crypto.randomUUID(),
        name: f.name,
        portionSize: (['Small', 'Medium', 'Large'].includes(f.portionSize ?? '') ? f.portionSize : '') as FoodItem['portionSize'],
        ingredients: [],
        showIngredients: false,
      }))

      setFormData(prev => ({ ...prev, foods: newFoods }))
      setDetectedCount(newFoods.length)
    } catch {
      setAnalyzeError('Could not analyze photo. Please add foods manually.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  function handleLevelSelect(level: LogLevel) {
    setLogLevel(level)
    if (level === 1) {
      // Quick: stay on step 1
    } else {
      setStep(2)
    }
  }

  function handleStep1Next() {
    if (!formData.mealType) { setError('Please select a meal type'); return }
    if (!formData.title.trim()) { setError('Please enter a meal name'); return }
    setError(null)
    setStep(3)
  }

  function handleStep2Next() {
    if (!formData.title.trim()) { setError('Please enter a meal title'); return }
    setError(null)
    setStep(3)
  }

  async function handleSave() {
    if (!formData.mealType) { setError('Please select a meal type'); return }
    if (!formData.title.trim()) { setError('Please enter a meal name'); return }
    setError(null)

    const dateTime = new Date(`${formData.date}T${formData.time}`)

    startTransition(async () => {
      try {
        await createMeal({
          date: dateTime.toISOString(),
          mealType: formData.mealType as 'breakfast' | 'lunch' | 'dinner' | 'snack',
          title: formData.title,
          location: formData.location,
          notes: formData.notes || undefined,
          logLevel: logLevel ?? 1,
          foods: formData.foods.map(f => ({
            name: f.name,
            portionSize: f.portionSize || undefined,
            ingredients: f.ingredients.map(i => ({
              name: i.name,
              quantity: i.quantity || undefined,
            })),
          })),
        })
        setSuccessBanner(true)
        setTimeout(() => router.push('/dashboard'), 1200)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Something went wrong. Please try again.')
      }
    })
  }

  const chipBase = 'px-4 py-2 rounded-xl border text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500'
  const chipSelected = 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
  const chipUnselected = 'bg-white border-stone-200 text-stone-600 hover:border-emerald-300 hover:bg-emerald-50'

  return (
    <div className="pt-6 pb-32">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          type="button"
          onClick={() => {
            if (step > 1) setStep(step === 3 && logLevel === 1 ? 1 : (step - 1) as Step)
            else router.back()
          }}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-stone-200 text-stone-600 hover:bg-stone-50 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          aria-label="Go back"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div>
          <h1 className="text-xl font-semibold text-stone-900">Log a Meal</h1>
          {step > 1 && (
            <p className="text-xs text-stone-500 mt-0.5">Step {step} of 3</p>
          )}
        </div>
      </div>

      {/* Success banner */}
      {successBanner && (
        <div className="mb-4 rounded-2xl bg-emerald-50 border border-emerald-200 px-4 py-3 flex items-center gap-2 text-emerald-700 text-sm font-medium">
          <span>✓</span> Meal saved! Redirecting…
        </div>
      )}

      {/* Error banner */}
      {error && (
        <div className="mb-4 rounded-2xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* ─── STEP 1 ─── */}
      {step === 1 && (
        <div className="space-y-5">
          {/* Date & time */}
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-stone-700 mb-3">When?</h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-stone-500 mb-1.5">Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={e => updateField('date', e.target.value)}
                  className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                />
              </div>
              <div>
                <label className="block text-xs text-stone-500 mb-1.5">Time</label>
                <input
                  type="time"
                  value={formData.time}
                  onChange={e => updateField('time', e.target.value)}
                  className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                />
              </div>
            </div>
          </div>

          {/* Meal type */}
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-stone-700 mb-3">Meal type</h2>
            <div className="grid grid-cols-2 gap-2">
              {MEAL_TYPES.map(mt => (
                <button
                  key={mt.id}
                  type="button"
                  onClick={() => updateField('mealType', mt.id)}
                  className={[
                    'flex items-center gap-2.5 px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-150',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500',
                    formData.mealType === mt.id ? chipSelected : chipUnselected,
                  ].join(' ')}
                >
                  <span className="text-lg leading-none">{mt.emoji}</span>
                  <span>{mt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Log level */}
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-stone-700 mb-3">How much detail?</h2>
            <div className="space-y-2">
              {[
                { level: 1 as LogLevel, icon: '⚡', title: 'Quick', desc: 'Just the meal name', example: 'e.g. "Chicken salad from Sweetgreen"' },
                { level: 2 as LogLevel, icon: '🍽️', title: 'Standard', desc: 'Meal + foods eaten', example: '' },
                { level: 3 as LogLevel, icon: '📋', title: 'Detailed', desc: 'Full ingredient breakdown', example: '' },
              ].map(opt => (
                <button
                  key={opt.level}
                  type="button"
                  onClick={() => handleLevelSelect(opt.level)}
                  className={[
                    'w-full flex items-start gap-3 p-4 rounded-xl border text-left transition-all duration-150',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500',
                    logLevel === opt.level
                      ? 'border-emerald-400 bg-emerald-50'
                      : 'border-stone-200 bg-white hover:border-emerald-200 hover:bg-emerald-50/50',
                  ].join(' ')}
                >
                  <span className="text-xl leading-none mt-0.5">{opt.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-stone-900">{opt.title}</p>
                    <p className="text-xs text-stone-500 mt-0.5">{opt.desc}</p>
                    {opt.example && <p className="text-xs text-stone-400 mt-0.5 italic">{opt.example}</p>}
                  </div>
                  <span className={['w-4 h-4 rounded-full border-2 mt-0.5 flex-shrink-0 transition-colors', logLevel === opt.level ? 'border-emerald-600 bg-emerald-600' : 'border-stone-300'].join(' ')} />
                </button>
              ))}
            </div>
          </div>

          {/* Quick title input — shown when level 1 is selected */}
          {logLevel === 1 && (
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
              <label className="block text-sm font-semibold text-stone-700 mb-2">Meal name</label>
              <input
                type="text"
                value={formData.title}
                onChange={e => updateField('title', e.target.value)}
                placeholder='e.g. "Chicken salad from Sweetgreen"'
                className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                autoFocus
              />
            </div>
          )}
        </div>
      )}

      {/* ─── STEP 2 ─── */}
      {step === 2 && (
        <div className="space-y-5">
          {/* Title */}
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
            <label className="block text-sm font-semibold text-stone-700 mb-2">Meal title</label>
            <input
              type="text"
              value={formData.title}
              onChange={e => updateField('title', e.target.value)}
              placeholder='e.g. "Salmon bowl"'
              className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
              autoFocus
            />
          </div>

          {/* Photo + AI detection */}
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-stone-700 mb-3">
              Scan photo with AI
              <span className="ml-2 text-xs font-normal text-stone-400">(optional)</span>
            </h2>

            {!photoPreview ? (
              <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-stone-200 rounded-xl cursor-pointer hover:border-emerald-300 hover:bg-emerald-50/50 transition">
                <span className="text-2xl mb-1.5">📷</span>
                <span className="text-xs font-medium text-stone-500">Tap to upload a photo</span>
                <span className="text-xs text-stone-400 mt-0.5">AI will detect the foods for you</span>
                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoSelect}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="space-y-3">
                {/* Photo preview */}
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photoPreview}
                    alt="Meal photo"
                    className="w-full h-48 object-cover rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={clearPhoto}
                    className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center rounded-full bg-black/50 text-white text-lg leading-none hover:bg-black/70 transition"
                    aria-label="Remove photo"
                  >
                    ×
                  </button>
                </div>

                {/* Detect button */}
                <button
                  type="button"
                  onClick={handleDetectFoods}
                  disabled={isAnalyzing}
                  className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl px-4 py-2.5 transition"
                >
                  {isAnalyzing ? (
                    <>
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                      </svg>
                      Detecting foods…
                    </>
                  ) : (
                    <>
                      <span>✨</span>
                      {detectedCount !== null ? 'Re-detect foods' : 'Detect foods with AI'}
                    </>
                  )}
                </button>

                {detectedCount !== null && (
                  <p className="text-xs text-emerald-600 font-medium text-center">
                    {detectedCount} food{detectedCount !== 1 ? 's' : ''} detected — edit below if needed
                  </p>
                )}
                {analyzeError && (
                  <p className="text-xs text-red-500 text-center">{analyzeError}</p>
                )}
              </div>
            )}
          </div>

          {/* Location */}
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-stone-700 mb-3">Location</h2>
            <div className="flex gap-2 flex-wrap">
              {LOCATION_OPTIONS.map(loc => (
                <button
                  key={loc.id}
                  type="button"
                  onClick={() => updateField('location', loc.id)}
                  className={[chipBase, formData.location === loc.id ? chipSelected : chipUnselected].join(' ')}
                >
                  {loc.emoji} {loc.label}
                </button>
              ))}
            </div>
          </div>

          {/* Foods */}
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-stone-700">Foods eaten</h2>
              <button
                type="button"
                onClick={addFood}
                className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 hover:text-emerald-700 transition"
              >
                <span className="text-base leading-none">+</span> Add food
              </button>
            </div>

            {formData.foods.length === 0 && (
              <p className="text-sm text-stone-400 text-center py-4">
                Upload a photo above to auto-detect, or tap &quot;Add food&quot; to add manually.
              </p>
            )}

            <div className="space-y-3">
              {formData.foods.map((food, idx) => (
                <div key={food.id} className="rounded-xl border border-stone-100 bg-stone-50 p-4 space-y-3">
                  <div className="flex items-start gap-2">
                    <input
                      type="text"
                      value={food.name}
                      onChange={e => updateFood(food.id, 'name', e.target.value)}
                      placeholder={`Food ${idx + 1} name`}
                      className="flex-1 border border-stone-200 rounded-xl px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white transition"
                    />
                    <button
                      type="button"
                      onClick={() => removeFood(food.id)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-stone-400 hover:text-red-500 hover:bg-red-50 transition flex-shrink-0"
                      aria-label="Remove food"
                    >
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
                      </svg>
                    </button>
                  </div>

                  {/* Portion size */}
                  <div>
                    <p className="text-xs text-stone-500 mb-1.5">Portion size</p>
                    <div className="flex gap-1.5">
                      {PORTION_SIZES.map(size => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => updateFood(food.id, 'portionSize', food.portionSize === size ? '' : size)}
                          className={[
                            'px-3 py-1.5 rounded-lg border text-xs font-medium transition-all duration-150',
                            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500',
                            food.portionSize === size
                              ? 'bg-emerald-600 border-emerald-600 text-white'
                              : 'bg-white border-stone-200 text-stone-600 hover:border-emerald-300',
                          ].join(' ')}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Ingredients — detailed level only */}
                  {logLevel === 3 && (
                    <div>
                      <button
                        type="button"
                        onClick={() => updateFood(food.id, 'showIngredients', !food.showIngredients)}
                        className="flex items-center gap-1.5 text-xs font-medium text-stone-500 hover:text-stone-700 transition"
                      >
                        <span className={['transition-transform duration-150', food.showIngredients ? 'rotate-90' : ''].join(' ')}>▶</span>
                        {food.showIngredients ? 'Hide' : 'Add'} ingredients
                        {food.ingredients.length > 0 && (
                          <span className="bg-stone-200 text-stone-600 rounded-full px-1.5 py-0.5 text-[10px]">
                            {food.ingredients.length}
                          </span>
                        )}
                      </button>

                      {food.showIngredients && (
                        <div className="mt-2 space-y-2">
                          {food.ingredients.map((ing, iIdx) => (
                            <div key={ing.id} className="flex gap-2 items-center">
                              <input
                                type="text"
                                value={ing.name}
                                onChange={e => updateIngredient(food.id, ing.id, 'name', e.target.value)}
                                placeholder={`Ingredient ${iIdx + 1}`}
                                className="flex-1 border border-stone-200 rounded-lg px-3 py-1.5 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white transition"
                              />
                              <input
                                type="text"
                                value={ing.quantity}
                                onChange={e => updateIngredient(food.id, ing.id, 'quantity', e.target.value)}
                                placeholder="Qty"
                                className="w-20 border border-stone-200 rounded-lg px-3 py-1.5 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white transition"
                              />
                              <button
                                type="button"
                                onClick={() => removeIngredient(food.id, ing.id)}
                                className="w-7 h-7 flex items-center justify-center rounded-lg text-stone-400 hover:text-red-500 hover:bg-red-50 transition flex-shrink-0"
                                aria-label="Remove ingredient"
                              >
                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                  <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
                                </svg>
                              </button>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => addIngredient(food.id)}
                            className="text-xs text-emerald-600 hover:text-emerald-700 font-medium transition"
                          >
                            + Add ingredient
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
            <label className="block text-sm font-semibold text-stone-700 mb-2">
              Notes <span className="text-stone-400 font-normal">(optional)</span>
            </label>
            <textarea
              value={formData.notes}
              onChange={e => updateField('notes', e.target.value)}
              placeholder="Anything else worth noting…"
              rows={3}
              className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition resize-none"
            />
          </div>
        </div>
      )}

      {/* ─── STEP 3 — confirm ─── */}
      {step === 3 && (
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-stone-700 mb-4">Review your meal</h2>

            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-stone-500">Meal type</dt>
                <dd className="font-medium text-stone-900 capitalize">{formData.mealType || '—'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-stone-500">Title</dt>
                <dd className="font-medium text-stone-900">{formData.title || '—'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-stone-500">Date &amp; time</dt>
                <dd className="font-medium text-stone-900">{formData.date} {formData.time}</dd>
              </div>
              {logLevel !== 1 && (
                <div className="flex justify-between">
                  <dt className="text-stone-500">Location</dt>
                  <dd className="font-medium text-stone-900 capitalize">{formData.location}</dd>
                </div>
              )}
              {formData.foods.length > 0 && (
                <div>
                  <dt className="text-stone-500 mb-1.5">Foods</dt>
                  <dd>
                    <ul className="space-y-1">
                      {formData.foods.map(f => (
                        <li key={f.id} className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                          <span className="text-stone-800">{f.name}</span>
                          {f.portionSize && <span className="text-xs text-stone-400">({f.portionSize})</span>}
                        </li>
                      ))}
                    </ul>
                  </dd>
                </div>
              )}
              {formData.notes && (
                <div>
                  <dt className="text-stone-500 mb-1">Notes</dt>
                  <dd className="text-stone-700 bg-stone-50 rounded-xl p-3 text-xs leading-relaxed">{formData.notes}</dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      )}

      {/* ─── Sticky bottom button ─── */}
      <div className="fixed bottom-0 left-0 right-0 bg-stone-50/90 backdrop-blur-sm border-t border-stone-100 px-4 py-4 safe-area-bottom">
        <div className="mx-auto max-w-2xl">
          {step === 1 && logLevel === null && (
            <p className="text-center text-sm text-stone-400">Select a log level above to continue</p>
          )}
          {step === 1 && logLevel === 1 && (
            <button
              type="button"
              onClick={handleStep1Next}
              disabled={isPending || successBanner}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-2xl px-4 py-3.5 transition"
            >
              Review &amp; Save
            </button>
          )}
          {step === 2 && (
            <button
              type="button"
              onClick={handleStep2Next}
              disabled={isPending || successBanner}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-2xl px-4 py-3.5 transition"
            >
              Review Meal
            </button>
          )}
          {step === 3 && (
            <button
              type="button"
              onClick={handleSave}
              disabled={isPending || successBanner}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-2xl px-4 py-3.5 transition"
            >
              {isPending ? 'Saving…' : 'Save Meal'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
