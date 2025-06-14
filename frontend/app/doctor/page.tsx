import React from 'react'
import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
const page = async() => {
    const cookieStore = await cookies()
    console.log('Cookies:', cookieStore.get('role')?.value);
  return (
    <div>
      I am doctor
    </div>
  )
}

export default page
