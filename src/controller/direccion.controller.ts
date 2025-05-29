import { GeocodingResult, comparissonEnum } from '../types';
import { buscar } from '../services/direccion.service';
import { RequestHandler } from 'express';

export const buscarHandler: RequestHandler = async (req, res, _next) => {
    const { direccion } = req.body;

    try {
        garantizarDireccion(direccion, "direccion");
        const resultado: GeocodingResult = await buscar(direccion);
        res.json(resultado);
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Error desconocido';
        res.status(500).json({ error: message });
    }
};

export const compararHandler: RequestHandler = async (req, res, _next) => {
    const { direccion1, direccion2, comparissonType } = req.body;

    
    try {
        garantizarDireccion(direccion1, "direccion1");
        garantizarDireccion(direccion2, "direccion2");
        
        if (
            !comparissonType
            || (comparissonType !== comparissonEnum.FormatedAddress && comparissonType !== comparissonEnum.PlaceId)
        ) {
            res.status(400).json({ error: `El parámetro "comparissonType" acepta los valores ${comparissonEnum.FormatedAddress} y ${comparissonEnum.PlaceId}` });
            return;
        }
        
        const resultado1: GeocodingResult = await buscar(direccion1);
        const resultado2: GeocodingResult = await buscar(direccion2);

        switch (comparissonType) {
            case comparissonEnum.FormatedAddress:
                res.json({
                    "formatted_address_1": resultado1.formatted_address,
                    "formatted_address_2": resultado2.formatted_address,
                    "misma_direccion": resultado1.formatted_address === resultado2.formatted_address
                });
                break;
            case comparissonEnum.PlaceId:
                res.json({
                    "place_id_1": resultado1.place_id,
                    "place_id_2": resultado2.place_id,
                    "misma_direccion": resultado1.place_id === resultado2.place_id
                });
                break;
            default:
                break;
        }

    } catch (error) {
        const message = error instanceof Error ? error.message : 'Error desconocido';
        res.status(500).json({ error: message });
    }
};

const garantizarDireccion = (direccion: string, nombre: string) => {
    if (
        !direccion ||
        typeof direccion !== 'string' ||
        direccion.trim() === ''
    ) {
        throw new Error(`El parámetro "${nombre}" debe ser un string no vacío.`);
    }
}