import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors'; 
import postRoutes from './routers/postRoutes'; 
import errorMiddleware from './middlewares/errorMiddleware'; 
import { validateSchema } from './middlewares/validationMiddleware'; 
import { postSchema } from './schemas/postSchema'; 

dotenv.config();

const app = express();

app.use(cors());

app.use(express.json());

app.use('/api/posts', postRoutes);

app.post('/api/posts', validateSchema(postSchema)); 
app.put('/api/posts/:id', validateSchema(postSchema)); 

app.use(errorMiddleware);

app.listen(process.env.PORT || 5000, () => {
  console.log(`Servidor corriendo en el puerto ${process.env.PORT || 5000}`);
});
