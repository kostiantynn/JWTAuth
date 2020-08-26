import { Resolver, Query, Mutation, Arg } from "type-graphql";
import { hash } from "bcryptjs";
import { User } from "./entity/User";

// Creating resolvers for user table in db for graphQL

@Resolver()
export class UserResolver {
  @Query(() => String)
  hello() {
    return "Hello world!";
  }

  // Making query for listing all users in the database in order to check if
  // our mutation is right from graphQL playground and not be bothered with pgql cli
  @Query(() => [User])
  users() {
    return User.find();
  }

  // Register function, create user instance to db
  @Mutation(() => Boolean)
  async register(
    @Arg("email", () => String) email: string,
    @Arg("password", () => String) password: string
  ) {
    const hashedPassword = await hash(password, 12);
    try {
      await User.insert({
        email: email,
        password: hashedPassword,
      });
    } catch (err) {
      console.error("Error when insertin new user to db", err);
      return false;
    }
    return true;
  }
}
