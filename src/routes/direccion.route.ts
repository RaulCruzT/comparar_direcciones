import express from 'express';
import { buscarHandler, compararHandler, compararLoteHandler, compararCoincidenciasResultadosHandler } from '../controller/direccion.controller';

const router = express.Router();

router.post('/buscar', buscarHandler);
router.post('/comparar', compararHandler);
router.post('/comparar-lote', compararLoteHandler);
router.post('/comparar-resultados', compararCoincidenciasResultadosHandler);

export default router;