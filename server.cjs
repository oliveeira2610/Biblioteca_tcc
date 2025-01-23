const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const books = [
  { id: 1, title: '1984', author: 'George Orwell' },
  { id: 2, title: 'O Senhor dos Anéis', author: 'J.R.R. Tolkien' },
];

app.get('/api/books', (req, res) => {
  res.json(books);
});

app.listen(5173, () => console.log('Servidor rodando na porta 5173'));
