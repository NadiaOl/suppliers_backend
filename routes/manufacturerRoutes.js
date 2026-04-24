// =============================================================================
// Файл: routes/manufacturerRoutes.js
// Описание: Маршруты для управления производителями и их продуктами.
// =============================================================================
import express from "express";
import Manufacturer from "../models/Manufacturer.js"; // Импорт модели (обязательно с .js)
import auth from "../middleware/auth.js"; // Импорт middleware (обязательно с .js)

const router = express.Router();

// =============================================================================
// Маршруты для управления Производителями
// =============================================================================

// POST /api/manufacturers Добавить нового производителя
router.post("/", auth, async (req, res) => {
  try {
    // 1. Достаем currancy из тела запроса
    const { name, buyer, currancy } = req.body; 

    // 2. Проверяем наличие всех обязательных полей
    if (!name || !buyer || !currancy) {
      return res
        .status(400)
        .json({ message: "Имя, покупатель и валюта обязательны" });
    }

    // 3. Передаем все три поля в модель
    const newManufacturer = new Manufacturer({ name, buyer, currancy });
    const manufacturer = await newManufacturer.save();
    
    res.status(201).json(manufacturer);
  } catch (err) {
    console.error(err.message);
    if (err.code === 11000) {
      return res
        .status(400)
        .json({ message: "Производитель с таким именем уже существует" });
    }
    // Отправляем JSON вместо обычного текста, чтобы фронтенд не падал
    res.status(500).json({ message: "Ошибка сервера при создании производителя" });
  }
});

// GET /api/manufacturers - Получить всех производителей (с возможностью поиска по имени)
router.get("/", auth, async (req, res) => {
  try {
    const query = {};
    // Если передан параметр 'name' в запросе, используем его для поиска
    if (req.query.name) {
      // Создаем регулярное выражение для регистронезависимого поиска
      query.name = new RegExp(req.query.name, "i");
    }
    const manufacturers = await Manufacturer.find(query);
    res.json(manufacturers);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Ошибка сервера");
  }
});

// GET /api/manufacturers/:id - Получить производителя по ID
router.get("/:id", auth, async (req, res) => {
  try {
    const manufacturer = await Manufacturer.findById(req.params.id);
    if (!manufacturer) {
      return res.status(404).json({ message: "Производитель не найден" });
    }
    res.json(manufacturer);
  } catch (err) {
    console.error(err.message);
    // Если ID невалиден
    if (err.kind === "ObjectId") {
      return res.status(400).json({ message: "Неверный ID производителя" });
    }
    res.status(500).send("Ошибка сервера");
  }
});

// PUT /api/manufacturers/:id - Обновить производителя по ID
router.put("/:id", auth, async (req, res) => {
  try {
    const { name, buyer, currancy } = req.body;
    const updatedFields = {};
    if (name) updatedFields.name = name;
    if (buyer) updatedFields.buyer = buyer;
    if (currancy) updatedFields.currancy = currancy;

    const manufacturer = await Manufacturer.findByIdAndUpdate(
      req.params.id,
      { $set: updatedFields }, // Используем $set для обновления только переданных полей
      { new: true, runValidators: true } // new: true возвращает обновленный документ, runValidators: true запускает валидаторы схемы
    );

    if (!manufacturer) {
      return res.status(404).json({ message: "Производитель не найден" });
    }
    res.json(manufacturer);
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(400).json({ message: "Неверный ID производителя" });
    }
    if (err.code === 11000) {
      // Ошибка уникальности
      return res
        .status(400)
        .json({ message: "Производитель с таким именем уже существует" });
    }
    res.status(500).send("Ошибка сервера");
  }
});

// DELETE /api/manufacturers/:id - Удалить производителя по ID
router.delete("/:id", auth, async (req, res) => {
  try {
    const manufacturer = await Manufacturer.findByIdAndDelete(req.params.id);
    if (!manufacturer) {
      return res.status(404).json({ message: "Производитель не найден" });
    }
    res.json({ message: "Производитель успешно удален" });
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(400).json({ message: "Неверный ID производителя" });
    }
    res.status(500).send("Ошибка сервера");
  }
});

// =============================================================================
// Маршруты для управления Продуктами (вложенными в Производителя)
// =============================================================================

// POST /api/manufacturers/:manufacturerId/products - Добавить продукт к производителю
router.post("/:manufacturerId/products", auth, async (req, res) => {
  try {
    const { name, totalPrice, billPrice, foc, plan, fact } = req.body;

    // Простая валидация полей продукта
    if (!name || totalPrice === undefined || billPrice === undefined) {
      return res
        .status(400)
        .json({
          message: "Название, Total Price и Bill Price продукта обязательны",
        });
    }

    const manufacturer = await Manufacturer.findById(req.params.manufacturerId);
    if (!manufacturer) {
      return res.status(404).json({ message: "Производитель не найден" });
    }

    // Добавляем новый продукт в массив products
    manufacturer.products.push({
      name,
      totalPrice,
      billPrice,
      foc,
      plan,
      fact,
    });
    await manufacturer.save();

    // Возвращаем обновленного производителя целиком,
    // чтобы клиент мог безопасно обновить карточку в UI.
    res.status(201).json(manufacturer);
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(400).json({ message: "Неверный ID производителя" });
    }
    res.status(500).send("Ошибка сервера");
  }
});

// GET /api/manufacturers/:manufacturerId/products - Получить все продукты производителя (с возможностью поиска по имени)
router.get("/:manufacturerId/products", auth, async (req, res) => {
  try {
    const manufacturer = await Manufacturer.findById(req.params.manufacturerId);
    if (!manufacturer) {
      return res.status(404).json({ message: "Производитель не найден" });
    }

    let products = manufacturer.products;
    // Если передан параметр 'name' для поиска продукта
    if (req.query.name) {
      const searchName = new RegExp(req.query.name, "i"); // Регистронезависимый поиск
      products = products.filter((product) => searchName.test(product.name));
    }

    res.json(products);
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(400).json({ message: "Неверный ID производителя" });
    }
    res.status(500).send("Ошибка сервера");
  }
});

// GET /api/manufacturers/:manufacturerId/products/:productId - Получить конкретный продукт производителя
router.get("/:manufacturerId/products/:productId", auth, async (req, res) => {
  try {
    const manufacturer = await Manufacturer.findById(req.params.manufacturerId);
    if (!manufacturer) {
      return res.status(404).json({ message: "Производитель не найден" });
    }

    // Используем метод .id() Mongoose для поиска поддокумента по ID
    const product = manufacturer.products.id(req.params.productId);
    if (!product) {
      return res.status(404).json({ message: "Продукт не найден" });
    }
    res.json(product);
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res
        .status(400)
        .json({ message: "Неверный ID производителя или продукта" });
    }
    res.status(500).send("Ошибка сервера");
  }
});

// PUT /api/manufacturers/:manufacturerId/products/:productId - Обновить продукт производителя
router.put("/:manufacturerId/products/:productId", auth, async (req, res) => {
  try {
    const manufacturer = await Manufacturer.findById(req.params.manufacturerId);
    if (!manufacturer) {
      return res.status(404).json({ message: "Производитель не найден" });
    }

    const product = manufacturer.products.id(req.params.productId);
    if (!product) {
      return res.status(404).json({ message: "Продукт не найден" });
    }

    // Обновляем поля продукта
    Object.assign(product, req.body); // Копируем свойства из req.body в product
    await manufacturer.save(); // Сохраняем родительский документ (производителя)

    // Возвращаем обновленного производителя целиком,
    // чтобы клиент мог безопасно обновить карточку в UI.
    res.json(manufacturer);
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res
        .status(400)
        .json({ message: "Неверный ID производителя или продукта" });
    }
    res.status(500).send("Ошибка сервера");
  }
});

// DELETE /api/manufacturers/:manufacturerId/products/:productId - Удалить продукт из ассортимента производителя
router.delete(
  "/:manufacturerId/products/:productId",
  auth,
  async (req, res) => {
    try {
      const manufacturer = await Manufacturer.findById(
        req.params.manufacturerId
      );
      if (!manufacturer) {
        return res.status(404).json({ message: "Производитель не найден" });
      }

      // Используем метод .pull() для удаления поддокумента по ID
      const initialLength = manufacturer.products.length;
      manufacturer.products.pull(req.params.productId);

      if (manufacturer.products.length === initialLength) {
        // Если длина массива не изменилась, значит, продукт с таким ID не был найден
        return res.status(404).json({ message: "Продукт не найден" });
      }

      await manufacturer.save();

      // Возвращаем обновленного производителя целиком,
      // чтобы клиент мог безопасно обновить карточку в UI.
      res.json(manufacturer);
    } catch (err) {
      console.error(err.message);
      if (err.kind === "ObjectId") {
        return res
          .status(400)
          .json({ message: "Неверный ID производителя или продукта" });
      }
      res.status(500).send("Ошибка сервера");
    }
  }
);

// =============================================================================
// Маршруты для управления Контактами (вложенными в Производителя)
// =============================================================================

// POST /api/manufacturers/:manufacturerId/contacts - Добавить контакт к производителю
router.post("/:manufacturerId/contacts", auth, async (req, res) => {
  try {
    const { fullName, position, email, phone } = req.body;

    // Простая валидация полей продукта
    if (!fullName || !email) {
      return res.status(400).json({
        message: "Имя и email обязательны",
      });
    }

    const manufacturer = await Manufacturer.findById(req.params.manufacturerId);
    if (!manufacturer) {
      return res.status(404).json({ message: "Производитель не найден" });
    }

    // Добавляем новый контакт в массив contacts
    manufacturer.contacts.push({
      fullName,
      position,
      email,
      phone,
    });
    await manufacturer.save();

    // Возвращаем только что добавленный контакт (последний в массиве)
    res
      .status(201)
      .json(manufacturer.contacts[manufacturer.contacts.length - 1]);
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(400).json({ message: "Неверный ID производителя" });
    }
    res.status(500).send("Ошибка сервера");
  }
});

// GET /api/manufacturers/:manufacturerId/contacts - Получить все контакты производителя (с возможностью поиска по имени)
router.get("/:manufacturerId/contacts", auth, async (req, res) => {
  try {
    const manufacturer = await Manufacturer.findById(req.params.manufacturerId);
    if (!manufacturer) {
      return res.status(404).json({ message: "Производитель не найден" });
    }

    let contacts = manufacturer.contacts;
    // Если передан параметр 'fullName' для поиска продукта
    if (req.query.fullName) {
      const searchName = new RegExp(req.query.fullName, "i"); // Регистронезависимый поиск
      contacts = contacts.filter((contact) =>
        searchName.test(contact.fullName)
      );
    }

    res.json(contacts);
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(400).json({ message: "Неверный ID производителя" });
    }
    res.status(500).send("Ошибка сервера");
  }
});

// GET /api/manufacturers/:manufacturerId/contacts/:contactId - Получить конкретный контакт производителя
router.get("/:manufacturerId/contacts/:contactId", auth, async (req, res) => {
  try {
    const manufacturer = await Manufacturer.findById(req.params.manufacturerId);
    if (!manufacturer) {
      return res.status(404).json({ message: "Производитель не найден" });
    }

    // Используем метод .id() Mongoose для поиска поддокумента по ID
    const contact = manufacturer.contacts.id(req.params.contactId);
    if (!contact) {
      return res.status(404).json({ message: "Контакт не найден" });
    }
    res.json(contact);
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res
        .status(400)
        .json({ message: "Неверный ID производителя или контакта" });
    }
    res.status(500).send("Ошибка сервера");
  }
});

// PUT /api/manufacturers/:manufacturerId/contacts/:contactId - Обновить контакт производителя
router.put("/:manufacturerId/contacts/:contactId", auth, async (req, res) => {
  try {
    const manufacturer = await Manufacturer.findById(req.params.manufacturerId);
    if (!manufacturer) {
      return res.status(404).json({ message: "Производитель не найден" });
    }

    const contact = manufacturer.contacts.id(req.params.contactId);
    if (!contact) {
      return res.status(404).json({ message: "Контакт не найден" });
    }

    // Обновляем поля контакта
    Object.assign(contact, req.body); // Копируем свойства из req.body в contact
    await manufacturer.save(); // Сохраняем родительский документ (производителя)

    res.json(contact);
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res
        .status(400)
        .json({ message: "Неверный ID производителя или контакта" });
    }
    res.status(500).send("Ошибка сервера");
  }
});

// DELETE /api/manufacturers/:manufacturerId/contacts/:contactId - Удалить контакт производителя
router.delete(
  "/:manufacturerId/contacts/:contactId",
  auth,
  async (req, res) => {
    try {
      const manufacturer = await Manufacturer.findById(
        req.params.manufacturerId
      );
      if (!manufacturer) {
        return res.status(404).json({ message: "Производитель не найден" });
      }

      // Используем метод .pull() для удаления поддокумента по ID
      const initialLength = manufacturer.contacts.length;
      manufacturer.contacts.pull(req.params.contactId);

      if (manufacturer.contacts.length === initialLength) {
        // Если длина массива не изменилась, значит, контакт с таким ID не был найден
        return res.status(404).json({ message: "Контакт не найден" });
      }

      await manufacturer.save();
      res.json({ message: "Контакт успешно удален" });
    } catch (err) {
      console.error(err.message);
      if (err.kind === "ObjectId") {
        return res
          .status(400)
          .json({ message: "Неверный ID производителя или контакта" });
      }
      res.status(500).send("Ошибка сервера");
    }
  }
);

export default router; // Экспортируем маршрутизатор по умолчанию
