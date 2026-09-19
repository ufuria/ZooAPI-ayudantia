import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import router from './src/routes/index.routes.js';
import { errorHandler } from './src/middlewares/error.middleware.js';
import prisma from './src/config/prisma.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

const frontendPath = path.join(__dirname, '../frontend/dist');
app.use(express.static(frontendPath));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next(); // deja pasar rutas de API que no matchearon (van al errorHandler / 404)
  res.sendFile(path.join(frontendPath, 'index.html'));
});

app.use('/api', router);

app.use(errorHandler);

async function bootstrap() {
  try {
    await prisma.$connect();
    console.log('=> Conexión a PostgreSQL establecida con éxito :3');

    app.listen(PORT, () => {
      console.log(`Servidor corriendo en puerto ${PORT}`);
    });
  } catch (error) {
    console.error('=> Error al iniciar el servidor o conectar a PostgreSQL:', error);
    process.exit(1);
  }
}

bootstrap();