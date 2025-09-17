import createApp from "@/lib/create-app";

const app = createApp();

const routes = [] as const;

routes.forEach((route) => {
  app.route("/", route);
});

export type AppType = typeof routes[number];

export default app;