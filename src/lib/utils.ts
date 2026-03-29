import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  const d = new Date(date)
  if (isToday(d)) return 'Today'
  if (isYesterday(d)) return 'Yesterday'
  return format(d, 'MMM d')
}

export function formatTime(date: Date | string): string {
  return format(new Date(date), 'h:mm a')
}

export function formatRelative(date: Date | string): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

export function formatDateTime(date: Date | string): string {
  const d = new Date(date)
  if (isToday(d)) return `Today at ${format(d, 'h:mm a')}`
  if (isYesterday(d)) return `Yesterday at ${format(d, 'h:mm a')}`
  return format(d, 'MMM d, h:mm a')
}

export const SYMPTOM_CATEGORIES = [
  { id: 'bloating', label: 'Bloating', emoji: '🫧' },
  { id: 'stomach_pain', label: 'Stomach Pain', emoji: '😣' },
  { id: 'gas', label: 'Gas', emoji: '💨' },
  { id: 'nausea', label: 'Nausea', emoji: '🤢' },
  { id: 'reflux', label: 'Reflux / Heartburn', emoji: '🔥' },
  { id: 'diarrhea', label: 'Diarrhea', emoji: '🚽' },
  { id: 'constipation', label: 'Constipation', emoji: '🪨' },
  { id: 'fatigue', label: 'Fatigue', emoji: '😴' },
  { id: 'brain_fog', label: 'Brain Fog', emoji: '🌫️' },
  { id: 'itching', label: 'Itching', emoji: '🤧' },
  { id: 'rash', label: 'Rash / Hives', emoji: '🔴' },
  { id: 'headache', label: 'Headache', emoji: '🤕' },
  { id: 'swelling', label: 'Swelling', emoji: '🫣' },
  { id: 'other', label: 'Other', emoji: '❓' },
]

export const SEVERE_SYMPTOMS = [
  'throat_tightness',
  'wheezing',
  'trouble_breathing',
  'swelling_lips',
  'swelling_tongue',
  'fainting',
  'severe_rash',
  'anaphylaxis',
]

export const FOOD_CATEGORIES = [
  { id: 'dairy', label: 'Dairy', color: 'bg-blue-100 text-blue-700' },
  { id: 'gluten', label: 'Gluten', color: 'bg-amber-100 text-amber-700' },
  { id: 'high_fat', label: 'High Fat', color: 'bg-orange-100 text-orange-700' },
  { id: 'spicy', label: 'Spicy', color: 'bg-red-100 text-red-700' },
  { id: 'caffeine', label: 'Caffeine', color: 'bg-brown-100 text-yellow-800' },
  { id: 'allium', label: 'Onion/Garlic', color: 'bg-purple-100 text-purple-700' },
  { id: 'legumes', label: 'Legumes', color: 'bg-green-100 text-green-700' },
  { id: 'artificial_sweetener', label: 'Sweetener', color: 'bg-pink-100 text-pink-700' },
  { id: 'other', label: 'Other', color: 'bg-stone-100 text-stone-600' },
]

export const MEAL_TYPES = [
  { id: 'breakfast', label: 'Breakfast', emoji: '🌅' },
  { id: 'lunch', label: 'Lunch', emoji: '☀️' },
  { id: 'dinner', label: 'Dinner', emoji: '🌙' },
  { id: 'snack', label: 'Snack', emoji: '🍎' },
]

export const ONSET_OPTIONS = [
  { id: 'immediate', label: 'Immediately (< 15 min)' },
  { id: 'within_1hr', label: 'Within 1 hour' },
  { id: 'within_2_4hr', label: 'Within 2–4 hours' },
  { id: 'later_that_day', label: 'Later that day' },
  { id: 'next_morning', label: 'Next morning' },
]

export const SUSPICION_LEVELS = {
  high: { label: 'High Suspicion', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
  moderate: { label: 'Moderate Suspicion', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
  low: { label: 'Low Suspicion', color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' },
  probably_safe: { label: 'Probably Safe', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  insufficient_data: { label: 'Insufficient Data', color: 'text-stone-500', bg: 'bg-stone-50', border: 'border-stone-200' },
}
