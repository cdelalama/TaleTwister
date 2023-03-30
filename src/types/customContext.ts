import { Context } from "grammy";
import { UserState } from "./userState";

export interface CustomContext extends Context {
  userStates: Map<number, UserState>;
}
