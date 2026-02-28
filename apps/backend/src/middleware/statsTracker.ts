import type { RequestHandler } from "express";
import { recordRequest } from "../lib/statsStore.js";

export const statsTrackerMiddleware: RequestHandler = (req, res, next) => {
  const start = process.hrtime.bigint();

  res.on("finish", () => {
    const end = process.hrtime.bigint();
    const durationMs = Number(end - start) / 1_000_000;

    const routePath = req.route?.path
      ? req.baseUrl + req.route.path
      : req.path;

    recordRequest(req.method, routePath, res.statusCode, durationMs);
  });

  next();
};
