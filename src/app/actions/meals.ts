'use server'

import { prisma } from '@/lib/prisma'
import { requireDbUser } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

// Schema for meal creation
const MealSchema = z.object({
  date: z.string(),
  mealType: z.enum(['breakfast', 'lunch', 'dinner', 'snack']),
  title: z.string().min(1),
  location: z.enum(['home', 'restaurant', 'other']).default('home'),
  notes: z.string().optional(),
  logLevel: z.number().int().min(1).max(3).default(1),
  foods: z.array(z.object({
    name: z.string(),
    portionSize: z.string().optional(),
    portionDesc: z.string().optional(),
    category: z.string().optional(),
    ingredients: z.array(z.object({
      name: z.string(),
      quantity: z.string().optional(),
      category: z.string().optional(),
    })).optional(),
  })).optional(),
})

export type MealFormData = z.infer<typeof MealSchema>

export async function createMeal(data: MealFormData) {
  const user = await requireDbUser()

  const meal = await prisma.meal.create({
    data: {
      userId: user.id,
      date: new Date(data.date),
      mealType: data.mealType,
      title: data.title,
      location: data.location || 'home',
      notes: data.notes,
      logLevel: data.logLevel || 1,
      foods: data.foods ? {
        create: data.foods.map(food => ({
          name: food.name,
          portionSize: food.portionSize,
          portionDesc: food.portionDesc,
          category: food.category,
          ingredients: food.ingredients ? {
            create: food.ingredients.map(ing => ({
              name: ing.name,
              quantity: ing.quantity,
              category: ing.category,
            }))
          } : undefined,
        }))
      } : undefined,
    },
    include: { foods: { include: { ingredients: true } } }
  })

  revalidatePath('/dashboard')
  revalidatePath('/timeline')
  return { success: true, mealId: meal.id }
}

export async function deleteMeal(mealId: string) {
  const user = await requireDbUser()
  await prisma.meal.deleteMany({ where: { id: mealId, userId: user.id } })
  revalidatePath('/dashboard')
  revalidatePath('/timeline')
}
