from datetime import datetime, timedelta, timezone
import bcrypt
from jose import jwt
from .config import settings


def hash_password(password):
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(password, hashed):
    return bcrypt.checkpw(password.encode(), hashed.encode())


def create_token(client_id):
    return jwt.encode({'sub': str(client_id), 'exp': datetime.now(timezone.utc) + timedelta(minutes=settings.access_token_minutes)}, settings.secret_key, algorithm='HS256')
