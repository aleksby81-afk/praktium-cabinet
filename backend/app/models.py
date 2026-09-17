from datetime import datetime, timezone
from decimal import Decimal
from sqlalchemy import String, Numeric, ForeignKey, DateTime, CheckConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .database import Base


def now():
    return datetime.now(timezone.utc)


class Client(Base):
    __tablename__ = 'clients'
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(120))
    email: Mapped[str] = mapped_column(String(320), unique=True, index=True)
    phone: Mapped[str] = mapped_column(String(40), default='')
    hashed_password: Mapped[str] = mapped_column(String(200))
    bonus_balance: Mapped[Decimal] = mapped_column(Numeric(14, 2), default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now)


class Product(Base):
    __tablename__ = 'products'
    __table_args__ = (CheckConstraint('price >= 0'),)
    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(200))
    description: Mapped[str] = mapped_column(String(4000), default='')
    price: Mapped[Decimal] = mapped_column(Numeric(12, 2))
    collection: Mapped[str] = mapped_column(String(120))
    image_url: Mapped[str] = mapped_column(String(2000), default='')
    in_stock: Mapped[bool] = mapped_column(default=True)


class Order(Base):
    __tablename__ = 'orders'
    __table_args__ = (CheckConstraint('quantity > 0'), CheckConstraint("status IN ('new','processing','confirmed','shipped','done','cancelled')"))
    id: Mapped[int] = mapped_column(primary_key=True)
    client_id: Mapped[int] = mapped_column(ForeignKey('clients.id'), index=True)
    product_id: Mapped[int] = mapped_column(ForeignKey('products.id'))
    quantity: Mapped[int]
    unit_price: Mapped[Decimal] = mapped_column(Numeric(12, 2))
    status: Mapped[str] = mapped_column(String(20), default='new')
    comment: Mapped[str] = mapped_column(String(2000), default='')
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now)
    product: Mapped[Product] = relationship(lazy='joined')
    client: Mapped[Client] = relationship()


class BonusEvent(Base):
    __tablename__ = 'bonus_events'
    id: Mapped[int] = mapped_column(primary_key=True)
    client_id: Mapped[int] = mapped_column(ForeignKey('clients.id'), index=True)
    order_id: Mapped[int | None] = mapped_column(ForeignKey('orders.id'), unique=True)
    amount: Mapped[Decimal] = mapped_column(Numeric(14, 2))
    reason: Mapped[str] = mapped_column(String(500))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now)
    client: Mapped[Client] = relationship()
