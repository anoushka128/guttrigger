export default function AppLoading() {
  return (
    <div className="pt-6 pb-32 space-y-5 animate-pulse">
      {/* Greeting skeleton */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="h-7 w-48 bg-stone-200 rounded-xl" />
          <div className="h-4 w-32 bg-stone-100 rounded-lg" />
        </div>
        <div className="w-9 h-9 bg-stone-200 rounded-xl" />
      </div>

      {/* Banner skeleton */}
      <div className="h-20 bg-stone-100 rounded-2xl" />

      {/* Stats grid skeleton */}
      <div className="bg-white rounded-2xl border border-stone-100 p-5">
        <div className="h-4 w-28 bg-stone-100 rounded-lg mb-4" />
        <div className="grid grid-cols-3 gap-3">
          {[0, 1, 2].map(i => (
            <div key={i} className="h-16 bg-stone-100 rounded-xl" />
          ))}
        </div>
      </div>

      {/* Quick actions skeleton */}
      <div className="grid grid-cols-3 gap-3">
        {[0, 1, 2].map(i => (
          <div key={i} className="h-20 bg-stone-100 rounded-2xl" />
        ))}
      </div>

      {/* Card skeleton */}
      <div className="bg-white rounded-2xl border border-stone-100 p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="h-4 w-32 bg-stone-100 rounded-lg" />
          <div className="h-4 w-14 bg-stone-100 rounded-lg" />
        </div>
        {[0, 1, 2].map(i => (
          <div key={i} className="h-14 bg-stone-50 rounded-xl" />
        ))}
      </div>

      {/* Chart skeleton */}
      <div className="bg-white rounded-2xl border border-stone-100 p-5 space-y-3">
        <div className="h-4 w-40 bg-stone-100 rounded-lg" />
        <div className="h-4 w-24 bg-stone-50 rounded-lg" />
        <div className="h-32 bg-stone-50 rounded-xl" />
      </div>
    </div>
  )
}
