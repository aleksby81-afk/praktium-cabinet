from fastapi import APIRouter, Depends, BackgroundTasks, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session
from ..database import get_db
from ..dependencies import admin_access
from ..models import Order, Product
from ..schemas import OrderOut, ProductOut, ProductCreate, StatusUpdate, PriceQuote
from ..services import change_status
from ..yandex_sync import sync_all

router = APIRouter(prefix='/admin', tags=['Администратор'], dependencies=[Depends(admin_access)])


@router.get('/orders', response_model=list[OrderOut])
def orders(db: Session = Depends(get_db)):
    return db.scalars(select(Order).order_by(Order.id.desc())).all()


@router.patch('/orders/{id}/status', response_model=OrderOut)
def status(id: int, data: StatusUpdate, tasks: BackgroundTasks, db: Session = Depends(get_db)):
    order = change_status(db, id, data.status)
    tasks.add_task(sync_all)
    return order


@router.patch('/orders/{id}/price', response_model=OrderOut)
def quote_price(id: int, data: PriceQuote, tasks: BackgroundTasks, db: Session = Depends(get_db)):
    order = db.get(Order, id)
    if order is None:
        raise HTTPException(404, 'Заявка не найдена')
    if order.status in ('done', 'cancelled'):
        raise HTTPException(409, 'Цену завершённой заявки нельзя изменить')
    order.unit_price = data.unit_price
    db.commit()
    db.refresh(order)
    tasks.add_task(sync_all)
    return order


@router.post('/products', response_model=ProductOut, status_code=201)
def product(data: ProductCreate, db: Session = Depends(get_db)):
    item = Product(**data.model_dump())
    db.add(item)
    db.commit()
    return item


@router.post('/sync-all')
def resync():
    return sync_all()
