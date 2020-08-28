import { User } from "./entity/User";
import { sign } from "jsonwebtoken";

export const createToken = (user: User, expires: string, secret: string) => {
  return sign({ userId: user.id, tokenVersion: user.tokenVersion }, secret, {
    expiresIn: expires,
  });
};
