import express from 'express';
import direccionRoutes from './routes/direccion.route';

export const app = express();

app.use(express.json());
app.use('/api/direccion', direccionRoutes);
