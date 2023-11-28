const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
require('dotenv').config(); // Для использования переменных окружения
const app = express();
const port = process.env.PORT || 5050;

// Подключение к базе данных
const pool = new Pool({
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5050,
});

// Проверка подключения к базе данных
pool.connect()
  .then(() => console.log('Connected to the database'))
  .catch(err => console.error('Error connecting to the database', err))
  .finally(() => pool.end());

app.use(bodyParser.json());

// Центральный обработчик ошибок
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

app.get('/films', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM films');
    res.json(rows);
  } catch (error) {
    next(error);
  }
});

app.post('/film', async (req, res) => {
  const { title, year, description } = req.body;
  if (!title || !year || !description) {
    return res.status(400).json({ error: 'Пожалуйста, укажите все поля фильма.' });
  }
  try {
    const queryText = 'INSERT INTO films (title, year, description) VALUES ($1, $2, $3) RETURNING *';
    const values = [title, year, description];
    const { rows } = await pool.query(queryText, values);
    res.status(201).json(rows[0]);
  } catch (error) {
    next(error);
  }
});

app.get('/film/:id', async (req, res) => {
  const filmId = req.params.id;
  try {
    const { rows } = await pool.query('SELECT * FROM films WHERE id = $1', [filmId]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Фильм не найден' });
    }
    res.json(rows[0]);
  } catch (error) {
    next(error);
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
