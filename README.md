
# suppliers_backend

npm run dev #
npm start


https://suppliers-backend-nphe.onrender.com

`Пользователь`

# // POST 
/api/auth/signup - Регистрация нового пользователя
/api/auth/signin - Вход пользователя


`Произвоитель`

# // POST 
/api/manufacturers - Добавить нового производителя

# // GET 
/api/manufacturers - Получить всех производителей (с возможностью поиска по имени)
/api/manufacturers/:id - Получить производителя по ID

# // PUT 
/api/manufacturers/:id - Обновить производителя по ID

# // DELETE 
/api/manufacturers/:id - Удалить производителя по ID\


`Продукты`

# // POST 
/api/manufacturers/:manufacturerId/products - Добавить продукт к производителю

# // GET 
/api/manufacturers/:manufacturerId/products - Получить все продукты производителя (с возможностью поиска по имени)
/api/manufacturers/:manufacturerId/products/:productId - Получить конкретный продукт производителя

# // PUT 
/api/manufacturers/:manufacturerId/products/:productId - Обновить продукт производителя

# // DELETE 
/api/manufacturers/:manufacturerId/products/:productId - Удалить продукт из ассортимента производителя