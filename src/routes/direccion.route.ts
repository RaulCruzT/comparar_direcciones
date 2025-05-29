import express from 'express';
import { buscarHandler, compararHandler } from '../controller/direccion.controller';

const router = express.Router();

router.post('/buscar', buscarHandler);
router.post('/comparar', compararHandler);

export default router;