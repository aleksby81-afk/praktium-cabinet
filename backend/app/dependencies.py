import secrets
from fastapi import Depends, HTTPException, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from sqlalchemy.orm import Session
from .config import settings
from .database import get_db
from .models import Client

bearer = HTTPBearer(auto_error=False)


def current_client(credentials: HTTPAuthorizationCredentials | None = Depends(bearer), db: Session = Depends(get_db)):
    try:
        if credentials is None:
            raise ValueError()
        payload = jwt.decode(credentials.credentials, settings.secret_key, algorithms=['HS256'], options={'require_exp': True, 'require_sub': True})
        client_id = int(payload['sub'])
        if not 0 < client_id < 2**63:
            raise ValueError()
        client = db.get(Client, client_id)
        if client is None:
            raise ValueError()
        return client
    except (JWTError, ValueError, KeyError, TypeError):
        raise HTTPException(401, 'Войдите в аккаунт', headers={'WWW-Authenticate': 'Bearer'})


def admin_access(admin_key: str = Query(default='')):
    # MVP only: query secrets can appear in logs. Replace with administrative authorization in production.
    if not secrets.compare_digest(admin_key, settings.admin_key):
        raise HTTPException(403, 'Нет доступа')
