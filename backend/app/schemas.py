from datetime import datetime
from decimal import Decimal
from typing import Literal
from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

Status = Literal['new', 'processing', 'confirmed', 'shipped', 'done', 'cancelled']


class Input(BaseModel):
    model_config = ConfigDict(extra='forbid', str_strip_whitespace=True)


class Login(Input):
    model_config = ConfigDict(extra='forbid', str_strip_whitespace=False)
    email: EmailStr
    password: str = Field(min_length=8, max_length=72)

    @field_validator('password')
    @classmethod
    def password_length(cls, value):
        if len(value.encode()) > 72:
            raise ValueError('Пароль должен занимать не более 72 байт UTF-8')
        return value

    @field_validator('email')
    @classmethod
    def email_lower(cls, value):
        return value.lower()


class Register(Login):
    name: str = Field(min_length=1, max_length=120)
    phone: str = Field(default='', max_length=40)

    @field_validator('name')
    @classmethod
    def name_not_blank(cls, value):
        if not value.strip():
            raise ValueError('Укажите имя')
        return value.strip()


class ProfileUpdate(Input):
    name: str | None = Field(default=None, min_length=1, max_length=120)
    phone: str | None = Field(default=None, max_length=40)

    @field_validator('name', 'phone')
    @classmethod
    def no_null(cls, value):
        if value is None:
            raise ValueError('Значение не может быть null')
        return value


class Output(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class ClientOut(Output):
    id: int
    name: str
    email: str
    phone: str
    bonus_balance: Decimal
    created_at: datetime


class ProductCreate(Input):
    title: str = Field(min_length=1, max_length=200)
    description: str = Field(default='', max_length=4000)
    price: Decimal = Field(ge=0, max_digits=12, decimal_places=2)
    collection: str = Field(min_length=1, max_length=120)
    image_url: str = Field(default='', max_length=2000)
    in_stock: bool = True

    @field_validator('image_url')
    @classmethod
    def image_scheme(cls, value):
        if value and not value.startswith(('https://', '/')):
            raise ValueError('Используйте HTTPS или локальный путь')
        return value


class ProductOut(ProductCreate, Output):
    id: int


class OrderCreate(Input):
    product_id: int
    quantity: int = Field(gt=0, le=1000, strict=True)
    comment: str = Field(default='', max_length=2000)


class OrderOut(Output):
    id: int
    client_id: int
    product_id: int
    quantity: int
    unit_price: Decimal
    status: Status
    comment: str
    created_at: datetime
    product: ProductOut


class BonusOut(Output):
    id: int
    amount: Decimal
    reason: str
    created_at: datetime


class StatusUpdate(Input):
    status: Status


class PriceQuote(Input):
    unit_price: Decimal = Field(gt=0, max_digits=12, decimal_places=2)
