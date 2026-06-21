import { Tenant } from "@notifyflow/db";

declare global {
  namespace Express {
    interface Request {
      tenant?: Tenant;
    }
  }
}
export {};
