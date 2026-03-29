import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { subDays, setHours, setMinutes } from 'date-fns'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  // Find the first user in the DB (your account)
  const user = await prisma.user.findFirst({ orderBy: { createdAt: 'asc' } })
  if (!user) {
    console.error('No users found. Sign up first, then run this script.')
    process.exit(1)
  }
  console.log(`🌱 Seeding data for: ${user.email}`)

  // Ensure profile exists
  await prisma.userProfile.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      mainGoal: 'identify_triggers',
      trackedSymptoms: ['bloating', 'stomach_pain', 'gas', 'fatigue'],
      knownAllergies: [],
      suspectedFoods: ['gluten', 'dairy', 'garlic'],
      dietaryRestrictions: [],
      remindersEnabled: true,
      mealsPerDay: 3,
      onboardingComplete: true,
    },
    update: { onboardingComplete: true },
  })

  const now = new Date()

  type SeedMeal = {
    daysAgo: number
    mealType: string
    title: string
    location?: string
    foods: { name: string; category?: string }[]
    symptom?: { severity: number; categories: string[]; onset: string }
  }

  const meals: SeedMeal[] = [
    { daysAgo: 14, mealType: 'breakfast', title: 'Oatmeal with berries', foods: [{ name: 'oatmeal', category: 'gluten' }, { name: 'blueberries' }, { name: 'almond milk' }] },
    { daysAgo: 14, mealType: 'dinner', title: 'Pasta with garlic and parmesan', foods: [{ name: 'pasta', category: 'gluten' }, { name: 'garlic', category: 'allium' }, { name: 'parmesan', category: 'dairy' }, { name: 'olive oil' }], symptom: { severity: 6, categories: ['bloating', 'gas'], onset: 'within_1hr' } },
    { daysAgo: 12, mealType: 'breakfast', title: 'Greek yogurt with granola', foods: [{ name: 'greek yogurt', category: 'dairy' }, { name: 'granola', category: 'gluten' }, { name: 'honey' }], symptom: { severity: 4, categories: ['bloating', 'stomach_pain'], onset: 'within_2_4hr' } },
    { daysAgo: 12, mealType: 'lunch', title: 'Salmon rice bowl', foods: [{ name: 'salmon' }, { name: 'white rice' }, { name: 'avocado' }, { name: 'edamame' }] },
    { daysAgo: 12, mealType: 'dinner', title: 'Vegetable stir fry', foods: [{ name: 'broccoli' }, { name: 'carrots' }, { name: 'tofu' }, { name: 'garlic', category: 'allium' }], symptom: { severity: 3, categories: ['gas'], onset: 'within_1hr' } },
    { daysAgo: 10, mealType: 'breakfast', title: 'Scrambled eggs with spinach', foods: [{ name: 'eggs' }, { name: 'spinach' }, { name: 'butter', category: 'dairy' }] },
    { daysAgo: 10, mealType: 'lunch', title: 'Margherita pizza', location: 'restaurant', foods: [{ name: 'wheat crust', category: 'gluten' }, { name: 'mozzarella', category: 'dairy' }, { name: 'tomato sauce' }, { name: 'basil' }], symptom: { severity: 7, categories: ['bloating', 'stomach_pain', 'fatigue'], onset: 'within_2_4hr' } },
    { daysAgo: 8, mealType: 'breakfast', title: 'Avocado toast', foods: [{ name: 'sourdough bread', category: 'gluten' }, { name: 'avocado' }, { name: 'lemon juice' }], symptom: { severity: 4, categories: ['bloating'], onset: 'within_1hr' } },
    { daysAgo: 8, mealType: 'lunch', title: 'Lentil soup with garlic bread', foods: [{ name: 'lentils' }, { name: 'onion', category: 'allium' }, { name: 'garlic', category: 'allium' }, { name: 'baguette', category: 'gluten' }], symptom: { severity: 6, categories: ['bloating', 'gas', 'stomach_pain'], onset: 'within_1hr' } },
    { daysAgo: 8, mealType: 'dinner', title: 'Grilled chicken and sweet potato', foods: [{ name: 'chicken breast' }, { name: 'sweet potato' }, { name: 'olive oil' }, { name: 'rosemary' }] },
    { daysAgo: 6, mealType: 'breakfast', title: 'Banana smoothie bowl', foods: [{ name: 'banana' }, { name: 'spinach' }, { name: 'almond butter' }, { name: 'chia seeds' }] },
    { daysAgo: 6, mealType: 'dinner', title: 'Pasta primavera', location: 'restaurant', foods: [{ name: 'pasta', category: 'gluten' }, { name: 'garlic', category: 'allium' }, { name: 'zucchini' }, { name: 'parmesan', category: 'dairy' }, { name: 'cream sauce', category: 'dairy' }], symptom: { severity: 8, categories: ['bloating', 'gas', 'stomach_pain', 'fatigue'], onset: 'within_1hr' } },
    { daysAgo: 4, mealType: 'breakfast', title: 'Overnight oats', foods: [{ name: 'rolled oats', category: 'gluten' }, { name: 'oat milk' }, { name: 'banana' }, { name: 'chia seeds' }] },
    { daysAgo: 4, mealType: 'lunch', title: 'Caesar salad', location: 'restaurant', foods: [{ name: 'romaine lettuce' }, { name: 'parmesan', category: 'dairy' }, { name: 'croutons', category: 'gluten' }, { name: 'caesar dressing', category: 'dairy' }], symptom: { severity: 5, categories: ['bloating', 'nausea'], onset: 'within_2_4hr' } },
    { daysAgo: 4, mealType: 'dinner', title: 'Salmon and quinoa', foods: [{ name: 'salmon' }, { name: 'quinoa' }, { name: 'kale' }, { name: 'lemon' }, { name: 'olive oil' }] },
    { daysAgo: 2, mealType: 'breakfast', title: 'Eggs and fruit', foods: [{ name: 'eggs' }, { name: 'strawberries' }, { name: 'orange juice' }] },
    { daysAgo: 2, mealType: 'lunch', title: 'Chicken wrap', foods: [{ name: 'chicken breast' }, { name: 'wheat tortilla', category: 'gluten' }, { name: 'lettuce' }, { name: 'tomato' }, { name: 'hummus' }] },
    { daysAgo: 2, mealType: 'dinner', title: 'Garlic shrimp pasta', foods: [{ name: 'pasta', category: 'gluten' }, { name: 'shrimp' }, { name: 'garlic', category: 'allium' }, { name: 'butter', category: 'dairy' }, { name: 'parsley' }], symptom: { severity: 7, categories: ['bloating', 'gas'], onset: 'within_1hr' } },
    { daysAgo: 1, mealType: 'breakfast', title: 'Smoothie and toast', foods: [{ name: 'banana' }, { name: 'oat milk' }, { name: 'whole wheat toast', category: 'gluten' }, { name: 'peanut butter' }] },
    { daysAgo: 1, mealType: 'lunch', title: 'Tuna salad', foods: [{ name: 'tuna' }, { name: 'mixed greens' }, { name: 'cucumber' }, { name: 'olive oil' }, { name: 'lemon' }] },
    { daysAgo: 1, mealType: 'dinner', title: 'Rice and beans', foods: [{ name: 'brown rice' }, { name: 'black beans' }, { name: 'onion', category: 'allium' }, { name: 'garlic', category: 'allium' }, { name: 'cumin' }], symptom: { severity: 5, categories: ['bloating', 'gas'], onset: 'within_2_4hr' } },
    { daysAgo: 0, mealType: 'breakfast', title: 'Scrambled eggs', foods: [{ name: 'eggs' }, { name: 'spinach' }, { name: 'cherry tomatoes' }] },
    { daysAgo: 0, mealType: 'lunch', title: 'Grilled chicken salad', foods: [{ name: 'chicken breast' }, { name: 'arugula' }, { name: 'cucumber' }, { name: 'olive oil' }, { name: 'feta cheese', category: 'dairy' }] },
  ]

  const mealHours: Record<string, number> = { breakfast: 8, lunch: 13, dinner: 19, snack: 15 }
  const createdMeals: Array<{ id: string; symptom?: SeedMeal['symptom'] }> = []

  for (const m of meals) {
    const mealDate = setMinutes(setHours(subDays(now, m.daysAgo), mealHours[m.mealType] ?? 12), 0)
    const created = await prisma.meal.create({
      data: {
        userId: user.id,
        date: mealDate,
        mealType: m.mealType,
        title: m.title,
        location: m.location ?? 'home',
        logLevel: 2,
        foods: { create: m.foods.map(f => ({ name: f.name, category: f.category ?? null })) },
      },
    })
    createdMeals.push({ id: created.id, symptom: m.symptom })
  }

  let symptomCount = 0
  for (const meal of createdMeals) {
    if (!meal.symptom) continue
    const found = await prisma.meal.findUnique({ where: { id: meal.id }, select: { date: true } })
    if (!found) continue
    const symptomTime = new Date(found.date.getTime() + 75 * 60 * 1000)
    await prisma.symptom.create({
      data: {
        userId: user.id,
        timeStarted: symptomTime,
        severity: meal.symptom.severity,
        categories: meal.symptom.categories,
        onset: meal.symptom.onset,
        duration: '1-2 hours',
        linkedMeals: { connect: [{ id: meal.id }] },
      },
    })
    symptomCount++
  }

  for (let i = 7; i >= 1; i--) {
    await prisma.checkIn.create({
      data: {
        userId: user.id,
        timestamp: setHours(subDays(now, i), 21),
        feelingScore: 5 + Math.round(Math.random() * 3),
        energyLevel: 5 + Math.round(Math.random() * 3),
        stressLevel: 3 + Math.round(Math.random() * 4),
        sleepHours: 6.5 + Math.random() * 2,
        sleepQuality: 5 + Math.round(Math.random() * 3),
        hadBM: true,
        bmType: 'normal',
        symptoms: [],
      },
    })
  }

  console.log(`✓ Meals: ${createdMeals.length}`)
  console.log(`✓ Symptoms: ${symptomCount}`)
  console.log('✓ Check-ins: 7')
  console.log('🎉 Done! Go to http://localhost:3000/insights to see your data.')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
