import axios from 'axios';
import dotenv from 'dotenv';
import { GeocodingResponse, GeocodingResult } from '../types';

dotenv.config();

const API_KEY = process.env.GOOGLE_API_KEY!;

export const buscar = async (direccion: string): Promise<GeocodingResult> => {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(direccion)}&key=${API_KEY}`;

    const response = await axios.get<GeocodingResponse>(url);
    const data = response.data;

    if (data.status !== 'OK' || !data.results.length) {
        throw new Error(`No se pudo geocodificar: ${direccion}`);
    }

    const result = data.results[0];
    return result;
}
