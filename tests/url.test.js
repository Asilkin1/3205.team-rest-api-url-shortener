const request = require("supertest");
const app = require("../server"); // Подключите сервер Express

describe("URL Shortener API", () => {
    it("should create a short URL with a unique alias", async () => {
        const response = await request(app)
            .post("/shorten")
            .send({
                originalUrl: "https://google.com",
                alias: "hello",
            });

        expect(response.status).toBe(201); // Проверяем статус ответа
        expect(response.body).toHaveProperty("shortUrl"); // Проверяем наличие поля shortUrl
        expect(response.body.shortUrl).toBe("hello"); // Проверяем, что alias сохранён правильно
    });

    it("should not allow duplicate aliases", async () => {
        // Повторная попытка создать ссылку с тем же alias
        const response = await request(app)
            .post("/shorten")
            .send({
                originalUrl: "https://google.com",
                alias: "hello",
            });

        expect(response.status).toBe(400); // Ожидаем ошибку
        expect(response.body).toHaveProperty("message", "Alias already exists");
    });
});

it("should redirect to the original URL", async () => {
    // Сначала создаём короткую ссылку
    await request(app)
        .post("/shorten")
        .send({
            originalUrl: "https://google.com",
            alias: "redirectTest",
        });

    // Проверяем редирект
    const response = await request(app).get("/redirectTest");

    expect(response.status).toBe(302); // Статус редиректа
    expect(response.headers.location).toBe("https://google.com"); // Проверяем URL редиректа
});

it("should return 404 for non-existent short URL", async () => {
    const response = await request(app).get("/nonExistentAlias");
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("message", "Short URL not found");
  });

  it("should return 400 for invalid request body", async () => {
    const response = await request(app).post("/shorten").send({});
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("message", "originalUrl is required");
  });