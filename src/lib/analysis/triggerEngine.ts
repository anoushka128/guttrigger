import { prisma } from '@/lib/prisma'

const SEVERE_SYMPTOM_CATEGORIES = [
  'throat_tightness',
  'wheezing',
  'trouble_breathing',
  'swelling_lips',
  'swelling_tongue',
  'fainting',
  'severe_rash',
]

export async function runTriggerAnalysis(userId: string) {
  // 1. Get all meals with foods for this user
  const meals = await prisma.meal.findMany({
    where: { userId },
    include: {
      foods: { include: { ingredients: true } },
      symptoms: true,
    },
    orderBy: { date: 'asc' },
  })

  // 2. Build food exposure map
  // For each meal, extract all food names and ingredient names
  // For each food: track { exposures: Meal[], symptomEvents: { symptom, meal }[] }

  const foodMap = new Map<string, {
    exposures: number
    symptomEvents: Array<{ severity: number; categories: string[]; onset: string | null; mealDate: Date }>
    category: string | null
  }>()

  for (const meal of meals) {
    // Collect all food items from this meal
    const foodItems: { name: string; category: string | null }[] = []

    for (const food of meal.foods) {
      foodItems.push({ name: food.name.toLowerCase().trim(), category: food.category })
      for (const ingredient of food.ingredients) {
        foodItems.push({ name: ingredient.name.toLowerCase().trim(), category: ingredient.category })
      }
    }

    // If no foods logged but title exists, add the title as a food item
    if (foodItems.length === 0 && meal.title) {
      const titleFoods = meal.title.split(',').map((f: string) => f.trim().toLowerCase()).filter(Boolean)
      titleFoods.forEach((name: string) => foodItems.push({ name, category: null }))
    }

    for (const foodItem of foodItems) {
      if (!foodItem.name || foodItem.name.length < 2) continue

      if (!foodMap.has(foodItem.name)) {
        foodMap.set(foodItem.name, { exposures: 0, symptomEvents: [], category: foodItem.category })
      }

      const entry = foodMap.get(foodItem.name)!
      entry.exposures += 1

      // Check for symptoms linked to this meal
      for (const symptom of meal.symptoms) {
        entry.symptomEvents.push({
          severity: symptom.severity,
          categories: symptom.categories,
          onset: symptom.onset,
          mealDate: meal.date,
        })
      }
    }
  }

  // 3. Also check symptoms within 6 hours of a meal (time-based correlation)
  const allSymptoms = await prisma.symptom.findMany({
    where: { userId },
    orderBy: { timeStarted: 'asc' },
  })

  for (const symptom of allSymptoms) {
    // Find meals within 6 hours before this symptom
    const sixHoursBefore = new Date(symptom.timeStarted.getTime() - 6 * 60 * 60 * 1000)
    const relatedMeals = meals.filter((m: typeof meals[number]) =>
      m.date >= sixHoursBefore && m.date <= symptom.timeStarted
    )

    for (const meal of relatedMeals) {
      // Don't double-count already-linked symptoms
      if (meal.symptoms.some((s: { id: string }) => s.id === symptom.id)) continue

      const foodItems: { name: string; category: string | null }[] = []
      for (const food of meal.foods) {
        foodItems.push({ name: food.name.toLowerCase().trim(), category: food.category })
      }
      if (foodItems.length === 0 && meal.title) {
        meal.title.split(',').forEach((f: string) => {
          const name = f.trim().toLowerCase()
          if (name) foodItems.push({ name, category: null })
        })
      }

      for (const foodItem of foodItems) {
        if (!foodItem.name || foodItem.name.length < 2) continue
        const entry = foodMap.get(foodItem.name)
        if (entry) {
          // Add if not already counted for this meal
          const alreadyCounted = entry.symptomEvents.some(e =>
            e.mealDate.getTime() === meal.date.getTime()
          )
          if (!alreadyCounted) {
            entry.symptomEvents.push({
              severity: symptom.severity,
              categories: symptom.categories,
              onset: symptom.onset,
              mealDate: meal.date,
            })
          }
        }
      }
    }
  }

  // 4. Calculate scores for each food
  const results = []

  for (const [foodName, data] of foodMap.entries()) {
    if (data.exposures < 1) continue

    const exposureCount = data.exposures
    const symptomCount = data.symptomEvents.length
    const consistency = symptomCount / exposureCount // 0-1
    const avgSeverity = symptomCount > 0
      ? data.symptomEvents.reduce((sum, e) => sum + e.severity, 0) / symptomCount
      : 0

    // Confidence score (0-100)
    // Factors: exposure count (more = more confident), consistency, severity, repetition
    const exposureWeight = Math.min(exposureCount / 5, 1) // saturates at 5 exposures
    const consistencyWeight = consistency
    const severityWeight = avgSeverity / 10
    const confidenceScore = (exposureWeight * 0.3 + consistencyWeight * 0.4 + severityWeight * 0.3) * 100

    // Suspicion level
    let suspicionLevel: string
    if (exposureCount < 2) {
      suspicionLevel = 'insufficient_data'
    } else if (consistency >= 0.7 && avgSeverity >= 5) {
      suspicionLevel = 'high'
    } else if (consistency >= 0.5 && avgSeverity >= 3) {
      suspicionLevel = 'moderate'
    } else if (consistency >= 0.3 || avgSeverity >= 2) {
      suspicionLevel = 'low'
    } else if (exposureCount >= 3 && symptomCount === 0) {
      suspicionLevel = 'probably_safe'
    } else {
      suspicionLevel = 'insufficient_data'
    }

    // Dominant onset
    const onsets = data.symptomEvents.map(e => e.onset).filter(Boolean) as string[]
    const dominantOnset = onsets.length > 0
      ? onsets.sort((a, b) => onsets.filter(v => v === b).length - onsets.filter(v => v === a).length)[0]
      : null

    // Linked symptoms (most common categories)
    const allCategories = data.symptomEvents.flatMap(e => e.categories)
    const categoryCounts = allCategories.reduce((acc, cat) => {
      acc[cat] = (acc[cat] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    const linkedSymptoms = Object.entries(categoryCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([cat]) => cat)

    results.push({
      userId,
      foodName,
      foodCategory: data.category,
      exposureCount,
      symptomCount,
      avgSeverity,
      consistency,
      confidenceScore,
      suspicionLevel,
      dominantOnset,
      linkedSymptoms,
      lastCalculated: new Date(),
    })
  }

  // 5. Upsert all results
  for (const result of results) {
    await prisma.analysisResult.upsert({
      where: { userId_foodName: { userId: result.userId, foodName: result.foodName } },
      update: {
        ...result,
        updatedAt: new Date(),
      },
      create: result,
    })
  }

  return results
}
