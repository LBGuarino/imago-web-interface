import { Request, Response, NextFunction, RequestHandler } from 'express';
import { AppError } from './errorHandler';
import { logger } from '../utils/logger';
import multer from 'multer';
import { User } from '../entities/User';

type RequestWithUser = Request & {
    user?: User;
};

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
const ALLOWED_MIME_TYPES = ['application/dicom', 'application/octet-stream'];

const storage = multer.memoryStorage();

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        cb(new AppError('Tipo de archivo no permitido. Solo se permiten archivos DICOM.', 400));
        return;
    }

    if (file.size > MAX_FILE_SIZE) {
        cb(new AppError('Archivo demasiado grande. El tamaño máximo permitido es 100MB.', 400));
        return;
    }

    // Sanitizar el nombre del archivo
    const sanitizedFilename = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    file.originalname = sanitizedFilename;

    cb(null, true);
};

export const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: MAX_FILE_SIZE,
    },
});

export const validateDicomFiles: RequestHandler = (req, res, next) => {
    if (!req.files || Object.keys(req.files).length === 0) {
        throw new AppError('No se han proporcionado archivos DICOM.', 400);
    }

    // Validar que los archivos requeridos estén presentes
    const requiredViews = ['view1', 'view2', 'view3', 'view4'];
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const missingViews = requiredViews.filter(view => !files[view]);

    if (missingViews.length > 0) {
        throw new AppError(
            `Faltan vistas requeridas: ${missingViews.join(', ')}`,
            400
        );
    }

    // Registrar la carga de archivos
    logger.info({
        message: 'Archivos DICOM validados correctamente',
        files: Object.keys(req.files),
        userId: (req.user as User)?.id,
    });

    next();
}; 