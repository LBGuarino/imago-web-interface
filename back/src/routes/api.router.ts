import { Router } from "express";
import deidentifyDICOMController from "../controllers/deidentifier.controller";
import uploadDicomController from "../controllers/upload_dicom.controller";
import sessionLoginController, {
  checkAttributesController,
  getLocalUserController,
  getUserController,
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
import { paginationMiddleware } from "../middlewares/pagination";
import { validateDicomFiles, upload } from "../middlewares/validateDicomFile";
import searchStudiesController from "../controllers/search_studies.controller";
import { auditLog } from "../middlewares/auditLog";
import { logSecurityEventController } from '../controllers/security.controller';

const apiRouter = Router();

// Aplicar auditoría a todas las rutas
apiRouter.use(auditLog);

// Rutas de autenticación
apiRouter.post("/login", sessionLoginController);
apiRouter.post("/logout", logoutController);
apiRouter.post("/refresh-session", refreshSessionController);
apiRouter.get("/check-attributes", checkAttributesController);

// Rutas protegidas que requieren aprobación
apiRouter.use(checkApprovedMiddleware);

// Rutas de estudios DICOM
apiRouter.post(
  "/upload",
  upload.fields([
    { name: "view1", maxCount: 1 },
    { name: "view2", maxCount: 1 },
    { name: "view3", maxCount: 1 },
    { name: "view4", maxCount: 1 },
    { name: "tomo", maxCount: 1 },
  ]),
  validateDicomFiles,
  uploadDicomController
);

apiRouter.post("/account", getUserController);
apiRouter.post("/local-user", getLocalUserController);
apiRouter.post("/search-studies", searchStudiesController);
apiRouter.post("/deidentify", deidentifyDICOMController);

// Rutas de administración
apiRouter.use(checkAdminMiddleware);
apiRouter.post("/assign-admin", assignAdminRoleController);
apiRouter.post("/users/register", localRegisterController);
apiRouter.post("/verify-admin", verifyAdminController);
apiRouter.get("/users", paginationMiddleware, getUsersController);
apiRouter.post("/users/approve", approveUserController);
apiRouter.delete("/users/:uid", deleteUserController);

// Rutas de seguridad
apiRouter.post("/security-logs", logSecurityEventController);

export default apiRouter;
