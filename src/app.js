import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { healthCheckRouter } from "./routes/healthcheck.route.js";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
    optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
  })
);

app.use(
  express.json({
    limit: "16kb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "16kb",
  })
);

app.use(express.static("public"));

app.use(cookieParser());

app.use("/api/v1/healthcheck", healthCheckRouter);

export { app };
