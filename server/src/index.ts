import "reflect-metadata";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { UserResolver } from "./Userresolvers";
import { createConnection } from "typeorm";

// Asynchronous function to start express server and bind apolloServer to it
(async () => {
  const app = express();
  app.get("/", (_req, res) => res.send("Hello world"));

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
