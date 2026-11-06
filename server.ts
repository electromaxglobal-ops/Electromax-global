import { app } from './src/server/app.ts';
import express from 'express';
import path from 'path';

const PORT = 3000;

if (process.env.NODE_ENV === 'production') {
  app.use(express.static('dist'));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve('dist', 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Electromax ERP server running on http://0.0.0.0:${PORT}`);
});
