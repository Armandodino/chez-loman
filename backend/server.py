from fastapi import FastAPI, APIRouter, HTTPException, UploadFile, File, Form
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from starlette.staticfiles import StaticFiles
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import io
import csv
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import base64
import shutil

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Create uploads directory
UPLOADS_DIR = ROOT_DIR / "uploads"
UPLOADS_DIR.mkdir(exist_ok=True)

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL', '').strip().replace('\\n', '').replace('\n', '')
if not mongo_url:
    logging.warning("MONGO_URL not set - using default local MongoDB")
    mongo_url = 'mongodb://localhost:27017'
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'chezloman')]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# ==================== MODELS ====================

class MenuItem(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    price: int
    category: str
    image_url: str
    is_featured: bool = False
    is_available: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class MenuItemCreate(BaseModel):
    name: str
    description: str
    price: int
    category: str
    image_url: str
    is_featured: bool = False

class DailyMenu(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    date: str  # Format: YYYY-MM-DD
    items: List[str]  # List of menu item names or descriptions
    special_message: Optional[str] = None
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class DailyMenuCreate(BaseModel):
    date: str
    items: List[str]
    special_message: Optional[str] = None

class DailyMenuUpdate(BaseModel):
    items: Optional[List[str]] = None
    special_message: Optional[str] = None
    is_active: Optional[bool] = None

class GalleryPhoto(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    image_url: str
    caption: Optional[str] = None
    category: str = "restaurant"  # restaurant, plats, clients, ambiance
    is_featured: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class GalleryPhotoCreate(BaseModel):
    image_url: str
    caption: Optional[str] = None
    category: str = "restaurant"
    is_featured: bool = False

class Review(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    author: str
    rating: int = 5
    comment: str
    is_approved: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ReviewCreate(BaseModel):
    author: str
    comment: str
    rating: int = 5

class Video(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    video_url: str  # YouTube, Facebook, or direct URL
    video_type: str = "youtube"  # youtube, facebook, direct
    description: Optional[str] = None
    is_featured: bool = False
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class VideoCreate(BaseModel):
    title: str
    video_url: str
    video_type: str = "youtube"
    description: Optional[str] = None
    is_featured: bool = False

class Promotion(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    image_url: Optional[str] = None
    promo_type: str = "banner"  # banner, popup, announcement
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class PromotionCreate(BaseModel):
    title: str
    description: str
    image_url: Optional[str] = None
    promo_type: str = "banner"
    start_date: Optional[str] = None
    end_date: Optional[str] = None

class PromotionUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    is_active: Optional[bool] = None

class HeroContent(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title_line1: str = "Ici c'est manger"
    title_line2: str = "bien hein"
    description: str = "Une cuisine ivoirienne authentique, sublimée par notre savoir-faire. Découvrez les saveurs du pays dans un cadre raffiné."
    background_image: str = "https://customer-assets.emergentagent.com/job_loman-restaurant/artifacts/jde9y3pb_chl.jpg"
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class HeroContentUpdate(BaseModel):
    title_line1: Optional[str] = None
    title_line2: Optional[str] = None
    description: Optional[str] = None
    background_image: Optional[str] = None

# ==================== DASHBOARD MODELS ====================

class Transaction(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    type: str  # "revenu" ou "depense"
    category: str  # ingredients, personnel, loyer, utilities, marketing, ventes, etc.
    amount: int  # en FCFA
    description: str
    date: str  # Format: YYYY-MM-DD
    payment_method: Optional[str] = None  # cash, mobile_money, carte
    reference: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class TransactionCreate(BaseModel):
    type: str
    category: str
    amount: int
    description: str
    date: Optional[str] = None
    payment_method: Optional[str] = None
    reference: Optional[str] = None

class Order(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    order_number: str
    customer_name: Optional[str] = None
    customer_phone: Optional[str] = None
    customer_address: Optional[str] = None
    items: List[dict]  # [{name, quantity, price}]
    total: int
    delivery_fee: int = 0
    platform_fee: int = 0
    status: str = "en_attente"  # en_attente, en_preparation, pret, en_livraison, livre, annule
    order_type: str = "sur_place"  # sur_place, emporter, glovo, yango, livraison_directe
    platform: Optional[str] = None  # glovo, yango, null for direct
    delivery_person: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class OrderCreate(BaseModel):
    customer_name: Optional[str] = None
    customer_phone: Optional[str] = None
    customer_address: Optional[str] = None
    items: List[dict]
    total: int
    delivery_fee: int = 0
    platform_fee: int = 0
    order_type: str = "sur_place"
    platform: Optional[str] = None
    delivery_person: Optional[str] = None
    notes: Optional[str] = None

class Notification(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    type: str  # commande, alerte, rappel, info
    title: str
    message: str
    priority: str = "normale"  # basse, normale, haute, urgente
    is_read: bool = False
    action_url: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StockItem(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    category: str  # viandes, poissons, legumes, boissons, epices, etc.
    quantity: float
    unit: str  # kg, L, unites
    min_quantity: float  # seuil d'alerte
    price_per_unit: int
    supplier: Optional[str] = None
    last_restock: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StockItemCreate(BaseModel):
    name: str
    category: str
    quantity: float
    unit: str
    min_quantity: float
    price_per_unit: int
    supplier: Optional[str] = None

class Reservation(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    customer_name: str
    customer_phone: str
    date: str
    time: str
    guests: int
    notes: Optional[str] = None
    status: str = "confirmee"  # en_attente, confirmee, annulee, terminee
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ReservationCreate(BaseModel):
    customer_name: str
    customer_phone: str
    date: str
    time: str
    guests: int
    notes: Optional[str] = None

class CashSale(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    items: List[dict]
    total: int
    payment_method: str
    note: Optional[str] = None
    sale_date: str = Field(default_factory=lambda: datetime.now(timezone.utc).strftime("%Y-%m-%d"))
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CashSaleCreate(BaseModel):
    items: List[dict]  # [{name: str, quantity: int, price: int}]
    total: int
    payment_method: str  # "especes" or "mobile_money"
    note: Optional[str] = None

class AIMessage(BaseModel):
    message: str
    context: Optional[dict] = None

class AdminLogin(BaseModel):
    username: str
    password: str

class AdminUser(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    username: str
    password_hash: str
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Admin credentials - Default admin account
ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "chezloman2024"

class RestaurantInfo(BaseModel):
    name: str = "Chez Loman"
    slogan: str = "Ici c'est manger bien hein 😋"
    description: str = "Cuisine ivoirienne 🇨🇮 & africaine — Goût du pays + niveau haut 👌🏾"
    phone: str = "+225 07 09 508 819"
    whatsapp: str = "2250709508819"
    address: str = "Yopougon Abobo Doumé — Basile Boli"
    hours: dict = {
        "dimanche": "13:00–22:00",
        "lundi": "Fermé",
        "mardi": "11:00–22:00",
        "mercredi": "11:00–22:00",
        "jeudi": "11:00–22:00",
        "vendredi": "11:00–22:00",
        "samedi": "11:00–22:00"
    }

# ==================== HELPER FUNCTIONS ====================

def serialize_datetime(obj):
    """Convert datetime to ISO string for MongoDB storage"""
    if isinstance(obj.get('created_at'), datetime):
        obj['created_at'] = obj['created_at'].isoformat()
    return obj

def deserialize_datetime(obj):
    """Convert ISO string back to datetime"""
    if isinstance(obj.get('created_at'), str):
        obj['created_at'] = datetime.fromisoformat(obj['created_at'])
    return obj

# ==================== ROUTES ====================

@api_router.get("/")
async def root():
    return {"message": "Bienvenue chez Loman API"}

@api_router.get("/info", response_model=RestaurantInfo)
async def get_restaurant_info():
    return RestaurantInfo()

# ---- Admin Authentication ----
@api_router.post("/admin/login")
async def admin_login(login: AdminLogin):
    if login.username == ADMIN_USERNAME and login.password == ADMIN_PASSWORD:
        # Generate a simple token (in production, use JWT)
        token = str(uuid.uuid4())
        # Store token in database
        await db.admin_sessions.delete_many({})  # Clear old sessions
        await db.admin_sessions.insert_one({
            "token": token,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "expires_at": (datetime.now(timezone.utc) + timedelta(hours=24)).isoformat()
        })
        return {"success": True, "token": token, "message": "Connexion réussie"}
    else:
        raise HTTPException(status_code=401, detail="Nom d'utilisateur ou mot de passe incorrect")

@api_router.post("/admin/verify")
async def verify_admin_token(token: str):
    session = await db.admin_sessions.find_one({"token": token})
    if session:
        expires_at = datetime.fromisoformat(session["expires_at"])
        if datetime.now(timezone.utc) < expires_at:
            return {"valid": True}
    return {"valid": False}

@api_router.post("/admin/logout")
async def admin_logout():
    await db.admin_sessions.delete_many({})
    return {"success": True, "message": "Déconnexion réussie"}

# ---- File Upload ----
@api_router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    # Validate file type
    allowed_types = ["image/jpeg", "image/png", "image/gif", "image/webp", "video/mp4", "video/webm"]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Type de fichier non autorisé. Utilisez JPG, PNG, GIF, WEBP, MP4 ou WEBM")
    
    # Generate unique filename
    file_ext = file.filename.split(".")[-1] if "." in file.filename else "jpg"
    unique_filename = f"{uuid.uuid4()}.{file_ext}"
    file_path = UPLOADS_DIR / unique_filename
    
    # Save file
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de l'upload: {str(e)}")
    
    # Return the URL to access the file
    file_url = f"/api/uploads/{unique_filename}"
    return {"success": True, "url": file_url, "filename": unique_filename}

@api_router.get("/uploads/{filename}")
async def get_uploaded_file(filename: str):
    from starlette.responses import FileResponse
    file_path = UPLOADS_DIR / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Fichier non trouvé")
    return FileResponse(file_path)

# ---- Menu Items ----
@api_router.get("/menu", response_model=List[MenuItem])
async def get_menu_items(category: Optional[str] = None):
    query = {} if not category else {"category": category}
    items = await db.menu_items.find(query, {"_id": 0}).to_list(100)
    for item in items:
        deserialize_datetime(item)
    return items

@api_router.get("/menu/featured", response_model=List[MenuItem])
async def get_featured_items():
    items = await db.menu_items.find({"is_featured": True}, {"_id": 0}).to_list(10)
    for item in items:
        deserialize_datetime(item)
    return items

@api_router.post("/menu", response_model=MenuItem)
async def create_menu_item(item: MenuItemCreate):
    menu_item = MenuItem(**item.model_dump())
    doc = serialize_datetime(menu_item.model_dump())
    await db.menu_items.insert_one(doc)
    return menu_item

@api_router.delete("/menu/{item_id}")
async def delete_menu_item(item_id: str):
    result = await db.menu_items.delete_one({"id": item_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Item not found")
    return {"message": "Item deleted"}

# ---- Daily Menu ----
@api_router.get("/daily-menu", response_model=Optional[DailyMenu])
async def get_daily_menu():
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    menu = await db.daily_menus.find_one({"date": today, "is_active": True}, {"_id": 0})
    if menu:
        deserialize_datetime(menu)
    return menu

@api_router.get("/daily-menus", response_model=List[DailyMenu])
async def get_all_daily_menus():
    menus = await db.daily_menus.find({}, {"_id": 0}).sort("date", -1).to_list(30)
    for menu in menus:
        deserialize_datetime(menu)
    return menus

@api_router.post("/daily-menu", response_model=DailyMenu)
async def create_daily_menu(menu: DailyMenuCreate):
    # Deactivate previous menu for same date
    await db.daily_menus.update_many({"date": menu.date}, {"$set": {"is_active": False}})
    daily_menu = DailyMenu(**menu.model_dump())
    doc = serialize_datetime(daily_menu.model_dump())
    await db.daily_menus.insert_one(doc)
    return daily_menu

@api_router.put("/daily-menu/{menu_id}", response_model=DailyMenu)
async def update_daily_menu(menu_id: str, update: DailyMenuUpdate):
    update_dict = {k: v for k, v in update.model_dump().items() if v is not None}
    if not update_dict:
        raise HTTPException(status_code=400, detail="No fields to update")
    result = await db.daily_menus.update_one({"id": menu_id}, {"$set": update_dict})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Menu not found")
    updated = await db.daily_menus.find_one({"id": menu_id}, {"_id": 0})
    deserialize_datetime(updated)
    return updated

@api_router.delete("/daily-menu/{menu_id}")
async def delete_daily_menu(menu_id: str):
    result = await db.daily_menus.delete_one({"id": menu_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Menu not found")
    return {"message": "Menu deleted"}

# ---- Gallery ----
@api_router.get("/gallery", response_model=List[GalleryPhoto])
async def get_gallery(category: Optional[str] = None):
    query = {} if not category else {"category": category}
    photos = await db.gallery.find(query, {"_id": 0}).sort("created_at", -1).to_list(100)
    for photo in photos:
        deserialize_datetime(photo)
    return photos

@api_router.post("/gallery", response_model=GalleryPhoto)
async def add_gallery_photo(photo: GalleryPhotoCreate):
    gallery_photo = GalleryPhoto(**photo.model_dump())
    doc = serialize_datetime(gallery_photo.model_dump())
    await db.gallery.insert_one(doc)
    return gallery_photo

@api_router.delete("/gallery/{photo_id}")
async def delete_gallery_photo(photo_id: str):
    result = await db.gallery.delete_one({"id": photo_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Photo not found")
    return {"message": "Photo deleted"}

# ---- Reviews ----
@api_router.get("/reviews", response_model=List[Review])
async def get_reviews():
    reviews = await db.reviews.find({"is_approved": True}, {"_id": 0}).sort("created_at", -1).to_list(50)
    for review in reviews:
        deserialize_datetime(review)
    return reviews

@api_router.post("/reviews", response_model=Review)
async def create_review(review: ReviewCreate):
    new_review = Review(**review.model_dump(), is_approved=False)
    doc = serialize_datetime(new_review.model_dump())
    await db.reviews.insert_one(doc)
    return new_review

@api_router.get("/reviews/all")
async def get_all_reviews():
    reviews = await db.reviews.find({}, {"_id": 0}).sort("created_at", -1).to_list(100)
    for review in reviews:
        deserialize_datetime(review)
    return reviews

@api_router.put("/reviews/{review_id}/approve")
async def approve_review(review_id: str):
    result = await db.reviews.update_one({"id": review_id}, {"$set": {"is_approved": True}})
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Review not found")
    return {"message": "Review approved"}

@api_router.put("/reviews/{review_id}/hide")
async def hide_review(review_id: str):
    result = await db.reviews.update_one({"id": review_id}, {"$set": {"is_approved": False}})
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Review not found")
    return {"message": "Review hidden"}

@api_router.delete("/reviews/{review_id}")
async def delete_review(review_id: str):
    result = await db.reviews.delete_one({"id": review_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Review not found")
    return {"message": "Review deleted"}

# ---- Videos ----
@api_router.get("/videos", response_model=List[Video])
async def get_videos(active_only: bool = False):
    query = {"is_active": True} if active_only else {}
    videos = await db.videos.find(query, {"_id": 0}).sort("created_at", -1).to_list(50)
    for video in videos:
        deserialize_datetime(video)
    return videos

@api_router.post("/videos", response_model=Video)
async def create_video(video: VideoCreate):
    new_video = Video(**video.model_dump())
    doc = serialize_datetime(new_video.model_dump())
    await db.videos.insert_one(doc)
    return new_video

@api_router.put("/videos/{video_id}")
async def update_video(video_id: str, is_active: bool):
    result = await db.videos.update_one({"id": video_id}, {"$set": {"is_active": is_active}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Video not found")
    return {"message": "Video updated"}

@api_router.delete("/videos/{video_id}")
async def delete_video(video_id: str):
    result = await db.videos.delete_one({"id": video_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Video not found")
    return {"message": "Video deleted"}

# ---- Promotions ----
@api_router.get("/promotions", response_model=List[Promotion])
async def get_promotions(active_only: bool = False):
    query = {"is_active": True} if active_only else {}
    promotions = await db.promotions.find(query, {"_id": 0}).sort("created_at", -1).to_list(50)
    for promo in promotions:
        deserialize_datetime(promo)
    return promotions

@api_router.post("/promotions", response_model=Promotion)
async def create_promotion(promo: PromotionCreate):
    new_promo = Promotion(**promo.model_dump())
    doc = serialize_datetime(new_promo.model_dump())
    await db.promotions.insert_one(doc)
    return new_promo

@api_router.put("/promotions/{promo_id}", response_model=Promotion)
async def update_promotion(promo_id: str, update: PromotionUpdate):
    update_dict = {k: v for k, v in update.model_dump().items() if v is not None}
    if not update_dict:
        raise HTTPException(status_code=400, detail="No fields to update")
    result = await db.promotions.update_one({"id": promo_id}, {"$set": update_dict})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Promotion not found")
    updated = await db.promotions.find_one({"id": promo_id}, {"_id": 0})
    deserialize_datetime(updated)
    return updated

@api_router.delete("/promotions/{promo_id}")
async def delete_promotion(promo_id: str):
    result = await db.promotions.delete_one({"id": promo_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Promotion not found")
    return {"message": "Promotion deleted"}

# ---- Hero Content ----
@api_router.get("/hero-content", response_model=HeroContent)
async def get_hero_content():
    hero = await db.hero_content.find_one({}, {"_id": 0})
    if not hero:
        # Return default content
        default_hero = HeroContent()
        doc = serialize_datetime(default_hero.model_dump())
        await db.hero_content.insert_one(doc)
        return default_hero
    deserialize_datetime(hero)
    return hero

@api_router.put("/hero-content", response_model=HeroContent)
async def update_hero_content(update: HeroContentUpdate):
    update_dict = {k: v for k, v in update.model_dump().items() if v is not None}
    if not update_dict:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    update_dict["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    # Check if hero content exists
    existing = await db.hero_content.find_one({})
    if existing:
        await db.hero_content.update_one({}, {"$set": update_dict})
    else:
        # Create new hero content with defaults
        hero = HeroContent(**update_dict)
        doc = serialize_datetime(hero.model_dump())
        await db.hero_content.insert_one(doc)
    
    updated = await db.hero_content.find_one({}, {"_id": 0})
    deserialize_datetime(updated)
    return updated

# ---- Menu Items Management ----
@api_router.put("/menu/{item_id}", response_model=MenuItem)
async def update_menu_item(item_id: str, name: Optional[str] = None, price: Optional[int] = None, 
                           description: Optional[str] = None, is_available: Optional[bool] = None,
                           is_featured: Optional[bool] = None, image_url: Optional[str] = None,
                           category: Optional[str] = None):
    update_dict = {}
    if name is not None: update_dict["name"] = name
    if price is not None: update_dict["price"] = price
    if description is not None: update_dict["description"] = description
    if is_available is not None: update_dict["is_available"] = is_available
    if is_featured is not None: update_dict["is_featured"] = is_featured
    if image_url is not None: update_dict["image_url"] = image_url
    if category is not None: update_dict["category"] = category
    
    if not update_dict:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    result = await db.menu_items.update_one({"id": item_id}, {"$set": update_dict})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Menu item not found")
    
    updated = await db.menu_items.find_one({"id": item_id}, {"_id": 0})
    deserialize_datetime(updated)
    return updated

# ---- Seed Data ----
@api_router.post("/seed")
async def seed_data():
    # Check if data already exists
    existing = await db.menu_items.count_documents({})
    if existing > 0:
        return {"message": "Data already seeded"}
    
    # Seed menu items
    menu_items = [
        {"name": "Attièkè Poisson Braisé", "description": "Attièkè frais avec poisson braisé aux épices africaines, servi avec piment et oignons", "price": 3500, "category": "Plats Ivoiriens", "image_url": "https://images.unsplash.com/photo-1602022131768-033a8796e78d?w=400", "is_featured": True},
        {"name": "Poulet Braisé", "description": "Poulet fermier braisé à la perfection, mariné aux épices secrètes du chef", "price": 4000, "category": "Grillades", "image_url": "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=400", "is_featured": True},
        {"name": "Foutou Banane Sauce Graine", "description": "Foutou banane traditionnel avec sauce graine de palme et viande", "price": 3000, "category": "Plats Ivoiriens", "image_url": "https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=400", "is_featured": True},
        {"name": "Alloco Poisson", "description": "Bananes plantains frites dorées avec poisson frit croustillant", "price": 2500, "category": "Plats Ivoiriens", "image_url": "https://images.unsplash.com/photo-1632778149955-e80f8ceca2e8?w=400", "is_featured": False},
        {"name": "Garba", "description": "Attiéké avec thon frit, oignons et piment - le classique ivoirien", "price": 1500, "category": "Plats Ivoiriens", "image_url": "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400", "is_featured": False},
        {"name": "Côtes de Porc Braisées", "description": "Côtes de porc tendres braisées avec sauce spéciale maison", "price": 5000, "category": "Grillades", "image_url": "https://images.unsplash.com/photo-1544025162-d76694265947?w=400", "is_featured": True},
        {"name": "Brochettes de Bœuf", "description": "Brochettes de bœuf marinées, grillées au feu de bois", "price": 3500, "category": "Grillades", "image_url": "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400", "is_featured": False},
        {"name": "Tilapia Braisé Entier", "description": "Tilapia entier braisé aux herbes et épices africaines", "price": 6000, "category": "Grillades", "image_url": "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400", "is_featured": True},
        {"name": "Bissap", "description": "Jus d'hibiscus frais et naturel - rafraîchissant", "price": 500, "category": "Boissons", "image_url": "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=400", "is_featured": False},
        {"name": "Gnamakoudji", "description": "Jus de gingembre pimenté fait maison", "price": 500, "category": "Boissons", "image_url": "https://images.unsplash.com/photo-1597318181409-cf64d0b5d8a2?w=400", "is_featured": False},
        {"name": "Jus de Baobab", "description": "Bouye - jus de fruit de baobab crémeux", "price": 600, "category": "Boissons", "image_url": "https://images.unsplash.com/photo-1534353473418-4cfa6c56fd38?w=400", "is_featured": False},
        {"name": "Kedjenou de Poulet", "description": "Poulet mijoté à l'étouffée avec légumes, spécialité Baoulé", "price": 4500, "category": "Spécialités", "image_url": "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400", "is_featured": True},
        {"name": "Sauce Arachide", "description": "Sauce onctueuse aux arachides avec viande et riz", "price": 3000, "category": "Spécialités", "image_url": "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400", "is_featured": False},
        {"name": "Placali Sauce Kopè", "description": "Placali avec sauce kopè aux crabes - délice du sud", "price": 4000, "category": "Spécialités", "image_url": "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=400", "is_featured": False},
    ]
    
    for item in menu_items:
        menu_obj = MenuItem(**item)
        doc = serialize_datetime(menu_obj.model_dump())
        await db.menu_items.insert_one(doc)
    
    # Seed gallery photos
    gallery_photos = [
        {"image_url": "https://customer-assets.emergentagent.com/job_b5c0ff47-ce71-407d-b22b-390360e9dd58/artifacts/ha2l407l_cv.jpg", "caption": "Nos clients apprécient nos plats", "category": "clients", "is_featured": True},
        {"image_url": "https://customer-assets.emergentagent.com/job_b5c0ff47-ce71-407d-b22b-390360e9dd58/artifacts/07tbw3nn_cc.jpg", "caption": "Ambiance familiale chez Loman", "category": "clients", "is_featured": True},
        {"image_url": "https://customer-assets.emergentagent.com/job_b5c0ff47-ce71-407d-b22b-390360e9dd58/artifacts/smtxt9or_chl.jpg", "caption": "Notre équipe dévouée", "category": "restaurant", "is_featured": True},
    ]
    
    for photo in gallery_photos:
        photo_obj = GalleryPhoto(**photo)
        doc = serialize_datetime(photo_obj.model_dump())
        await db.gallery.insert_one(doc)
    
    # Seed reviews
    reviews = [
        {"author": "Aminata K.", "rating": 5, "comment": "Meilleur attièkè poisson de Yopougon! On se croirait chez maman. Je recommande à 100%!"},
        {"author": "Jean-Marc D.", "rating": 5, "comment": "Le poulet braisé est incroyable. Ambiance chaleureuse et service impeccable."},
        {"author": "Fatou S.", "rating": 4, "comment": "Très bonne cuisine, portions généreuses. Le foutou sauce graine m'a rappelé mon village."},
        {"author": "Kouadio B.", "rating": 5, "comment": "Enfin un resto qui respecte les vraies saveurs ivoiriennes! Les brochettes sont top!"},
        {"author": "Marie-Claire A.", "rating": 5, "comment": "Cadre agréable, nourriture excellente. Parfait pour les repas en famille."},
    ]
    
    for review in reviews:
        review_obj = Review(**review)
        doc = serialize_datetime(review_obj.model_dump())
        await db.reviews.insert_one(doc)
    
    # Seed daily menu
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    daily_menu = DailyMenu(
        date=today,
        items=[
            "Attièkè Poisson Braisé - 3500 FCFA",
            "Foutou Sauce Graine - 3000 FCFA",
            "Poulet Braisé + Alloco - 4500 FCFA",
            "Garba Spécial - 2000 FCFA"
        ],
        special_message="Aujourd'hui: Bissap offert pour toute commande de plus de 5000 FCFA! 🎉"
    )
    doc = serialize_datetime(daily_menu.model_dump())
    await db.daily_menus.insert_one(doc)
    
    return {"message": "Data seeded successfully"}

# ==================== DASHBOARD ENDPOINTS ====================

# Import AI service
try:
    from backend.ai_service import ai_service
except ImportError:
    from ai_service import ai_service

# ---- Dashboard Stats ----
@api_router.get("/dashboard/stats")
async def get_dashboard_stats():
    """Get all dashboard statistics"""
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    week_ago = (datetime.now(timezone.utc) - timedelta(days=7)).strftime("%Y-%m-%d")
    month_ago = (datetime.now(timezone.utc) - timedelta(days=30)).strftime("%Y-%m-%d")
    
    # Get transactions
    all_transactions = await db.transactions.find({}, {"_id": 0}).to_list(1000)
    
    # Calculate revenues and expenses
    today_revenue = sum(t["amount"] for t in all_transactions if t.get("type") == "revenu" and t.get("date") == today)
    today_expenses = sum(t["amount"] for t in all_transactions if t.get("type") == "depense" and t.get("date") == today)
    
    week_revenue = sum(t["amount"] for t in all_transactions if t.get("type") == "revenu" and t.get("date", "") >= week_ago)
    week_expenses = sum(t["amount"] for t in all_transactions if t.get("type") == "depense" and t.get("date", "") >= week_ago)
    
    month_revenue = sum(t["amount"] for t in all_transactions if t.get("type") == "revenu" and t.get("date", "") >= month_ago)
    month_expenses = sum(t["amount"] for t in all_transactions if t.get("type") == "depense" and t.get("date", "") >= month_ago)
    
    # Get orders count
    today_orders = await db.orders.count_documents({"created_at": {"$gte": datetime.now(timezone.utc).replace(hour=0, minute=0, second=0)}})
    pending_orders = await db.orders.count_documents({"status": {"$in": ["en_attente", "en_preparation"]}})
    
    # Get unread notifications
    unread_notifications = await db.notifications.count_documents({"is_read": False})
    
    # Get low stock items
    low_stock = await db.stock.find({"$expr": {"$lte": ["$quantity", "$min_quantity"]}}, {"_id": 0}).to_list(100)
    
    # Get today's reservations
    today_reservations = await db.reservations.count_documents({"date": today})
    
    # Calculate trends (mock for now if no historical data)
    revenue_trend = 12.5  # percentage
    orders_trend = 8.3
    
    return {
        "revenus": {
            "aujourd_hui": today_revenue,
            "semaine": week_revenue,
            "mois": month_revenue,
            "tendance": revenue_trend
        },
        "depenses": {
            "aujourd_hui": today_expenses,
            "semaine": week_expenses,
            "mois": month_expenses
        },
        "benefices": {
            "aujourd_hui": today_revenue - today_expenses,
            "semaine": week_revenue - week_expenses,
            "mois": month_revenue - month_expenses
        },
        "commandes": {
            "aujourd_hui": today_orders,
            "en_attente": pending_orders,
            "tendance": orders_trend
        },
        "notifications_non_lues": unread_notifications,
        "alertes_stock": len(low_stock),
        "reservations_aujourd_hui": today_reservations,
        "score_sante": 78  # Calculated health score
    }

@api_router.get("/dashboard/chart-data")
async def get_chart_data(period: str = "7"):
    """Get chart data for specified period in days"""
    days = int(period)
    start_date = (datetime.now(timezone.utc) - timedelta(days=days)).strftime("%Y-%m-%d")
    
    transactions = await db.transactions.find(
        {"date": {"$gte": start_date}},
        {"_id": 0}
    ).to_list(1000)
    
    # Group by date
    data_by_date = {}
    for t in transactions:
        date = t.get("date", "")
        if date not in data_by_date:
            data_by_date[date] = {"date": date, "revenus": 0, "depenses": 0}
        if t.get("type") == "revenu":
            data_by_date[date]["revenus"] += t.get("amount", 0)
        else:
            data_by_date[date]["depenses"] += t.get("amount", 0)
    
    # Fill missing dates
    result = []
    current = datetime.now(timezone.utc) - timedelta(days=days)
    for i in range(days + 1):
        date_str = current.strftime("%Y-%m-%d")
        if date_str in data_by_date:
            result.append(data_by_date[date_str])
        else:
            result.append({"date": date_str, "revenus": 0, "depenses": 0})
        current += timedelta(days=1)
    
    return result

# ---- Transactions (Comptabilité) ----
@api_router.get("/transactions", response_model=List[Transaction])
async def get_transactions(
    type: Optional[str] = None,
    category: Optional[str] = None,
    limit: int = 50
):
    query = {}
    if type:
        query["type"] = type
    if category:
        query["category"] = category
    
    transactions = await db.transactions.find(query, {"_id": 0}).sort("created_at", -1).to_list(limit)
    for t in transactions:
        deserialize_datetime(t)
    return transactions

@api_router.post("/transactions", response_model=Transaction)
async def create_transaction(transaction: TransactionCreate):
    data = transaction.model_dump()
    data["date"] = transaction.date or datetime.now(timezone.utc).strftime("%Y-%m-%d")
    new_transaction = Transaction(**data)
    doc = serialize_datetime(new_transaction.model_dump())
    await db.transactions.insert_one(doc)
    
    # Create notification for large transactions
    if new_transaction.amount >= 100000:
        notif = Notification(
            type="info",
            title="Transaction importante",
            message=f"{'Revenu' if new_transaction.type == 'revenu' else 'Dépense'} de {new_transaction.amount:,} FCFA enregistré(e)",
            priority="haute"
        )
        await db.notifications.insert_one(serialize_datetime(notif.model_dump()))
    
    return new_transaction

TRANSACTION_MODIFY_PASSWORD = "Jesusestroi@"

class TransactionModifyRequest(BaseModel):
    password: str

class TransactionUpdateRequest(BaseModel):
    password: str
    type: Optional[str] = None
    category: Optional[str] = None
    amount: Optional[int] = None
    description: Optional[str] = None
    date: Optional[str] = None
    payment_method: Optional[str] = None

@api_router.put("/transactions/{transaction_id}")
async def update_transaction(transaction_id: str, req: TransactionUpdateRequest):
    if req.password != TRANSACTION_MODIFY_PASSWORD:
        raise HTTPException(status_code=403, detail="Mot de passe incorrect")
    update_data = {k: v for k, v in req.model_dump().items() if k != "password" and v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="Aucune donnée à modifier")
    result = await db.transactions.update_one({"id": transaction_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Transaction introuvable")
    return {"message": "Transaction modifiée"}

@api_router.delete("/transactions/{transaction_id}")
async def delete_transaction(transaction_id: str, req: TransactionModifyRequest):
    if req.password != TRANSACTION_MODIFY_PASSWORD:
        raise HTTPException(status_code=403, detail="Mot de passe incorrect")
    result = await db.transactions.delete_one({"id": transaction_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Transaction introuvable")
    return {"message": "Transaction supprimée"}

# ---- Orders (Commandes) ----
@api_router.get("/orders", response_model=List[Order])
async def get_orders(status: Optional[str] = None, limit: int = 50):
    query = {}
    if status:
        query["status"] = status
    
    orders = await db.orders.find(query, {"_id": 0}).sort("created_at", -1).to_list(limit)
    for order in orders:
        deserialize_datetime(order)
    return orders

@api_router.post("/orders", response_model=Order)
async def create_order(order: OrderCreate):
    # Generate order number
    today = datetime.now(timezone.utc).strftime("%Y%m%d")
    count = await db.orders.count_documents({})
    order_number = f"CMD-{today}-{count + 1:04d}"
    
    new_order = Order(
        order_number=order_number,
        **order.model_dump()
    )
    doc = serialize_datetime(new_order.model_dump())
    await db.orders.insert_one(doc)
    
    # Create notification
    notif = Notification(
        type="commande",
        title="Nouvelle commande",
        message=f"Commande {order_number} - {new_order.total:,} FCFA",
        priority="haute"
    )
    await db.notifications.insert_one(serialize_datetime(notif.model_dump()))
    
    return new_order

@api_router.put("/orders/{order_id}")
async def update_order_status(order_id: str, status: str):
    valid_statuses = ["en_attente", "en_preparation", "pret", "livre", "annule"]
    if status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Status must be one of: {valid_statuses}")
    
    result = await db.orders.update_one({"id": order_id}, {"$set": {"status": status}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # If delivered, create revenue transaction
    if status == "livre":
        order = await db.orders.find_one({"id": order_id}, {"_id": 0})
        if order:
            transaction = Transaction(
                type="revenu",
                category="ventes",
                amount=order["total"],
                description=f"Commande {order['order_number']}",
                payment_method="cash",
                reference=order["order_number"]
            )
            await db.transactions.insert_one(serialize_datetime(transaction.model_dump()))
    
    return {"message": "Order updated"}

# ---- Notifications ----
@api_router.get("/notifications", response_model=List[Notification])
async def get_notifications(unread_only: bool = False, limit: int = 50):
    query = {"is_read": False} if unread_only else {}
    notifications = await db.notifications.find(query, {"_id": 0}).sort("created_at", -1).to_list(limit)
    for notif in notifications:
        deserialize_datetime(notif)
    return notifications

@api_router.put("/notifications/{notification_id}/read")
async def mark_notification_read(notification_id: str):
    result = await db.notifications.update_one({"id": notification_id}, {"$set": {"is_read": True}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Notification not found")
    return {"message": "Notification marked as read"}

@api_router.put("/notifications/read-all")
async def mark_all_notifications_read():
    await db.notifications.update_many({}, {"$set": {"is_read": True}})
    return {"message": "All notifications marked as read"}

@api_router.delete("/notifications/{notification_id}")
async def delete_notification(notification_id: str):
    result = await db.notifications.delete_one({"id": notification_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Notification not found")
    return {"message": "Notification deleted"}

# ---- Stock Management ----
@api_router.get("/stock", response_model=List[StockItem])
async def get_stock(low_only: bool = False):
    if low_only:
        items = await db.stock.find(
            {"$expr": {"$lte": ["$quantity", "$min_quantity"]}},
            {"_id": 0}
        ).to_list(100)
    else:
        items = await db.stock.find({}, {"_id": 0}).to_list(100)
    
    for item in items:
        deserialize_datetime(item)
    return items

@api_router.post("/stock", response_model=StockItem)
async def create_stock_item(item: StockItemCreate):
    new_item = StockItem(**item.model_dump())
    doc = serialize_datetime(new_item.model_dump())
    await db.stock.insert_one(doc)
    return new_item

@api_router.put("/stock/{item_id}")
async def update_stock(item_id: str, quantity: float, operation: str = "set"):
    """Update stock quantity. operation can be 'set', 'add', or 'subtract'"""
    item = await db.stock.find_one({"id": item_id})
    if not item:
        raise HTTPException(status_code=404, detail="Stock item not found")
    
    if operation == "add":
        new_quantity = item["quantity"] + quantity
    elif operation == "subtract":
        new_quantity = max(0, item["quantity"] - quantity)
    else:
        new_quantity = quantity
    
    await db.stock.update_one(
        {"id": item_id},
        {"$set": {"quantity": new_quantity, "last_restock": datetime.now(timezone.utc).strftime("%Y-%m-%d") if operation == "add" else item.get("last_restock")}}
    )
    
    # Check if stock is low and create alert
    if new_quantity <= item["min_quantity"]:
        notif = Notification(
            type="alerte",
            title="Stock bas",
            message=f"Le stock de {item['name']} est bas ({new_quantity} {item['unit']} restants)",
            priority="urgente"
        )
        await db.notifications.insert_one(serialize_datetime(notif.model_dump()))
    
    return {"message": "Stock updated", "new_quantity": new_quantity}

@api_router.delete("/stock/{item_id}")
async def delete_stock_item(item_id: str):
    result = await db.stock.delete_one({"id": item_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Stock item not found")
    return {"message": "Stock item deleted"}

# ---- Reservations ----
@api_router.get("/reservations", response_model=List[Reservation])
async def get_reservations(date: Optional[str] = None, status: Optional[str] = None):
    query = {}
    if date:
        query["date"] = date
    if status:
        query["status"] = status
    
    reservations = await db.reservations.find(query, {"_id": 0}).sort("date", 1).to_list(100)
    for res in reservations:
        deserialize_datetime(res)
    return reservations

@api_router.post("/reservations", response_model=Reservation)
async def create_reservation(reservation: ReservationCreate):
    new_reservation = Reservation(**reservation.model_dump())
    doc = serialize_datetime(new_reservation.model_dump())
    await db.reservations.insert_one(doc)
    
    # Create notification
    notif = Notification(
        type="info",
        title="Nouvelle réservation",
        message=f"Réservation de {reservation.customer_name} pour {reservation.guests} personnes le {reservation.date} à {reservation.time}",
        priority="normale"
    )
    await db.notifications.insert_one(serialize_datetime(notif.model_dump()))
    
    return new_reservation

@api_router.put("/reservations/{reservation_id}")
async def update_reservation_status(reservation_id: str, status: str):
    valid_statuses = ["en_attente", "confirmee", "annulee", "terminee"]
    if status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Status must be one of: {valid_statuses}")
    
    result = await db.reservations.update_one({"id": reservation_id}, {"$set": {"status": status}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Reservation not found")
    return {"message": "Reservation updated"}

@api_router.delete("/reservations/{reservation_id}")
async def delete_reservation(reservation_id: str):
    result = await db.reservations.delete_one({"id": reservation_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Reservation not found")
    return {"message": "Reservation deleted"}

# ---- AI Assistant ----
@api_router.post("/ai/insights")
async def get_ai_insights():
    """Get AI-powered business insights"""
    # Gather data for AI analysis
    transactions = await db.transactions.find({}, {"_id": 0}).to_list(100)
    orders = await db.orders.find({}, {"_id": 0}).to_list(50)
    stock = await db.stock.find({}, {"_id": 0}).to_list(50)
    
    sales_data = {
        "transactions_recentes": transactions[-20:] if transactions else [],
        "nombre_commandes": len(orders),
        "commandes_en_attente": len([o for o in orders if o.get("status") in ["en_attente", "en_preparation"]])
    }
    
    restaurant_context = {
        "nom": "Chez Loman",
        "type": "Restaurant ivoirien haut de gamme",
        "localisation": "Yopougon, Abidjan",
        "stock_items": len(stock),
        "alertes_stock": len([s for s in stock if s.get("quantity", 0) <= s.get("min_quantity", 0)])
    }
    
    insights = await ai_service.generate_business_insights(sales_data, restaurant_context)
    return insights

@api_router.post("/ai/forecast")
async def get_ai_forecast():
    """Get AI-powered sales forecast"""
    transactions = await db.transactions.find(
        {"type": "revenu"},
        {"_id": 0}
    ).sort("date", -1).to_list(30)
    
    historical_data = [
        {
            "date": t.get("date"),
            "revenu": t.get("amount"),
            "categorie": t.get("category")
        }
        for t in transactions
    ]
    
    forecast = await ai_service.forecast_sales(historical_data)
    return forecast

@api_router.post("/ai/chat")
async def chat_with_ai(message: AIMessage):
    """Chat with AI assistant"""
    # Gather context
    stats = await get_dashboard_stats()
    
    context = {
        "stats_actuelles": stats,
        "date_heure": datetime.now(timezone.utc).isoformat()
    }
    
    if message.context:
        context.update(message.context)
    
    response = await ai_service.chat_assistant(message.message, context)
    return {"response": response}

@api_router.get("/ai/status")
async def get_ai_status():
    """Check if AI service is configured"""
    return {
        "configured": ai_service.is_configured(),
        "model": "deepseek-chat" if ai_service.is_configured() else None
    }

# ---- Seed Dashboard Data ----
@api_router.post("/seed-dashboard")
async def seed_dashboard_data():
    """Seed sample dashboard data for demo"""
    # Check if data already exists
    existing = await db.transactions.count_documents({})
    if existing > 0:
        return {"message": "Dashboard data already seeded"}
    
    today = datetime.now(timezone.utc)
    
    # Seed transactions (last 30 days)
    categories_revenus = ["ventes", "livraison", "evenements"]
    categories_depenses = ["ingredients", "personnel", "loyer", "utilities", "marketing", "equipement"]
    
    transactions = []
    for i in range(30):
        date = (today - timedelta(days=i)).strftime("%Y-%m-%d")
        
        # Daily revenue (random between 200k and 600k FCFA)
        import random
        daily_revenue = random.randint(200000, 600000)
        transactions.append(Transaction(
            type="revenu",
            category=random.choice(categories_revenus),
            amount=daily_revenue,
            description=f"Ventes du {date}",
            date=date,
            payment_method=random.choice(["cash", "mobile_money", "carte"])
        ))
        
        # Daily expenses (random)
        if random.random() > 0.3:
            expense = random.randint(50000, 150000)
            transactions.append(Transaction(
                type="depense",
                category=random.choice(categories_depenses),
                amount=expense,
                description=f"Dépense - {random.choice(categories_depenses)}",
                date=date,
                payment_method="cash"
            ))
    
    for t in transactions:
        await db.transactions.insert_one(serialize_datetime(t.model_dump()))
    
    # Seed stock items
    stock_items = [
        {"name": "Poulet", "category": "viandes", "quantity": 25, "unit": "kg", "min_quantity": 10, "price_per_unit": 3500, "supplier": "Ferme Locale"},
        {"name": "Poisson Tilapia", "category": "poissons", "quantity": 15, "unit": "kg", "min_quantity": 8, "price_per_unit": 4000, "supplier": "Marché Central"},
        {"name": "Attièkè", "category": "feculents", "quantity": 30, "unit": "kg", "min_quantity": 15, "price_per_unit": 1000, "supplier": "Producteur Local"},
        {"name": "Huile de Palme", "category": "huiles", "quantity": 20, "unit": "L", "min_quantity": 10, "price_per_unit": 1500, "supplier": "Grossiste"},
        {"name": "Oignons", "category": "legumes", "quantity": 8, "unit": "kg", "min_quantity": 10, "price_per_unit": 800, "supplier": "Marché"},
        {"name": "Tomates", "category": "legumes", "quantity": 12, "unit": "kg", "min_quantity": 8, "price_per_unit": 1200, "supplier": "Marché"},
        {"name": "Bissap", "category": "boissons", "quantity": 5, "unit": "kg", "min_quantity": 8, "price_per_unit": 2500, "supplier": "Importateur"},
        {"name": "Gingembre", "category": "epices", "quantity": 3, "unit": "kg", "min_quantity": 2, "price_per_unit": 3000, "supplier": "Marché"},
        {"name": "Piment", "category": "epices", "quantity": 2, "unit": "kg", "min_quantity": 1, "price_per_unit": 4000, "supplier": "Producteur"},
        {"name": "Banane Plantain", "category": "feculents", "quantity": 40, "unit": "kg", "min_quantity": 20, "price_per_unit": 600, "supplier": "Grossiste"}
    ]
    
    for item in stock_items:
        stock = StockItem(**item)
        await db.stock.insert_one(serialize_datetime(stock.model_dump()))
    
    # Seed sample notifications
    notifications = [
        {"type": "alerte", "title": "Stock bas", "message": "Le stock de Bissap est bas (5 kg restants)", "priority": "urgente"},
        {"type": "info", "title": "Nouvelle réservation", "message": "Réservation de M. Kouadio pour 6 personnes ce soir", "priority": "normale"},
        {"type": "commande", "title": "Commande en attente", "message": "2 commandes en attente de préparation", "priority": "haute"},
        {"type": "rappel", "title": "Paiement fournisseur", "message": "Facture Ferme Locale à payer avant le 20/02", "priority": "haute"}
    ]
    
    for notif_data in notifications:
        notif = Notification(**notif_data)
        await db.notifications.insert_one(serialize_datetime(notif.model_dump()))
    
    # Seed sample reservations
    reservations = [
        {"customer_name": "M. Kouadio", "customer_phone": "+225 07 00 00 01", "date": today.strftime("%Y-%m-%d"), "time": "19:30", "guests": 6},
        {"customer_name": "Mme Bamba", "customer_phone": "+225 07 00 00 02", "date": today.strftime("%Y-%m-%d"), "time": "20:00", "guests": 4},
        {"customer_name": "M. Touré", "customer_phone": "+225 07 00 00 03", "date": (today + timedelta(days=1)).strftime("%Y-%m-%d"), "time": "12:30", "guests": 2}
    ]
    
    for res_data in reservations:
        res = Reservation(**res_data)
        await db.reservations.insert_one(serialize_datetime(res.model_dump()))
    
    return {"message": "Dashboard data seeded successfully"}

# ---- Caisse (Cash Register / POS) ----
@api_router.post("/caisse/vente")
async def create_cash_sale(sale: CashSaleCreate):
    new_sale = CashSale(**sale.model_dump())
    doc = serialize_datetime(new_sale.model_dump())
    await db.cash_sales.insert_one(doc)
    transaction = Transaction(
        type="revenu",
        category="ventes",
        amount=sale.total,
        description=f"Vente caisse - {sale.payment_method}",
        date=datetime.now(timezone.utc).strftime("%Y-%m-%d"),
        payment_method=sale.payment_method
    )
    await db.transactions.insert_one(serialize_datetime(transaction.model_dump()))
    return new_sale

@api_router.get("/caisse/ventes")
async def get_cash_sales(date: Optional[str] = None):
    query = {}
    if date:
        query["sale_date"] = date
    sales = await db.cash_sales.find(query, {"_id": 0}).sort("created_at", -1).to_list(200)
    for sale in sales:
        deserialize_datetime(sale)
    return sales

@api_router.get("/caisse/stats")
async def get_cash_stats(date: Optional[str] = None):
    target_date = date or datetime.now(timezone.utc).strftime("%Y-%m-%d")
    
    day_sales = await db.cash_sales.find({"sale_date": target_date}, {"_id": 0}).to_list(1000)
    
    total_revenue = sum(s.get("total", 0) for s in day_sales)
    total_sales_count = len(day_sales)
    
    cash_total = sum(s.get("total", 0) for s in day_sales if s.get("payment_method") == "especes")
    mobile_total = sum(s.get("total", 0) for s in day_sales if s.get("payment_method") == "mobile_money")
    
    dishes_count = {}
    for sale in day_sales:
        for item in sale.get("items", []):
            name = item.get("name", "Inconnu")
            qty = item.get("quantity", 1)
            if name in dishes_count:
                dishes_count[name]["quantity"] += qty
                dishes_count[name]["revenue"] += item.get("price", 0) * qty
            else:
                dishes_count[name] = {"name": name, "quantity": qty, "revenue": item.get("price", 0) * qty}
    
    top_dishes = sorted(dishes_count.values(), key=lambda x: x["quantity"], reverse=True)
    
    return {
        "date": target_date,
        "total_revenue": total_revenue,
        "total_sales": total_sales_count,
        "cash_total": cash_total,
        "mobile_money_total": mobile_total,
        "average_ticket": total_revenue // total_sales_count if total_sales_count > 0 else 0,
        "top_dishes": top_dishes,
        "total_dishes_sold": sum(d["quantity"] for d in top_dishes)
    }

@api_router.delete("/caisse/vente/{sale_id}")
async def delete_cash_sale(sale_id: str):
    result = await db.cash_sales.delete_one({"id": sale_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Vente non trouvée")
    return {"message": "Vente supprimée"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

frontend_build = Path(__file__).parent.parent / "frontend" / "build"
if frontend_build.exists():
    app.mount("/static", StaticFiles(directory=str(frontend_build / "static")), name="static")

    from starlette.responses import FileResponse

    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        file_path = frontend_build / full_path
        if file_path.exists() and file_path.is_file():
            return FileResponse(str(file_path))
        return FileResponse(str(frontend_build / "index.html"))

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
