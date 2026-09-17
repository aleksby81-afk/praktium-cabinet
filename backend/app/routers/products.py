from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Product
from ..schemas import ProductOut

router = APIRouter(tags=['Каталог'])


@router.get('/products', response_model=list[ProductOut])
def products(collection: str | None = None, db: Session = Depends(get_db)):
    query = select(Product).order_by(Product.id)
    if collection is not None:
        query = query.where(Product.collection == collection)
    return db.scalars(query).all()
