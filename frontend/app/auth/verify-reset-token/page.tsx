'use client'
import React, { useEffect } from 'react'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import {toast} from 'sonner'
const page = () => {
    const router = useRouter()
    function parseTokenFromHash() {
        if (typeof window === 'undefined') return null

        const hash = window.location.hash.substring(1)
        const params = new URLSearchParams(hash)
        return {
            accessToken: params.get('access_token'),
            refreshToken: params.get('refresh_token'),
            expiresAt: params.get('expires_at'),
            tokenType: params.get('token_type')
        }
    }
    const verifyResetToken=async()=>{
        const tokenData = parseTokenFromHash()
        if (!tokenData || !tokenData.accessToken) {
            console.error('No access token found in URL hash')
            return
        }
        try {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/verify-reset-token`, {
                access_token: tokenData.accessToken,
                refresh_token: tokenData.refreshToken,
            }) 
            if(response.status === 200) {
toast.success('Password reset token verified successfully')
                
                const resetPasswordUrl = new URL(
                    `${window.location.origin}/auth/reset-password`
                )
                resetPasswordUrl.searchParams.append('access_token', tokenData.accessToken)
                if (tokenData.refreshToken) {
                    resetPasswordUrl.searchParams.append('refresh_token', tokenData.refreshToken)
                }

                router.push(resetPasswordUrl.toString())
            } else {
                toast.error('Failed to verify password reset token')
            }


        } catch (error) {
            console.error('Error verifying reset token:', error)
        }
    }
    useEffect(()=>{
        verifyResetToken()
    },[])
    return (
        <div>
        </div>
    )
}

export default page
