import { Hono } from "hono";
import { requestId } from "hono/request-id";
import { notFound, onError } from "stoker/middlewares";

import { pinoLogger } from "@/middlewares/pino-logger";

import type { AppBindings } from "./types";


export default function createApp() {
  const app = new Hono<AppBindings>();
  app.use(requestId())
    .use(pinoLogger());

  app.notFound(notFound);
  app.onError(onError);
  return app;
}

