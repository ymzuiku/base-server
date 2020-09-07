import { fast } from "../tools/fast";

fast.GET("/hello", ({ body }) => {
  return { code: 200, data: body };
});
