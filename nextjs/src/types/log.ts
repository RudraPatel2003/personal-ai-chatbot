import { BaseModel } from "./base-model";

export type Log = BaseModel & {
  title: string;
  description: string | null;
  createdBy: string;
};
