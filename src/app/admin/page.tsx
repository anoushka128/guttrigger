import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { format } from 'date-fns'

// Simple password protection via query param: /admin?key=your_admin_key
export default async function AdminPage(props: { searchParams: Promise<{ key?: string }> }) {
  const { key } = await props.searchParams
  const adminKey = process.env.ADMIN_SECRET_KEY

  if (!adminKey || key !== adminKey) {
    redirect('/login')
  }

  let users: { id: string; email: string; name: string | null; createdAt: Date }[] = []
  let dbError = false

  try {
    users = await prisma.user.findMany({
      select: { id: true, email: true, name: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    })
  } catch {
    dbError = true
  }

  const emailList = users.map(u => u.email).join('\n')

  return (
    <div className="min-h-screen bg-stone-50 p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-stone-900">Registered Emails</h1>
          <p className="text-sm text-stone-500 mt-1">{users.length} user{users.length !== 1 ? 's' : ''} total</p>
        </div>

        {dbError && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
            Database not connected. Check DATABASE_URL in .env.local.
          </div>
        )}

        {!dbError && (
          <>
            {/* Table */}
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
              {users.length === 0 ? (
                <p className="text-sm text-stone-400 p-6">No users registered yet.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead className="border-b border-stone-100">
                    <tr>
                      <th className="text-left text-xs font-semibold text-stone-500 uppercase tracking-wide px-5 py-3">Email</th>
                      <th className="text-left text-xs font-semibold text-stone-500 uppercase tracking-wide px-5 py-3">Name</th>
                      <th className="text-left text-xs font-semibold text-stone-500 uppercase tracking-wide px-5 py-3">Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u, i) => (
                      <tr key={u.id} className={i % 2 === 0 ? '' : 'bg-stone-50'}>
                        <td className="px-5 py-3 text-stone-900 font-medium">{u.email}</td>
                        <td className="px-5 py-3 text-stone-600">{u.name ?? '—'}</td>
                        <td className="px-5 py-3 text-stone-400">{format(u.createdAt, 'MMM d, yyyy')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Plain-text copy box */}
            {users.length > 0 && (
              <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 space-y-2">
                <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide">Copy all emails</p>
                <textarea
                  readOnly
                  value={emailList}
                  rows={Math.min(users.length, 10)}
                  className="w-full text-sm text-stone-700 bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 font-mono resize-none focus:outline-none"
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
