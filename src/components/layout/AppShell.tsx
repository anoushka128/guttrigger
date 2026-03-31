import BottomNav from './BottomNav'

interface AppShellProps {
  children: React.ReactNode
}

export default function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-stone-50">
      <main className="mx-auto max-w-2xl w-full pb-28 px-4">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
