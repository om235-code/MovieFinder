const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcrypt');
const fs = require('fs');

const app = express();
const PORT = 3000;

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
    console.log('Database connection failed:', err.message);
    return;
  }

  logMessage('Connected to database');
});

function logMessage(message) {
  const log = `[${new Date().toISOString()}] ${message}`;

  console.log(log);
  fs.appendFileSync('app.log', log + '\n');

  fetch('http://192.168.56.106:4000/log', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ message: log })
  }).catch(() => {
    console.log('Logging VM unavailable');
  });
}

app.get('/', (req, res) => {
  logMessage('GET / accessed');
  res.send('MovieFinder backend is running');
});

app.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  logMessage(`Register attempt received for email: ${email}`);

  if (!name || !email || !password) {
    logMessage(`Register failed - missing fields for email: ${email}`);
    return res.status(400).send('All fields are required');
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    db.query(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashedPassword],
      (err) => {
        if (err) {
          logMessage(`Register failed for ${email}: ${err.message}`);
          return res.status(500).send('Registration failed');
        }

        logMessage(`User registered successfully: ${email}`);
        res.send('User registered');
      }
    );
  } catch (error) {
    logMessage(`Register server error for ${email}: ${error.message}`);
    res.status(500).send('Server error');
  }
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;

  logMessage(`Login attempt received for email: ${email}`);

  if (!email || !password) {
    logMessage(`Login failed - missing fields for email: ${email}`);
    return res.status(400).send('Email and password are required');
  }

  db.query(
    'SELECT * FROM users WHERE email = ?',
    [email],
    async (err, results) => {
      if (err) {
        logMessage(`Login query error for ${email}: ${err.message}`);
        return res.status(500).send('Error');
      }

      if (results.length === 0) {
        logMessage(`Login failed - user not found: ${email}`);
        return res.send('User not found');
      }

      const user = results[0];
      const match = await bcrypt.compare(password, user.password);

      if (!match) {
        logMessage(`Login failed - invalid password for: ${email}`);
        return res.send('Invalid credentials');
      }

      logMessage(`Login successful for: ${email}`);
      res.send('Login successful');
    }
  );
});

app.get('/search', (req, res) => {
  const query = (req.query.q || req.query.query || '').toLowerCase().trim();

  logMessage(`Movie search requested: ${query}`);

  if (!query) {
    return res.status(400).json({ error: 'Search query is required' });
  }

  const movieDatabase = [
    {
      title: 'Batman Begins',
      year: '2005',
      poster_url: 'https://image.tmdb.org/t/p/w500/8RW2runSEc34IwKN2D1aPcJd2UL.jpg',
      provider_name: 'HBO Max',
      provider_url: 'https://www.max.com/search?q=Batman%20Begins',
      keywords: ['batman', 'batman begins']
    },
    {
      title: 'The Batman',
      year: '2022',
      poster_url: 'https://image.tmdb.org/t/p/w500/74xTEgt7R36Fpooo50r9T25onhq.jpg',
      provider_name: 'HBO Max',
      provider_url: 'https://www.max.com/search?q=The%20Batman',
      keywords: ['batman', 'the batman']
    },
    {
      title: 'Batman',
      year: '1989',
      poster_url: 'https://image.tmdb.org/t/p/w500/kBf3g9crrADGMc2AMAMlLBgSm2h.jpg',
      provider_name: 'Prime Video',
      provider_url: 'https://www.primevideo.com/search/ref=atv_nb_sr?phrase=batman',
      keywords: ['batman']
    },
    {
      title: 'Avatar',
      year: '2009',
      poster_url: 'https://image.tmdb.org/t/p/w500/kyeqWdyUXW608qlYkRqosgbbJyK.jpg',
      provider_name: 'Disney+',
      provider_url: 'https://www.disneyplus.com/search?q=avatar',
      keywords: ['avatar']
    },
    {
      title: 'Avatar: The Way of Water',
      year: '2022',
      poster_url: 'https://image.tmdb.org/t/p/w500/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg',
      provider_name: 'Disney+',
      provider_url: 'https://www.disneyplus.com/search?q=avatar',
      keywords: ['avatar', 'way of water']
    },
    {
      title: 'Sonic the Hedgehog',
      year: '2020',
      poster_url: 'https://image.tmdb.org/t/p/w500/aQvJ5WPzZgYVDrxLX4R6cLJCEaQ.jpg',
      provider_name: 'Paramount+',
      provider_url: 'https://www.paramountplus.com/search/?query=sonic',
      keywords: ['sonic', 'sonic the hedgehog']
    },
    {
      title: 'Sonic the Hedgehog 2',
      year: '2022',
      poster_url: 'https://image.tmdb.org/t/p/w500/6DrHO1jr3qVrViUO6s6kFiAGM7.jpg',
      provider_name: 'Paramount+',
      provider_url: 'https://www.paramountplus.com/search/?query=sonic',
      keywords: ['sonic', 'sonic 2']
    },
    {
      title: 'The Office',
      year: '2005-2013',
      poster_url: 'https://image.tmdb.org/t/p/w500/qWnJzyZhyy74gjpSjIXWmuk0ifX.jpg',
      provider_name: 'Peacock',
      provider_url: 'https://www.peacocktv.com/search?q=the%20office',
      keywords: ['office', 'the office']
    },
    {
      title: 'Demon Slayer: Kimetsu no Yaiba',
      year: '2019-2024',
      poster_url: 'https://image.tmdb.org/t/p/w500/xUfRZu2mi8jH6SzQEJGP6tjBuYj.jpg',
      provider_name: 'Crunchyroll',
      provider_url: 'https://www.crunchyroll.com/search?q=demon%20slayer',
      keywords: ['demon slayer', 'kimetsu no yaiba']
    }
  ];

  const results = movieDatabase.filter(movie =>
    movie.keywords.some(keyword => keyword.includes(query) || query.includes(keyword))
  );

  res.json(results);
});

app.post('/favorites', (req, res) => {
  const {
    user_email,
    movie_title,
    movie_year,
    poster_url,
    provider_name,
    provider_url
  } = req.body;

  logMessage(`Favorite add requested by ${user_email}: ${movie_title}`);

  if (!user_email || !movie_title) {
    return res.status(400).send('User email and movie title are required');
  }

  db.query(
    `INSERT INTO favorites
    (user_email, movie_title, movie_year, poster_url, provider_name, provider_url)
    VALUES (?, ?, ?, ?, ?, ?)`,
    [user_email, movie_title, movie_year, poster_url, provider_name, provider_url],
    (err) => {
      if (err) {
        logMessage(`Favorite add failed: ${err.message}`);
        return res.status(500).send('Failed to save favorite');
      }

      logMessage(`Favorite saved for ${user_email}: ${movie_title}`);
      res.send('Favorite saved');
    }
  );
});

app.get('/favorites/:email', (req, res) => {
  const email = req.params.email;

  logMessage(`Favorites requested for: ${email}`);

  db.query(
    'SELECT * FROM favorites WHERE user_email = ? ORDER BY id DESC',
    [email],
    (err, results) => {
      if (err) {
        logMessage(`Favorites load failed for ${email}: ${err.message}`);
        return res.status(500).send('Failed to fetch favorites');
      }

      res.json(results);
    }
  );
});

app.delete('/favorites/:id', (req, res) => {
  const id = req.params.id;

  logMessage(`Favorite delete requested for id: ${id}`);

  db.query(
    'DELETE FROM favorites WHERE id = ?',
    [id],
    (err) => {
      if (err) {
        logMessage(`Favorite delete failed for id ${id}: ${err.message}`);
        return res.status(500).send('Failed to delete favorite');
      }

      logMessage(`Favorite deleted with id: ${id}`);
      res.send('Favorite deleted');
    }
  );
});

app.post('/provider-click', (req, res) => {
  const {
    user_email,
    movie_title,
    provider_name
  } = req.body;

  logMessage(`Provider clicked by ${user_email}: ${provider_name} for ${movie_title}`);
  res.send('Provider click logged');
});

app.listen(PORT, '0.0.0.0', () => {
  logMessage(`Server running on port ${PORT}`);
});
