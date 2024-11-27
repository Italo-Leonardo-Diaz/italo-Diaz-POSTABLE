import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors'; // Para permitir solicitudes de diferentes orígenes
import postRoutes from './routers/postRoutes'; // Rutas de posts
import errorMiddleware from './middlewares/errorMiddleware'; // Middleware de errores
import { validateSchema } from './middlewares/validationMiddleware'; // Middleware de validación
import { postSchema } from './schemas/postSchema'; // Esquema de validación para los posts

dotenv.config();

const app = express();

// Middleware para habilitar CORS (si es necesario)
app.use(cors()); // Si deseas permitir solicitudes de diferentes dominios, puedes personalizar la configuración de CORS

app.use(express.json()); // Middleware para parsear JSON, en vez de bodyParser

// Rutas con validación solo en los endpoints que crean o actualizan posts
// Se valida solo en las rutas de creación y actualización de posts
app.post('/api/posts', validateSchema(postSchema)); // Validación al crear un post
app.put('/api/posts/:id', validateSchema(postSchema)); // Validación al actualizar un post

// Rutas
app.use('/api', postRoutes); // Rutas de posts

// Middleware de manejo de errores
app.use(errorMiddleware);

// Iniciar servidor
app.listen(process.env.PORT || 5000, () => {
  console.log(`Servidor corriendo en el puerto ${process.env.PORT || 5000}`);
});
