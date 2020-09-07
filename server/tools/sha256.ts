import crypto from "crypto";

export const sha256 = (str: string, slat = "base-slat") => {
  const obj = crypto.createHash("sha256");
  obj.update(str + (slat ? slat : ""));

  return obj.digest("hex");
};

export const shaMd5 = (str: string, slat = "base-128") => {
  const obj = crypto.createHash("md5");
  obj.update(str + (slat ? slat : ""));

  return obj.digest("hex");
};

export const uuid = () => {
  return "u" + Date.now() + Math.random().toString();
};

export const mkToken = (str: string) => {
  return sha256(str, Date.now() + "");
};
