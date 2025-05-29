import express from 'express';
import { buscarHandler, compararHandler, compararLoteHandler } from '../controller/direccion.controller';

const router = express.Router();

router.post('/buscar', buscarHandler);
router.post('/comparar', compararHandler);
router.post('/comparar-lote', compararLoteHandler);

export default router;