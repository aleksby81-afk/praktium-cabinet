from decimal import Decimal, ROUND_HALF_UP
from fastapi import HTTPException
from sqlalchemy import select, update
from .models import Order, Client, BonusEvent
from .config import settings

TRANSITIONS = {'new': {'processing', 'cancelled'}, 'processing': {'confirmed', 'cancelled'}, 'confirmed': {'shipped', 'cancelled'}, 'shipped': {'done', 'cancelled'}, 'done': set(), 'cancelled': set()}


def change_status(db, order_id, status):
    order = db.scalar(select(Order).where(Order.id == order_id))
    if order is None:
        raise HTTPException(404, 'Заявка не найдена')
    previous = order.status
    if status == previous:
        return order
    if status not in TRANSITIONS[previous]:
        raise HTTPException(409, 'Недопустимый переход статуса')
    if status == 'done' and order.unit_price <= 0:
        raise HTTPException(409, 'Перед завершением заявки укажите согласованную цену')
    # Atomic compare-and-swap protects concurrent requests on PostgreSQL and SQLite.
    result = db.execute(update(Order).where(Order.id == order_id, Order.status == previous).values(status=status))
    if result.rowcount != 1:
        db.rollback()
        raise HTTPException(409, 'Статус уже изменён. Обновите заявку')
    if status == 'done':
        amount = (order.unit_price * order.quantity * settings.cashback_percent / Decimal('100')).quantize(Decimal('.01'), rounding=ROUND_HALF_UP)
        db.add(BonusEvent(client_id=order.client_id, order_id=order.id, amount=amount, reason=f'Кэшбэк за заказ #{order.id}'))
        db.execute(update(Client).where(Client.id == order.client_id).values(bonus_balance=Client.bonus_balance + amount))
    db.commit()
    db.refresh(order)
    return order
