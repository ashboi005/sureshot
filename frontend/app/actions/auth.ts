'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete('accessToken')
  cookieStore.delete('role')
  redirect('/auth/login')
}

export async function setAuthCookies(
  token: string,
  role: string,
  expiresIn: string = "3600"
) {
  const cookieStore = await cookies()
  
  cookieStore.set("accessToken", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: parseInt(expiresIn),
  })

  cookieStore.set("role", role, {
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: parseInt(expiresIn),
  })
}