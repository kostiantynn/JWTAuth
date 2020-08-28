import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from "typeorm";
import { ObjectType, Field, Int } from "type-graphql";

// Using ORM to create a simple user for authentication

// Explicitly specifying object type from graphql, for
// user-list query in UserResolvers. when specifying type "[User]"
@ObjectType()
@Entity("users")
export class User extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column("text")
  email: string;

  @Column("text") // Didn't select password as a field here, in order to provide security, but I don't mind showing password hash here :)
  password: string;

  @Column("int", { default: 0 })
  tokenVersion: number;
}
