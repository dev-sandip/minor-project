import { Router } from "express";
import vehicleController from "../controllers/vehicle.controller";
import { uploadSingle } from "../middleware/multer";
import { authMiddleware, requireRole } from "../middleware/auth";
const vehicleRouter = Router();

vehicleRouter.post("/entry",authMiddleware,requireRole("admin"),uploadSingle,vehicleController.vehicleEntry);
vehicleRouter.post("/exit",authMiddleware,requireRole("admin"),uploadSingle,vehicleController.vehicleExit);
vehicleRouter.get("/",vehicleController.getAllVehicles);
vehicleRouter.get("/:id",vehicleController.getVehicleById);
export default vehicleRouter;
