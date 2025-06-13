from fastapi import HTTPException, status, UploadFile
from config import get_supabase_storage
import uuid
import os
from typing import Optional
import logging

logger = logging.getLogger(__name__)

ALLOWED_DOCUMENT_TYPES = [
    "image/jpeg", "image/jpg", "image/png", "image/webp",
    "application/pdf", 
    "application/msword", 
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
]

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

async def upload_worker_profile_document(file: UploadFile, document_type: str, worker_user_id: str) -> dict:
    """
    Upload worker profile documents to Supabase storage
    
    Args:
        file: The uploaded file
        document_type: Type of document (certificate, government_id, etc.)
        worker_user_id: ID of the worker uploading the document
    
    Returns:
        dict: Contains file_url, file_name, file_size, content_type, upload_path
    """
    try:
        # Validate file type
        if file.content_type not in ALLOWED_DOCUMENT_TYPES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File type {file.content_type} not allowed. Allowed types: {', '.join(ALLOWED_DOCUMENT_TYPES)}"
            )
        
        # Check file size
        file_content = await file.read()
        if len(file_content) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File size exceeds maximum allowed size of {MAX_FILE_SIZE // (1024*1024)}MB"
            )
        
        # Reset file pointer
        await file.seek(0)
        
        # Generate unique filename
        file_extension = os.path.splitext(file.filename)[1] if file.filename else ""
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        
        # Create upload path: workers/user_id/document_type/filename
        upload_path = f"workers/{worker_user_id}/{document_type}/{unique_filename}"
        
        # Upload to Supabase storage
        storage = get_supabase_storage()
        bucket_name = os.getenv("SUPABASE_STORAGE_BUCKET", "documents")
        
        # Upload the file
        result = storage.from_(bucket_name).upload(
            path=upload_path,
            file=file_content,
            file_options={
                "content-type": file.content_type,
                "cache-control": "3600"
            }
        )
        
        if hasattr(result, 'error') and result.error:
            logger.error(f"Supabase upload error: {result.error}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to upload file to storage"
            )
        
        # Get public URL
        public_url_result = storage.from_(bucket_name).get_public_url(upload_path)
        
        return {
            "file_url": public_url_result,
            "file_name": file.filename,
            "file_size": len(file_content),
            "content_type": file.content_type,
            "upload_path": upload_path
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Document upload failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Document upload failed"
        )
