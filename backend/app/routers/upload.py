from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from ..auth import get_current_admin
from ..config import settings
from ..models import User
import base64
import httpx

router = APIRouter(prefix="/api/upload", tags=["Upload"])

@router.post("/image")
async def upload_image(
    file: UploadFile = File(...),
    admin: User = Depends(get_current_admin)
):
    """Upload image to ImgBB and return URL"""
    
    # Validate file type
    allowed_types = ["image/jpeg", "image/png", "image/webp", "image/gif"]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Invalid file type. Allowed: JPEG, PNG, WebP, GIF")
    
    # Read file content
    contents = await file.read()
    
    # Max file size: 5MB
    if len(contents) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large. Max size: 5MB")
    
    # Try ImgBB first
    if settings.imgbb_api_key:
        try:
            base64_image = base64.b64encode(contents).decode('utf-8')
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    "https://api.imgbb.com/1/upload",
                    data={
                        "key": settings.imgbb_api_key,
                        "image": base64_image
                    },
                    timeout=30.0
                )
                if response.status_code == 200:
                    data = response.json()
                    return {
                        "url": data["data"]["url"],
                        "delete_url": data["data"]["delete_url"]
                    }
                else:
                    raise HTTPException(status_code=500, detail=f"ImgBB error: {response.text}")
        except httpx.TimeoutException:
            raise HTTPException(status_code=500, detail="Upload timeout. Please try again.")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")
    
    # Try Cloudinary as fallback
    elif all([settings.cloudinary_cloud_name, settings.cloudinary_api_key, settings.cloudinary_api_secret]):
        try:
            import cloudinary
            import cloudinary.uploader
            
            cloudinary.config(
                cloud_name=settings.cloudinary_cloud_name,
                api_key=settings.cloudinary_api_key,
                api_secret=settings.cloudinary_api_secret
            )
            
            result = cloudinary.uploader.upload(
                contents,
                folder="pureglow-products",
                resource_type="image"
            )
            
            return {
                "url": result["secure_url"],
                "public_id": result["public_id"]
            }
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Cloudinary upload failed: {str(e)}")
    
    else:
        raise HTTPException(status_code=500, detail="No image hosting configured. Add IMGBB_API_KEY to environment variables.")
