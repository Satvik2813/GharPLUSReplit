import { Router, type IRouter } from "express";
import healthRouter from "./health";
import gharplusRouter from "./gharplus";

const router: IRouter = Router();

router.use(healthRouter);
router.use(gharplusRouter);

export default router;
