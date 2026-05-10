const express = require('express');
const { appendFileSync } = require('fs');

const app = express();

app.use(express.json());

app.post('/log', (req, res) => {
  const logMessage = `[${new Date().toISOString()}] ${req.body.message}\n`;

  appendFileSync('activity.log', logMessage);

  console.log(logMessage.trim());

  res.send('Log saved');
});

app.listen(4000, '0.0.0.0', () => {
  console.log('Logging server running on port 4000');
});
