const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const mysql = require('mysql2');

const app = express();

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: '192.168.56.103',
  user: 'movieuser',
  password: 'movie123',
  database: 'moviefinder'
});

db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err);
  } else {
    console.log('Connected to database');
  }
});

app.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).send('All fields are required');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const sql = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
  db.query(sql, [name, email, hashedPassword], (err) => {
    if (err) {
      console.error(err);
      res.send('Error');
    } else {
      res.send('User registered');
    }
  });
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;

  const sql = 'SELECT * FROM users WHERE email = ?';
  db.query(sql, [email], async (err, result) => {
    if (err) {
      console.error(err);
      return res.send('Error');
    }

    if (result.length > 0) {
      const match = await bcrypt.compare(password, result[0].password);
      if (match) {
        res.send('Login successful');
      } else {
        res.send('Invalid credentials');
      }
    } else {
      res.send('User not found');
    }
  });
});

app.listen(3000, '0.0.0.0', () => {
  console.log('Server running on port 3000');
});
