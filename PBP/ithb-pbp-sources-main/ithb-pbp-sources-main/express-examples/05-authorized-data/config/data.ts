import { v4 } from "uuid";

export type User = {
  id: string;
  username: string;
  password: string;
};

export const users: User[] = [
  {
    id: v4(),
    username: "admin",
    password: "admin",
  },
];
