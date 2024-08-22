import { Router } from "express";
import { regesterUser } from "../controllers/user.controllers.js";

const router = Router()

router.route("/register").post(regesterUser)

export default router;