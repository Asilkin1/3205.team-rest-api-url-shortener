const express = require('express');
const router = express.Router();
const generateHash = require('../utils/generateHash');

const memoryStore = {};

/**
 1. Создание короткой ссылки:
POST /shorten: принимает JSON с полем originalUrl (обязательное) и возвращает укороченный URL.
Укороченный URL должен быть уникальным (можно использовать случайный хэш длиной 6 символов).
 *
*/
router.post('/shorten', (req, res) => {
    const { originalUrl, alias, expiresAt } = req.body;

    // should have originalUrl param
    if (!originalUrl) {
        return res.status(400).json({ message: 'originalUrl is required' });
    }

    // alias max length is 20 characters
    if (alias && alias.length > 20) {
        return res.status(400).json({ message: 'Alias exceeds max length of 20 characters' })
    }

    const shortUrl = alias || generateHash();
    if (memoryStore[shortUrl]) {
        return res.status(400).json({ message: 'Alias already exists' });
    }

    // save data
    memoryStore[shortUrl] = {
        originalUrl,
        shortUrl,
        createdAt: new Date(),
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        clickCount: 0,
        analytics: []
    };
    console.log(shortUrl);
    res.status(201).json({ shortUrl });
});

// GET /:shortUrl
router.get('/:shortUrl', (req, res) => {

    /**
     * Переадресация:
     * GET /{shortUrl}: переадресует пользователя на оригинальный URL.
     * Если ссылка не найдена, возвращает ошибку 404.
     **/
    const { shortUrl } = req.params;

    const urlData = memoryStore[shortUrl];

    if (!urlData) {
        return res.status(404).json({ message: 'Short URL not found' });
    }

    if (urlData.expiresAt && newDate() > new Date(urlData.expiresAt)) {
        return res.status(410).json({ message: "URL has expired" });
    }

    urlData.clickCount += 1;
    urlData.analytics.push({
        ip: req.ip,
        clickedAt: new Date(),
    });

    if (urlData.analytics.length > 5) {
        urlData.analytics.shift();
    }

    res.redirect(urlData.originalUrl);
});

// GET /analytics/:shortUlr
router.get('/analytics/:shortUrl', (req, res) => {
    const { shortUrl } = req.params;

    const urlData = memoryStore[shortUrl];
    if (!urlData) {
        return res.status(404).json({ message: 'URL is not found' });
    }

    res.json({
        clickCount: urlData.clickCount,
        lastFiveIps: urlData.analytics.map((entry) => ({
            ip: entry.ip,
            clickedAt: entry.clickedAt,
        })),
    });

    // GET /info/:shortUrl
    router.get('/info/:shortUrl', (req, res) => {
        const { shortUrl } = req.params;

        const urlData = memoryStore[shortUrl];
        if (!urlData) {
            return res.status(404).json({ message: 'URL is not found' });
        }

        res.json({
            originalUrl: urlData.originalUrl,
            createdAt: urlData.createdAt,
            clickCount: urlData.clickCount,
        });
    });

    // DELETE /delete/:shortUrl
    router.delete('/delete/:shortUrl', (req, res) => {
        const { shortUrl } = req.params;

        if (!memoryStore[shortUrl]) {
            return res.status(404).json({ message: 'URL is not found' });
        }

        delete memoryStore[shortUrl];
        res.status(200).json({ message: 'URL deleted successfully' });
    });
});

module.exports = router;