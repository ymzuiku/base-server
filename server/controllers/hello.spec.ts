import "./hello";
import { fast } from "../tools/fast";

test("hello", async () => {
  const service = fast.ServiceGET["/hello"];
  const back = await service({ body: { name: "dog" } });
  expect(back.data.name).toEqual("dog");
});
