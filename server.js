const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');  // Добавленный модуль для работы с путями
const { Pool } = require('pg');

const app = express();
const port = 3000;

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'kino',
    password: '123123',
    port: 5432,
  });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

async function createTable() {
  try {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS movies (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        director VARCHAR(255) NOT NULL,
        release_year INT NOT NULL
      );
    `;
    await pool.query(createTableQuery);
    console.log('Table "movies" created successfully');
  } catch (error) {
    console.error('Error creating table:', error);
  }
}

createTable();

// Указание Express использовать статические файлы из папки 'public'
app.use(express.static(path.join(__dirname, 'public')));

app.post('/addMovie', async (req, res) => {
  try {
    const { title, director, release_year } = req.body;
    const result = await pool.query(
      'INSERT INTO movies (title, director, release_year) VALUES ($1, $2, $3) RETURNING *',
      [title, director, release_year]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error adding movie:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/movies', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM movies');
    res.json(result.rows);
  } catch (error) {
    console.error('Error getting movies:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
