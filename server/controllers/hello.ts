import { fast } from "../tools/fast";

fast.GET("/hello", ({ body }) => {
  body.name = "dog";
  return { code: 200, data: body };
});
