import { Request } from "../request";
import { Response } from "../response";
import { Server } from "../server";

export abstract class Middleware {
  public abstract use(
    request: Request,
    response: Response,
    server: Server
  ): Promise<any> | void;
}
