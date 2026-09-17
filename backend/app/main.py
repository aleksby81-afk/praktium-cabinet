from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from .database import Base, engine
from .config import settings
from .routers import auth, users, products, orders, admin
from .seed import main as seed_catalog


@asynccontextmanager
async def lifespan(app):
    Base.metadata.create_all(engine)
    seed_catalog()
    yield


app = FastAPI(title='ПРАКТИУМ — кабинет покупателя API', lifespan=lifespan)
# TODO: перед production заменить "*" на конкретный домен frontend.
app.add_middleware(CORSMiddleware, allow_origins=[s.strip() for s in settings.cors_origins.split(',')], allow_credentials=False, allow_methods=['GET', 'POST', 'PATCH'], allow_headers=['Authorization', 'Content-Type'])
for router in (auth.router, users.router, products.router, orders.router, admin.router):
    app.include_router(router)


@app.get('/health')
def health():
    with engine.connect() as connection:
        connection.execute(text('SELECT 1'))
    return {'status': 'ok'}
