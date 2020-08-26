import {
  Resolver,
  Query,
  Mutation,
  Arg,
  ObjectType,
  Field,
  Ctx,
} from "type-graphql";
import { hash, compare } from "bcryptjs";
import { User } from "./entity/User";
import { sign } from "jsonwebtoken";
import { MyContext } from "./MyContex";

// Type GraphQL field
@ObjectType()
class AccessTokenResponse {
  @Field()
  accessToken: string;
}

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

  @Mutation(() => AccessTokenResponse)
  async login(
    @Arg("email", () => String) email: string,
    @Arg("password", () => String) password: string,
    @Ctx() { res }: MyContext // Generate context for creating and storing refresh token in cookie
  ): Promise<AccessTokenResponse> {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new Error("Could not find user in db.");
    }
    const validPasswd = await compare(password, user.password);
    if (!validPasswd) {
      throw new Error("Password is not valid for user: " + user.email);
    }
    // Refresh token
    res.cookie(
      "Jid",
      sign({ userId: user.id }, "wedfghjhgfdxcvb", {
        expiresIn: "7d",
      }),
      {
        httpOnly: true, // cannot have acces form js
      }
    );

    return {
      accessToken: sign({ userId: user.id }, "aasjdufnwjenyi", {
        expiresIn: "15m",
      }),
    };
  }
}
