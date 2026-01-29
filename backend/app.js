const express = require('express');
const app = express();

app.use(express.json());

app.get('/', (req, res) => {
    res.json({ message: 'API Mon Vieux Grimoire OK' });
});

module.exports = app;
