"""Seed the seven public Praktium products into an empty catalog."""
from sqlalchemy import select
from .database import Base, engine, SessionLocal
from .models import Product


PRODUCTS = [
    ('Массажёр для шеи и плеч', '16 роликов, подогрев и 3 скорости. Цвета: чёрный и бежевый.', 'Уход за собой', '/images/praktium/image-2.jpg'),
    ('Плойка-утюжок 2 в 1', 'Гофре и выпрямитель в одном приборе, 5 температурных режимов.', 'Уход за собой', '/images/praktium/image-3.jpg'),
    ('Триммер 11 в 1', '11 насадок и до 120 минут автономной работы.', 'Уход за собой', '/images/praktium/image-4.jpg'),
    ('Умные весы', '17 показателей, Bluetooth и приложение для iOS и Android.', 'Здоровье', '/images/praktium/image-5.jpg'),
    ('Отпариватель 3 в 1', 'Мощность 1200 Вт, готов к работе за 30 секунд.', 'Дом и уют', '/images/praktium/image-6.jpg'),
    ('Гирлянда-штора', 'Размер 3 × 2 м, тёплый свет и 8 режимов.', 'Дом и уют', '/images/praktium/image-7.jpg'),
    ('Термобелье, комплект', 'Верх и низ из хлопка для погоды до −25 °C.', 'Одежда', '/images/praktium/image-8.jpg'),
]


def main():
    Base.metadata.create_all(engine)
    with SessionLocal() as db:
        if db.scalar(select(Product.id).limit(1)) is not None:
            print('Каталог уже содержит товары; данные не изменены.')
            return
        # The storefront does not publish prices. Zero is a pending quote, not a free item.
        db.add_all(Product(title=title, description=description, price='0.00', collection=category, image_url=image_url) for title, description, category, image_url in PRODUCTS)
        db.commit()
        print('Добавлены 7 товаров ПРАКТИУМ без вымышленных цен.')


if __name__ == '__main__':
    main()
