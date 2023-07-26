import { Request } from "../request";
import { Response } from "../response";
import { Middleware } from "./";
import { print } from "../utils/print";
import { format } from "node:util";
import { color } from "../utils/std-color";
import { Server } from "../server";

export class Logger extends Middleware {
  public async use(request: Request, response: Response, server: Server) {
    server.events.on("send", () => {
      print(
        "Logger",
        color(
          format(
            '%s "%s": %d -- %dms',
            request.method,
            request.url,
            response.statusCode,
            (process.hrtime(request.startTime)[1] / 1_000_000).toFixed(2)
          ),
          ["cyan"]
        )
      );
    });

    server.events.on("http-exception", e => {
      const httpStatus = e.httpStatus ?? 500;

      print(
        "Logger",
        color(
          format(
            '%s "%s": %d -- %dms',
            request.method,
            request.url,
            httpStatus,
            (process.hrtime(request.startTime)[1] / 1_000_000).toFixed(2)
          ),
          [httpStatus >= 500 ? "red" : "yellow"]
        )
      );
    });
  }
}
