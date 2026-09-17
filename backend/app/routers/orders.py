from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from ..database import get_db
from ..dependencies import current_client
from ..models import Client, Product, Order
from ..schemas import OrderCreate, OrderOut
from ..yandex_sync import sync_all

router = APIRouter(tags=['Заявки'])


@router.post('/orders', response_model=OrderOut, status_code=201)
def create_order(data: OrderCreate, tasks: BackgroundTasks, client: Client = Depends(current_client), db: Session = Depends(get_db)):
    product = db.get(Product, data.product_id)
    if not product:
        raise HTTPException(404, 'Товар не найден')
    if not product.in_stock:
        raise HTTPException(409, 'Товара нет в наличии')
    order = Order(**data.model_dump(), client_id=client.id, unit_price=product.price)
    db.add(order)
    db.commit()
    db.refresh(order)
    tasks.add_task(sync_all)
    return order
