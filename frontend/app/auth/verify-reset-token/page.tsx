'use client'

import React, { useEffect } from 'react'
import { motion } from "framer-motion";
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const VerifyTokenPage = () => {
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
    
    const verifyResetToken = async () => {
        const tokenData = parseTokenFromHash()
        if (!tokenData || !tokenData.accessToken) {
            console.error('No access token found in URL hash')
            toast.error('Invalid password reset link')
            setTimeout(() => {
                router.push('/auth/forgot-password')
            }, 2000)
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
                setTimeout(() => {
                    router.push('/auth/forgot-password')
                }, 2000)
            }
        } catch (error) {
            console.error('Error verifying reset token:', error)
            toast.error('Failed to verify reset token')
            setTimeout(() => {
                router.push('/auth/forgot-password')
            }, 2000)
        }
    }
    
    useEffect(() => {
        verifyResetToken()
    }, [])
    
    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-[#0c0c0c]">
            <Card className="bg-[#141414] border-[#333] shadow-xl w-full max-w-md">
                <CardHeader className="text-center space-y-4 border-b border-[#333]">
                    <div className="mx-auto w-16 h-16 bg-[#8ed500]/10 rounded-full flex items-center justify-center">
                        <Loader2 className="w-8 h-8 text-[#8ed500] animate-spin" />
                    </div>
                    <div>
                        <CardTitle className="text-2xl font-bold text-white">Verifying reset token</CardTitle>
                        <CardDescription className="mt-2 text-gray-400">
                            Please wait while we verify your password reset token...
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="pt-6 text-center text-sm text-gray-400">
                    You will be redirected automatically once verification is complete.
                </CardContent>
            </Card>
            
          
        </div>
    )
}

export default VerifyTokenPage