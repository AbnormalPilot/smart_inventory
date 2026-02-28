import { Router } from "express";
import healthRouter from "./health.js";
import productsRouter from "./products.js";
import salesRouter from "./sales.js";
import analyticsRouter from "./analytics.js";
import aiRouter from "./ai.js";
import demandRouter from "./demand.js";

const router = Router();

router.use(healthRouter);
router.use(productsRouter);
router.use(salesRouter);
router.use(analyticsRouter);
router.use(aiRouter);
router.use(demandRouter);

export default router;
