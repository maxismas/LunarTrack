import { auth } from '@/app/api/auth/[...nextauth]/route'
import { redirect } from 'next/navigation'

export default async function Home() {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  const role = session.user.role

  if (role === 'MANAGER' || role === 'SUPER_ADMIN') {
    redirect('/manager')
  } else if (role === 'EMPLOYEE') {
    redirect('/employee')
  } else if (role === 'HR_ADMIN') {
    redirect('/hr')
  }

  redirect('/login')
}
