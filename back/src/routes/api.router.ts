import { Router } from "express";
import deidentifyDICOMController from "../controllers/deidentifier.controller";
import multer from "multer";
import uploadDicomController from "../controllers/upload_dicom.controller";
import sessionLoginController, { refreshSessionController } from "../controllers/auth.controller";
import { checkAdminMiddleware } from "../middlewares/checkAdminMiddleware";
import { assignAdminRoleController } from "../controllers/assignAdmin.controller";
import { checkApprovedMiddleware } from "../middlewares/checkApprovedMiddleware";
import { logoutController } from "../controllers/logout.controller";
import { approveUserController, deleteUserController, getUsersController, localRegisterController } from "../controllers/users.controller";
import { verifyAdminController } from "../controllers/verifyAdmin.controller";

interface UserData {
    uid: string;
    email?: string;
    admin?: boolean;
    approved?: boolean;
}

const upload = multer({ storage: multer.memoryStorage() });
const uploadFields = upload.fields([
    { name: "view1", maxCount: 1 },
    { name: "view2", maxCount: 1 },
    { name: "view3", maxCount: 1 },
    { name: "view4", maxCount: 1 },
    { name: "tomo", maxCount: 1 },
])
const apiRouter = Router()


apiRouter.post("/upload-dicom", checkApprovedMiddleware ,uploadFields, uploadDicomController)

apiRouter.post('/deidentify', checkApprovedMiddleware, deidentifyDICOMController);

apiRouter.post("/sessionLogin", sessionLoginController);

apiRouter.post("/assignAdmin", checkAdminMiddleware, assignAdminRoleController);

apiRouter.post("/logout", logoutController);

apiRouter.get("/users", checkAdminMiddleware, getUsersController);

apiRouter.post("/approveUser", checkAdminMiddleware, approveUserController);

apiRouter.get("/verify_admin", checkAdminMiddleware, verifyAdminController, (req, res) => {
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
            approved: user.approved
        }
    })
});

apiRouter.post("/refresh-session", refreshSessionController);

apiRouter.post("/deleteUser", checkAdminMiddleware, deleteUserController);

apiRouter.post("/register", localRegisterController);




export default apiRouter;