import { Router } from "express";
import deidentifyDICOMController from "../controllers/deidentifier.controller";
import multer from "multer";
import uploadDicomController from "../controllers/upload_dicom.controller";
import sessionLoginController, {
  checkAttributesController,
  getLocalUserController,
  refreshSessionController,
} from "../controllers/auth.controller";
import { checkAdminMiddleware } from "../middlewares/checkAdminMiddleware";
import { assignAdminRoleController } from "../controllers/assignAdmin.controller";
import { checkApprovedMiddleware } from "../middlewares/checkApprovedMiddleware";
import { logoutController } from "../controllers/logout.controller";
import {
  approveUserController,
  deleteUserController,
  getUsersController,
  localRegisterController,
} from "../controllers/users.controller";
import { verifyAdminController } from "../controllers/verifyAdmin.controller";
import rateLimit from "express-rate-limit";
import { paginationMiddleware } from "../middlewares/pagination";

interface UserData {
  uid: string;
  email?: string;
  admin?: boolean;
  approved?: boolean;
}

// Rate limiting para endpoints sensibles
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // Límite por IP
  standardHeaders: true,
  legacyHeaders: false,
});

const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE || "10485760") },
});

const uploadFields = upload.fields([
  { name: "view1", maxCount: 1 },
  { name: "view2", maxCount: 1 },
  { name: "view3", maxCount: 1 },
  { name: "view4", maxCount: 1 },
  { name: "tomo", maxCount: 1 },
]);

const apiRouter = Router();

apiRouter.post("/sessionLogin", authLimiter, sessionLoginController);

apiRouter.post("/refresh-session", refreshSessionController);

apiRouter.post(
  "/upload-dicom",
  checkApprovedMiddleware,
  uploadFields,
  uploadDicomController
);

apiRouter.post(
  "/deidentify",
  checkApprovedMiddleware,
  deidentifyDICOMController
);

apiRouter.post("/assignAdmin", checkAdminMiddleware, assignAdminRoleController);

apiRouter.post("/logout", logoutController);

apiRouter.get(
  "/users",
  checkAdminMiddleware,
  paginationMiddleware,
  getUsersController
);

apiRouter.post("/approveUser", checkAdminMiddleware, approveUserController);

apiRouter.post("/local_userdata", getLocalUserController);

apiRouter.post("/check_attributes", checkAttributesController);

apiRouter.post(
  "/verify_admin",
  checkAdminMiddleware,
  verifyAdminController,
  (req, res) => {
    if (!req.user) {
      res.status(401).json({ error: "No autenticado" });
      return;
    }
    const user = req.user as UserData;
    res.json({
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        admin: user.admin,
        approved: user.approved,
      },
    });
  }
);

apiRouter.post("/deleteUser", checkAdminMiddleware, deleteUserController);

apiRouter.post(
  "/register",
  registerLimiter,
  checkAdminMiddleware,
  localRegisterController
);

apiRouter.post("/test", async (req, res) => {
  setTimeout(() => {
    res.json({ success: true, message: "Test" });
  }, 5000);
});

export default apiRouter;
