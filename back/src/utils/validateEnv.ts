import { z } from 'zod';
import { logger } from './logger';

const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.string().default('3001'),
    KEYFILE_PATH: z.string(),
    PROJECT_ID: z.string(),
    LOCATION: z.string(),
    DATASET_ID: z.string(),
    DICOMSTORE_ID: z.string(),
    ALLOWED_ORIGINS: z.string().optional(),
    GCS_CONFIG_URI: z.string().optional(),
});

export const validateEnv = () => {
    try {
        const validatedEnv = envSchema.parse(process.env);
        logger.info('Variables de entorno validadas correctamente');
        return validatedEnv;
    } catch (error) {
        if (error instanceof z.ZodError) {
            const missingVars = error.errors.map(err => err.path.join('.')).join(', ');
            logger.error(`Error en variables de entorno: ${missingVars}`);
            throw new Error(`Variables de entorno faltantes o inválidas: ${missingVars}`);
        }
        throw error;
    }
}; 