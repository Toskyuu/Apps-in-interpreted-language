const express = require("express");
const { json } = require("body-parser");
const { createPool } = require("mysql2/promise");
const { check, validationResult } = require("express-validator");
const { StatusCodes, ReasonPhrases } = require("http-status-codes");
const jsonPatch = require("fast-json-patch");

const app = express();
const port = 3000;

const dbConfig = {
  host: "localhost",
  user: "API",
  password: "api123",
  database: "aji",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

const pool = createPool(dbConfig);

app.use(json());

const validateProduct = [
  check("nazwa").notEmpty().withMessage("Nazwa produktu nie może być pusta"),
  check("opis").notEmpty().withMessage("Opis produktu nie może być pusty"),
  check("cena_jednostkowa")
    .isFloat({ gt: 0 })
    .withMessage("Cena produktu musi być liczbą większą lub równą 0"),
  check("waga_jednostkowa")
    .isFloat({ gt: 0 })
    .withMessage("Waga produktu musi być liczbą większą lub równą 0"),
];

const validateOrderPost = [
  check("nazwa_uzytkownika")
    .notEmpty()
    .withMessage("Nazwa użytkownika nie może być pusta"),
  check("email").notEmpty().withMessage("Email użytkownika nie może być pusty"),
  check("numer_telefonu")
    .notEmpty()
    .withMessage("Numer telefonu użytkownika nie może być pusty"),
  check("email")
    .isEmail()
    .withMessage("Podany email użytkownika jest nieprawidłowy"),
  check("numer_telefonu")
    .isNumeric()
    .withMessage("Numer telefonu użytkownika musi zawierać tylko cyfry"),
];

const validateOrderPatch = [
  check("nazwa_uzytkownika")
    .optional()
    .notEmpty()
    .withMessage("Nazwa użytkownika nie może być pusta"),
  check("email")
    .optional()
    .notEmpty()
    .withMessage("Email użytkownika nie może być pusty"),
  check("numer_telefonu")
    .optional()
    .notEmpty()
    .withMessage("Numer telefonu użytkownika nie może być pusty"),
  check("email")
    .optional()
    .isEmail()
    .withMessage("Podany email użytkownika jest nieprawidłowy"),
  check("numer_telefonu")
    .optional()
    .isNumeric()
    .withMessage("Numer telefonu użytkownika musi zawierać tylko cyfry"),
];
// API Produktu
app.get("/products", async (req, res) => {
  try {
    const [rows, fields] = await pool.execute(
      "SELECT P.*, K.nazwa as 'nazwa_kategorii' FROM produkt P JOIN kategoria K ON K.kategoria_id = P.kategoria_id"
    );
    res.json(rows);
  } catch (error) {
    console.error("Błąd podczas pobierania produktów:", error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send(ReasonPhrases.INTERNAL_SERVER_ERROR);
  }
});

app.get("/products/:id", async (req, res) => {
  const productId = req.params.id;
  try {
    const [rows, fields] = await pool.execute(
      "SELECT P.*, K.nazwa as 'nazwa_kategorii' FROM produkt P JOIN kategoria K ON K.kategoria_id = P.kategoria_id WHERE produkt_id = ?",
      [productId]
    );
    if (rows.length > 0) {
      res.json(rows);
    } else {
      res
        .status(StatusCodes.NOT_FOUND)
        .json({ error: "Produkt nie znaleziony" });
    }
  } catch (error) {
    console.error("Błąd podczas pobierania produktu:", error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send(ReasonPhrases.INTERNAL_SERVER_ERROR);
  }
});

app.post("/products", validateProduct, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    return res.status(StatusCodes.BAD_REQUEST).json({ errors: errors.array() });
  }
  const newProduct = req.body;
  try {
    const [result] = await pool.query("INSERT INTO produkt SET ?", [
      newProduct,
    ]);
    res.json({ productId: result.insertId });
  } catch (error) {
    console.error("Błąd podczas dodawania produktu:", error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send(ReasonPhrases.INTERNAL_SERVER_ERROR);
  }
});

app.put("/products/:id", validateProduct, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    return res.status(StatusCodes.BAD_REQUEST).json({ errors: errors.array() });
  }

  const productId = req.params.id;
  const updatedProduct = req.body;
  try {
    const [existingProducts] = await pool.query(
      "SELECT * FROM produkt WHERE produkt_id = ?",
      [productId]
    );
    if (existingProducts.length === 0) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ error: "Produkt o podanym identyfikatorze nie istnieje" });
    }

    await pool.query(`UPDATE produkt SET ? WHERE produkt_id = ?`, [
      updatedProduct,
      productId,
    ]);
    res.json({ success: true });
  } catch (error) {
    console.error("Błąd podczas aktualizacji produktu:", error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send(ReasonPhrases.INTERNAL_SERVER_ERROR);
  }
});

// API Kategorii
app.get("/categories", async (req, res) => {
  try {
    const [rows, fields] = await pool.execute("SELECT * FROM kategoria");
    res.json(rows);
  } catch (error) {
    console.error("Błąd podczas pobierania kategorii:", error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send(ReasonPhrases.INTERNAL_SERVER_ERROR);
  }
});

// API Zamówień
app.get("/orders", async (req, res) => {
  try {
    const [rows, fields] = await pool.query("SELECT * FROM zamowienie");
    res.json(rows);
  } catch (error) {
    console.error("Błąd podczas pobierania zamówień:", error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send(ReasonPhrases.INTERNAL_SERVER_ERROR);
  }
});

app.post("/orders", validateOrderPost, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(StatusCodes.BAD_REQUEST).json({ errors: errors.array() });
  }
  const newOrder = req.body;

  try {
    const [result] = await pool.query("INSERT INTO zamowienie SET ?", [
      newOrder,
    ]);
    res.json({ orderId: result.insertId });
  } catch (error) {
    console.error("Błąd podczas dodawania zamówienia:", error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send(ReasonPhrases.INTERNAL_SERVER_ERROR);
  }
});

app.patch("/orders/:id", async (req, res) => {
  const orderId = req.params.id;
  const jsonPatchOperations = req.body;

  try {
    const [existingOrder] = await pool.query(
      "SELECT * FROM Zamowienie WHERE zamowienie_id = ?",
      [orderId]
    );

    if (existingOrder.length === 0) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ error: "Zamowienie o podanym identyfikatorze nie istnieje" });
    }

    // SPRAWDZENIE CZY MOZNA ZMIENIC STAN ZAMOWIENIA
    if (jsonPatchOperations.some(
      (op) => op.path === "/stan_zamowienia_id" && op.value < existingOrder[0].stan_zamowienia_id)) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: "Nie można zmienić statusu zamówienia wstecz" });
    }

    const [cancelledStatusId] = await pool.query(
      "SELECT * FROM stan_zamowienia WHERE nazwa = ?",
      ["ANULOWANE"]
    );

    // SPRAWDZENIE CZY ZAMOWIENIE JEST ANULOWANE
    if (
      existingOrder[0].stan_zamowienia_id === cancelledStatusId[0].stan_zamowienia_id
    ) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: "Nie można zmienić statusu anulowanego zamówienia" });
    }

    const [approvedStatus] = await pool.query(
      "SELECT * FROM stan_zamowienia WHERE nazwa = ?",
      ["ZATWIERDZONE"]
    );

    // Konwertuj operacje z JSON Patch na format zrozumiały przez fast-json-patch
    const patchedOrder = jsonPatch.applyPatch(
      existingOrder[0],
      jsonPatchOperations
    ).newDocument;

    // Sprawdź, czy zmieniany jest stan na "ZATWIERDZONE"
    if (
      jsonPatchOperations.some(
        (op) => op.path === "/stan_zamowienia_id" && op.value === approvedStatus[0].stan_zamowienia_id
      )
    ) {
      // Ustaw kolumnę data_zatwierdzenia na aktualny czas
      patchedOrder.data_zatwierdzenia = new Date();
    }

    // Aktualizuj zamówienie w bazie danych zgodnie z operacjami z JSON Patch
    await pool.query("UPDATE Zamowienie SET ? WHERE zamowienie_id = ?", [
      patchedOrder,
      orderId,
    ]);

    res.json({ success: true });
  } catch (error) {
    console.error("Błąd podczas zmiany zamówienia:", error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send(ReasonPhrases.INTERNAL_SERVER_ERROR);
  }
});
app.get("/orders/status/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const [rows, fields] = await pool.query(
      "SELECT * FROM zamowienie WHERE stan_zamowienia_id = ?",
      [id]
    );
    res.json(rows);
  } catch (error) {
    console.error("Błąd podczas pobierania zamówień według stanu:", error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send(ReasonPhrases.INTERNAL_SERVER_ERROR);
  }
});

// API Stanów zamówienia
app.get("/status", async (req, res) => {
  try {
    const [rows, fields] = await pool.query("SELECT * FROM stan_zamowienia");
    res.json(rows);
  } catch (error) {
    console.error("Błąd podczas pobierania stanów zamówień:", error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send(ReasonPhrases.INTERNAL_SERVER_ERROR);
  }
});

//API produktów w zamówieniu
app.get("/orders/:id/products", async (req, res) => {
  const id_zamowienia = req.params.id;

  try {
    const [rows, fields] = await pool.query(
      "SELECT P.*, K.nazwa as 'nazwa_kategorii', Z.ilosc FROM produkt_zamowienie Z JOIN produkt P ON Z.produkt_id = P.produkt_id JOIN kategoria K ON K.kategoria_id = P.kategoria_id WHERE Z.zamowienie_id = ?",
      [id_zamowienia]
    );

    if (rows.length > 0) {
      res.json(rows);
    } else {
      res
        .status(StatusCodes.NOT_FOUND)
        .json({ error: "Brak produktów dla danego zamówienia" });
    }
  } catch (error) {
    console.error("Błąd podczas pobierania produktów dla zamówienia:", error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send(ReasonPhrases.INTERNAL_SERVER_ERROR);
  }
});

// Dodawanie produktów do zamówienia
app.post("/orders/:id/products", async (req, res) => {
  const orderId = req.params.id;
  const newProductOrder = req.body;

  try {
    const [existingOrder] = await pool.query(
      "SELECT * FROM zamowienie WHERE zamowienie_id = ?",
      [orderId]
    );

    if (existingOrder.length === 0) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ error: "Zamowienie o podanym identyfikatorze nie istnieje" });
    }

    const [existingProduct] = await pool.query(
      "SELECT * FROM produkt WHERE produkt_id = ?",
      [newProductOrder.produkt_id]
    );

    if (existingProduct.length === 0) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ error: "Produkt o podanym identyfikatorze nie istnieje" });
    }

    await pool.query("INSERT INTO produkt_zamowienie SET ?", [
      {
        zamowienie_id: orderId,
        produkt_id: newProductOrder.produkt_id,
        ilosc: newProductOrder.ilosc,
      },
    ]);

    res.json({ success: true });
  } catch (error) {
    console.error("Błąd podczas dodawania produktu do zamówienia:", error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send(ReasonPhrases.INTERNAL_SERVER_ERROR);
  }
});

// Edycja ilości produktów w zamówieniu
app.put("/orders/:orderId/products/:productId", async (req, res) => {
  const orderId = req.params.orderId;
  const productId = req.params.productId;
  const quantity = req.body.ilosc;

  try {
    const [existingOrder] = await pool.query(
      "SELECT * FROM zamowienie WHERE zamowienie_id = ?",
      [orderId]
    );

    if (existingOrder.length === 0) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ error: "Zamowienie o podanym identyfikatorze nie istnieje" });
    }

    const [existingProductInOrder] = await pool.query(
      "SELECT * FROM produkt_zamowienie WHERE zamowienie_id = ? AND produkt_id = ?",
      [orderId, productId]
    );

    if (existingProductInOrder.length === 0) {
      return res.status(StatusCodes.NOT_FOUND).json({
        error: "Produkt o podanym identyfikatorze nie istnieje w zamówieniu",
      });
    }

    await pool.query(
      "UPDATE produkt_zamowienie SET ilosc = ? WHERE zamowienie_id = ? AND produkt_id = ?",
      [quantity, orderId, productId]
    );

    res.json({ success: true });
  } catch (error) {
    console.error("Błąd podczas edycji ilości produktu w zamówieniu:", error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send(ReasonPhrases.INTERNAL_SERVER_ERROR);
  }
});

app.listen(port, () => {
  console.log(`Serwer API nasłuchuje na porcie ${port}`);
});
