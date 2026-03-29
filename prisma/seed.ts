import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { subDays, setHours, setMinutes } from 'date-fns'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Seeding database…')

  // ── Demo user ──────────────────────────────────────────────────────────────
  const user = await prisma.user.upsert({
    where: { email: 'demo@guttrigger.com' },
    update: {},
    create: {
      email: 'demo@guttrigger.com',
      name: 'Alex',
      profile: {
        create: {
          mainGoal: 'identify_triggers',
          trackedSymptoms: ['bloating', 'stomach_pain', 'gas', 'fatigue', 'brain_fog'],
          knownAllergies: [],
          suspectedFoods: ['gluten', 'dairy', 'garlic'],
          dietaryRestrictions: [],
          remindersEnabled: true,
          mealsPerDay: 3,
          onboardingComplete: true,
        },
      },
    },
    include: { profile: true },
  })
  console.log('✓ User:', user.email)

  const now = new Date()

  // ── Meal + symptom data ────────────────────────────────────────────────────
  type SeedMeal = {
    daysAgo: number
    mealType: string
    title: string
    location?: string
    foods: { name: string; category?: string }[]
    symptom?: { severity: number; categories: string[]; onset: string }
  }

  const meals: SeedMeal[] = [
    // 14 days ago
    {
      daysAgo: 14, mealType: 'breakfast', title: 'Oatmeal with berries',
      foods: [{ name: 'oatmeal', category: 'gluten' }, { name: 'blueberries' }, { name: 'almond milk' }],
    },
    {
      daysAgo: 14, mealType: 'dinner', title: 'Pasta with garlic and parmesan',
      foods: [{ name: 'pasta', category: 'gluten' }, { name: 'garlic', category: 'allium' }, { name: 'parmesan', category: 'dairy' }, { name: 'olive oil' }],
      symptom: { severity: 6, categories: ['bloating', 'gas'], onset: 'within_1hr' },
    },

    // 12 days ago
    {
      daysAgo: 12, mealType: 'breakfast', title: 'Greek yogurt with granola',
      foods: [{ name: 'greek yogurt', category: 'dairy' }, { name: 'granola', category: 'gluten' }, { name: 'honey' }],
      symptom: { severity: 4, categories: ['bloating', 'stomach_pain'], onset: 'within_2_4hr' },
    },
    {
      daysAgo: 12, mealType: 'lunch', title: 'Salmon rice bowl',
      foods: [{ name: 'salmon' }, { name: 'white rice' }, { name: 'avocado' }, { name: 'edamame', category: 'legumes' }],
    },
    {
      daysAgo: 12, mealType: 'dinner', title: 'Vegetable stir fry',
      foods: [{ name: 'broccoli' }, { name: 'carrots' }, { name: 'tofu' }, { name: 'ginger' }, { name: 'garlic', category: 'allium' }],
      symptom: { severity: 3, categories: ['gas'], onset: 'within_1hr' },
    },

    // 10 days ago
    {
      daysAgo: 10, mealType: 'breakfast', title: 'Scrambled eggs with spinach',
      foods: [{ name: 'eggs' }, { name: 'spinach' }, { name: 'butter', category: 'dairy' }],
    },
    {
      daysAgo: 10, mealType: 'lunch', title: 'Margherita pizza', location: 'restaurant',
      foods: [{ name: 'wheat crust', category: 'gluten' }, { name: 'mozzarella', category: 'dairy' }, { name: 'tomato sauce' }, { name: 'basil' }],
      symptom: { severity: 7, categories: ['bloating', 'stomach_pain', 'fatigue'], onset: 'within_2_4hr' },
    },

    // 8 days ago
    {
      daysAgo: 8, mealType: 'breakfast', title: 'Avocado toast',
      foods: [{ name: 'sourdough bread', category: 'gluten' }, { name: 'avocado' }, { name: 'lemon juice' }, { name: 'red pepper flakes', category: 'spicy' }],
      symptom: { severity: 4, categories: ['bloating'], onset: 'within_1hr' },
    },
    {
      daysAgo: 8, mealType: 'lunch', title: 'Lentil soup with garlic bread',
      foods: [{ name: 'lentils', category: 'legumes' }, { name: 'onion', category: 'allium' }, { name: 'garlic', category: 'allium' }, { name: 'baguette', category: 'gluten' }],
      symptom: { severity: 6, categories: ['bloating', 'gas', 'stomach_pain'], onset: 'within_1hr' },
    },
    {
      daysAgo: 8, mealType: 'dinner', title: 'Grilled chicken and sweet potato',
      foods: [{ name: 'chicken breast' }, { name: 'sweet potato' }, { name: 'olive oil' }, { name: 'rosemary' }],
    },

    // 6 days ago
    {
      daysAgo: 6, mealType: 'breakfast', title: 'Banana smoothie bowl',
      foods: [{ name: 'banana' }, { name: 'spinach' }, { name: 'almond butter' }, { name: 'chia seeds' }],
    },
    {
      daysAgo: 6, mealType: 'dinner', title: 'Pasta primavera', location: 'restaurant',
      foods: [{ name: 'pasta', category: 'gluten' }, { name: 'garlic', category: 'allium' }, { name: 'zucchini' }, { name: 'parmesan', category: 'dairy' }, { name: 'cream sauce', category: 'dairy' }],
      symptom: { severity: 8, categories: ['bloating', 'gas', 'stomach_pain', 'fatigue'], onset: 'within_1hr' },
    },

    // 4 days ago
    {
      daysAgo: 4, mealType: 'breakfast', title: 'Overnight oats',
      foods: [{ name: 'rolled oats', category: 'gluten' }, { name: 'oat milk' }, { name: 'banana' }, { name: 'chia seeds' }],
    },
    {
      daysAgo: 4, mealType: 'lunch', title: 'Caesar salad', location: 'restaurant',
      foods: [{ name: 'romaine lettuce' }, { name: 'parmesan', category: 'dairy' }, { name: 'croutons', category: 'gluten' }, { name: 'caesar dressing', category: 'dairy' }],
      symptom: { severity: 5, categories: ['bloating', 'nausea'], onset: 'within_2_4hr' },
    },
    {
      daysAgo: 4, mealType: 'dinner', title: 'Salmon and quinoa',
      foods: [{ name: 'salmon' }, { name: 'quinoa' }, { name: 'kale' }, { name: 'lemon' }, { name: 'olive oil' }],
    },

    // 2 days ago
    {
      daysAgo: 2, mealType: 'breakfast', title: 'Eggs and fruit',
      foods: [{ name: 'eggs' }, { name: 'strawberries' }, { name: 'orange juice' }],
    },
    {
      daysAgo: 2, mealType: 'lunch', title: 'Chicken wrap',
      foods: [{ name: 'chicken breast' }, { name: 'wheat tortilla', category: 'gluten' }, { name: 'lettuce' }, { name: 'tomato' }, { name: 'hummus', category: 'legumes' }],
    },
    {
      daysAgo: 2, mealType: 'dinner', title: 'Garlic shrimp pasta',
      foods: [{ name: 'pasta', category: 'gluten' }, { name: 'shrimp' }, { name: 'garlic', category: 'allium' }, { name: 'butter', category: 'dairy' }, { name: 'parsley' }],
      symptom: { severity: 7, categories: ['bloating', 'gas'], onset: 'within_1hr' },
    },

    // Yesterday
    {
      daysAgo: 1, mealType: 'breakfast', title: 'Smoothie and toast',
      foods: [{ name: 'banana' }, { name: 'oat milk' }, { name: 'whole wheat toast', category: 'gluten' }, { name: 'peanut butter' }],
    },
    {
      daysAgo: 1, mealType: 'lunch', title: 'Tuna salad',
      foods: [{ name: 'tuna' }, { name: 'mixed greens' }, { name: 'cucumber' }, { name: 'olive oil' }, { name: 'lemon' }],
    },
    {
      daysAgo: 1, mealType: 'dinner', title: 'Rice and beans',
      foods: [{ name: 'brown rice' }, { name: 'black beans', category: 'legumes' }, { name: 'onion', category: 'allium' }, { name: 'garlic', category: 'allium' }, { name: 'cumin' }],
      symptom: { severity: 5, categories: ['bloating', 'gas'], onset: 'within_2_4hr' },
    },

    // Today
    {
      daysAgo: 0, mealType: 'breakfast', title: 'Scrambled eggs',
      foods: [{ name: 'eggs' }, { name: 'spinach' }, { name: 'cherry tomatoes' }],
    },
    {
      daysAgo: 0, mealType: 'lunch', title: 'Grilled chicken salad',
      foods: [{ name: 'chicken breast' }, { name: 'arugula' }, { name: 'cucumber' }, { name: 'olive oil' }, { name: 'feta cheese', category: 'dairy' }],
    },
  ]

  const mealHours: Record<string, number> = { breakfast: 8, lunch: 13, dinner: 19, snack: 15 }
  const createdMeals: Array<{ id: string; mealType: string; symptom?: SeedMeal['symptom'] }> = []

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
        foods: {
          create: m.foods.map(f => ({ name: f.name, category: f.category ?? null })),
        },
      },
    })
    createdMeals.push({ id: created.id, mealType: m.mealType, symptom: m.symptom })
  }

  // ── Symptoms ───────────────────────────────────────────────────────────────
  let symptomCount = 0
  for (const meal of createdMeals) {
    if (!meal.symptom) continue
    const mealDate = await prisma.meal.findUnique({ where: { id: meal.id }, select: { date: true } })
    if (!mealDate) continue
    const symptomTime = new Date(mealDate.date.getTime() + 75 * 60 * 1000) // 75 min after meal
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

  // ── Check-ins ──────────────────────────────────────────────────────────────
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

  console.log('✓ Meals created:', createdMeals.length)
  console.log('✓ Symptoms created:', symptomCount)
  console.log('✓ Check-ins created: 7')
  console.log('\n🎉 Seed complete!')
  console.log('Demo user: demo@guttrigger.com')
  console.log('Note: create this user in Supabase Auth first, then run the seed.')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
