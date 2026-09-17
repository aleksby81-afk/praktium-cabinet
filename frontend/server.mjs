import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const app = express();
const dist = path.join(path.dirname(fileURLToPath(import.meta.url)), 'dist');
app.disable('x-powered-by');
app.use('/assets', express.static(path.join(dist, 'assets'), { immutable: true, maxAge: '1y' }));
app.use(express.static(dist, { maxAge: 0 }));
app.get('/{*path}', (req, res) => {
  if (path.extname(req.path)) return res.sendStatus(404);
  res.set('Cache-Control', 'no-cache').sendFile(path.join(dist, 'index.html'));
});
app.listen(Number(process.env.PORT || 3000), '0.0.0.0');
