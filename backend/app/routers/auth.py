from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Client, BonusEvent
from ..schemas import Register, Login
from ..auth import hash_password, verify_password, create_token
from ..config import settings
from ..yandex_sync import sync_all

router = APIRouter(prefix='/auth', tags=['Авторизация'])


@router.post('/register', status_code=201)
def register(data: Register, tasks: BackgroundTasks, db: Session = Depends(get_db)):
    client = Client(name=data.name, email=data.email, phone=data.phone, hashed_password=hash_password(data.password), bonus_balance=settings.welcome_bonus)
    try:
        db.add(client)
        db.flush()
        db.add(BonusEvent(client_id=client.id, amount=settings.welcome_bonus, reason='Приветственный бонус'))
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(409, 'Этот email уже зарегистрирован')
    tasks.add_task(sync_all)
    return {'access_token': create_token(client.id), 'token_type': 'bearer'}


@router.post('/login')
def login(data: Login, db: Session = Depends(get_db)):
    client = db.scalar(select(Client).where(Client.email == data.email))
    if not client or not verify_password(data.password, client.hashed_password):
        raise HTTPException(401, 'Неверный email или пароль')
    return {'access_token': create_token(client.id), 'token_type': 'bearer'}
