from supabase import Client
from fastapi import HTTPException, status
from config import get_supabase_client, get_supabase_admin_client
import logging

logger = logging.getLogger(__name__)

class AuthHelpers:
    """Helper functions for authentication operations"""
    
    def __init__(self):
        self._supabase = None
        self._admin_client = None
    
    @property
    def supabase(self) -> Client:
        if self._supabase is None:
            self._supabase = get_supabase_client()
        return self._supabase
    
    @property
    def admin_client(self) -> Client:
        if self._admin_client is None:
            self._admin_client = get_supabase_admin_client()
        return self._admin_client
    
    def verify_token(self, token: str):
        """Verify JWT token with Supabase and return user info"""
        try:
            user = self.supabase.auth.get_user(token)
            if user.user is None:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid or expired token"
                )
            return user.user
            
        except Exception as e:
            logger.error(f"Token verification error: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired token"
            )
    
    async def refresh_token(self, refresh_token: str):
        """Refresh access token using refresh token"""
        try:
            auth_response = self.supabase.auth.refresh_session(refresh_token)
            
            if auth_response.session is None:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid refresh token"
                )
            
            return auth_response.session
            
        except Exception as e:
            logger.error(f"Token refresh error: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token"
            )

auth_helpers = AuthHelpers()