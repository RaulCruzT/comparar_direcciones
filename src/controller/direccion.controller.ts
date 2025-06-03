import { GeocodingResult, comparissonEnum } from '../types';
import { buscar } from '../services/direccion.service';
import { RequestHandler } from 'express';

const garantizarDireccion = (direccion: string, nombre: string) => {
    if (!direccion || typeof direccion !== 'string' || direccion.trim() === '') {
        throw new Error(`El parámetro "${nombre}" debe ser un string no vacío.`);
    }
};

const validarComparissonType = (value: any): comparissonEnum => {
    if (!Object.values(comparissonEnum).includes(value)) {
        throw new Error(`El parámetro "comparissonType" acepta los valores ${comparissonEnum.FormatedAddress} y ${comparissonEnum.PlaceId}`);
    }
    return value;
};

const compararResultados = (
    resultado1: GeocodingResult,
    resultado2: GeocodingResult,
    tipo: comparissonEnum
): Record<string, any> => {
    if (tipo === comparissonEnum.FormatedAddress) {
        return {
            formatted_address_1: resultado1.formatted_address,
            formatted_address_2: resultado2.formatted_address,
            misma_direccion: resultado1.formatted_address === resultado2.formatted_address
        };
    } else {
        return {
            place_id_1: resultado1.place_id,
            place_id_2: resultado2.place_id,
            misma_direccion: resultado1.place_id === resultado2.place_id
        };
    }
};

const compararDirecciones = async (
    direccion1: string,
    direccion2: string,
    tipo: comparissonEnum
): Promise<Record<string, any>> => {
    const resultado1 = await buscar(direccion1);
    const resultado2 = await buscar(direccion2);
    return compararResultados(resultado1, resultado2, tipo);
};

export const buscarHandler: RequestHandler = async (req, res) => {
    const { direccion } = req.body;

    try {
        garantizarDireccion(direccion, 'direccion');
        const resultado: GeocodingResult = await buscar(direccion);
        res.json(resultado);
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Error desconocido';
        res.status(500).json({ error: message });
    }
};

export const compararHandler: RequestHandler = async (req, res) => {
    const { direccion1, direccion2, comparissonType } = req.body;

    try {
        garantizarDireccion(direccion1, 'direccion1');
        garantizarDireccion(direccion2, 'direccion2');
        const tipo = validarComparissonType(comparissonType);

        const resultado = await compararDirecciones(direccion1, direccion2, tipo);
        res.json(resultado);
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Error desconocido';
        res.status(500).json({ error: message });
    }
};

export const compararLoteHandler: RequestHandler = async (req, res) => {
    const comparaciones: {
        direccion1: string;
        direccion2: string;
        comparissonType: comparissonEnum;
    }[] = req.body;

    if (!Array.isArray(comparaciones) || comparaciones.length === 0) {
        res.status(400).json({ error: 'Debe enviar un arreglo de comparaciones.' });
    }

    const resultados = await Promise.all(
        comparaciones.map(async ({ direccion1, direccion2, comparissonType }, index) => {
            try {
                garantizarDireccion(direccion1, `comparaciones[${index}].direccion1`);
                garantizarDireccion(direccion2, `comparaciones[${index}].direccion2`);
                const tipo = validarComparissonType(comparissonType);

                const resultado = await compararDirecciones(direccion1, direccion2, tipo);
                return resultado;
            } catch (error) {
                const message = error instanceof Error ? error.message : 'Error desconocido';
                return { error: message };
            }
        })
    );

    res.json(resultados);
};

export const compararCoincidenciasResultadosHandler: RequestHandler = async (req, res) => {
    const { resultados1, resultados2, comparissonType } = req.body;

    if (!Array.isArray(resultados1) || !Array.isArray(resultados2)) {
        res.status(400).json({ error: 'Debe enviar dos arreglos de resultados válidos.' });
        return;
    }

    let tipo: comparissonEnum;
    try {
        tipo = validarComparissonType(comparissonType);
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Error en comparissonType';
        res.status(400).json({ error: message });
        return;
    }

    const coincidencias: any[] = [];

    for (const r1 of resultados1) {
        for (const r2 of resultados2) {
            if (tipo === comparissonEnum.FormatedAddress) {
                if (r1.formatted_address === r2.formatted_address) {
                    coincidencias.push({
                        direccion1: r1.formatted_address,
                        direccion2: r2.formatted_address,
                        formatted_address_1: r1.formatted_address,
                        formatted_address_2: r2.formatted_address,
                        misma_direccion: true
                    });
                }
            } else if (tipo === comparissonEnum.PlaceId) {
                if (r1.place_id === r2.place_id) {
                    coincidencias.push({
                        direccion1: r1.formatted_address,
                        direccion2: r2.formatted_address,
                        place_id_1: r1.place_id,
                        place_id_2: r2.place_id,
                        misma_direccion: true
                    });
                }
            }
        }
    }

    res.json({ coincidencias });
};