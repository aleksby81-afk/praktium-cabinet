from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session
from ..database import get_db
from ..dependencies import current_client
from ..models import Client, BonusEvent, Order
from ..schemas import ClientOut, ProfileUpdate, BonusOut, OrderOut

router = APIRouter(tags=['Клиент'])


@router.get('/me', response_model=ClientOut)
def me(client: Client = Depends(current_client)):
    return client


@router.patch('/me', response_model=ClientOut)
def update_me(data: ProfileUpdate, client: Client = Depends(current_client), db: Session = Depends(get_db)):
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(client, field, value)
    db.commit()
    return client


@router.get('/me/bonuses', response_model=list[BonusOut])
def bonuses(client: Client = Depends(current_client), db: Session = Depends(get_db)):
    return db.scalars(select(BonusEvent).where(BonusEvent.client_id == client.id).order_by(BonusEvent.id.desc())).all()


@router.get('/me/orders', response_model=list[OrderOut])
def orders(client: Client = Depends(current_client), db: Session = Depends(get_db)):
    return db.scalars(select(Order).where(Order.client_id == client.id).order_by(Order.id.desc())).all()
