export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-svh bg-stone-50 flex flex-col">
      {children}
    </div>
  )
}
