from sqlalchemy import create_engine, event
from sqlalchemy.orm import DeclarativeBase, sessionmaker
from .config import settings

url = settings.database_url or 'sqlite:///./brand.db'
if url.startswith(('postgres://', 'postgresql://')):
    url = 'postgresql+psycopg://' + url.split('://', 1)[1]
engine = create_engine(url, pool_pre_ping=True, connect_args={'check_same_thread': False, 'timeout': 30} if url.startswith('sqlite') else {})
if url.startswith('sqlite'):
    @event.listens_for(engine, 'connect')
    def sqlite_foreign_keys(connection, _):
        connection.execute('PRAGMA foreign_keys=ON')

SessionLocal = sessionmaker(engine, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


def get_db():
    with SessionLocal() as session:
        yield session
