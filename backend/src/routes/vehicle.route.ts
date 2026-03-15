import { Router } from "express";
import vehicleController from "../controllers/vehicle.controller";
import { uploadSingle } from "../middleware/multer";
const vehicleRouter = Router();

vehicleRouter.post("/entry",uploadSingle,vehicleController.vehicleEntry);

export default vehicleRouter;