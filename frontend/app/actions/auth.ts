'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { removeLocalStorage } from '@/lib/utils'

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete('accessToken')
  cookieStore.delete('role')
  removeLocalStorage('accessToken')
  removeLocalStorage('role')

  redirect('/')
}