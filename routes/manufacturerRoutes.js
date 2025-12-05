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

// POST /api/manufacturers - Добавить нового производителя
router.post("/", auth, async (req, res) => {
  try {
    const { name, buyer } = req.body;
    if (!name || !buyer) {
      return res
        .status(400)
        .json({ message: "Имя производителя и покупатель обязательны" });
    }
    const newManufacturer = new Manufacturer({ name, buyer });
    const manufacturer = await newManufacturer.save();
    res.status(201).json(manufacturer);
  } catch (err) {
    console.error(err.message);
    // Обработка ошибки уникальности имени производителя
    if (err.code === 11000) {
      return res
        .status(400)
        .json({ message: "Производитель с таким именем уже существует" });
    }
    res.status(500).send("Ошибка сервера");
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

    // Возвращаем только что добавленный продукт (последний в массиве)
    res
      .status(201)
      .json(manufacturer.products[manufacturer.products.length - 1]);
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
      res.json({ message: "Продукт успешно удален" });
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

export default router; // Экспортируем маршрутизатор по умолчанию
