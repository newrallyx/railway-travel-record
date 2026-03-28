import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get('/healthz', (_req, res) => {
  res.status(200).json({ status: 'ok', service: 'railway-track-recorder-backend' });
});

app.get('/', (_req, res) => {
  res.json({ message: 'Railway Track Recorder backend skeleton is running.' });
});

app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});
