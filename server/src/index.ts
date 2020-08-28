import "reflect-metadata";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { UserResolver } from "./Userresolvers";
import { createConnection } from "typeorm";
import cookieParser from "cookie-parser";
import { verify } from "jsonwebtoken";
import { User } from "./entity/User";
import { createToken } from "./auth";

// Asynchronous function to start express server and bind apolloServer to it
(async () => {
  const app = express();
  app.use(cookieParser());
  app.get("/", (_req, res) => res.send("Hello world"));

  app.post("/refresh_token", async (req, res) => {
    const token = req.cookies.jid;
    if (!token) {
      return res.send({ ok: false, accessToken: "" });
    }
    let payload: any = null;
    try {
      payload = verify(token, process.env.REFRESH_TOKEN_SECRET!);
    } catch (err) {
      console.error("Problem with parsing cooking JiD", err);
      return res.send({ ok: false, accessToken: "" });
    }

    const user = await User.findOne({ id: payload.userId });

    if (!user) {
      return res.send({ ok: false, accessToken: "" });
    }

    if (user.tokenVersion !== payload.tokenVersion) {
      return res.send({ ok: false, accessToken: "" });
    }

    // reload the refresh token
    res.cookie(
      "Jid",
      createToken(user, "7d", process.env.REFRESH_TOKEN_SECRET!),
      {
        httpOnly: true, // cannot have acces form js
      }
    );

    return res.send({
      ok: true,
      accessToken: createToken(user, "15m", process.env.ACCESS_TOKEN_SECRET!),
    });
  });

  // Create connection to datavase with typeorm
  await createConnection();

  // setting app apolloServer
  const apolloServer = new ApolloServer({
    // Using build schema for type script "type-grapgql"
    // In porpuse of not doubling the code because of types.
    schema: await buildSchema({
      resolvers: [UserResolver],
    }),
    context: ({ req, res }) => ({ req, res }),
  });

  // bind appoloServer to express server
  apolloServer.applyMiddleware({ app });

  // create connecting(start express server)
  app.listen(3000, () => {
    console.log("Server has started");
  });
})();
