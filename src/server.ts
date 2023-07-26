import http from "node:http";
import { format } from "node:util";
import { Handler } from "./handler";
import { Request } from "./request";
import { Response } from "./response";
import events from "./events";
import { print } from "./utils/print";
import { HttpException } from "./exceptions/http.exception";
import EventEmitter from "node:events";

export type ServerConfig = {
  middlewares: (
    | ((request: Request, response: Response) => Promise<any>)
    | Function
  )[];
  controllers: { new (...args: any[]): any }[];
  dependencies: ((...args: any[]) => Promise<void> | void)[];
};

export class Server {
  private app: http.Server;
  private handler: Handler;
  public readonly events = new EventEmitter();

  constructor(config: ServerConfig) {
    this.handler = new Handler(config, this);

    const handlerWrapper = async (
      req: http.IncomingMessage,
      res: http.ServerResponse
    ) => {
      try {
        await this.handler.configure(req, res);
      } catch (e) {
        this.errorHandler(e, req, res);
      }
    };

    this.app = http.createServer(handlerWrapper);
    this.checkPort(+process.env.PORT).then(port => {
      console.log({ port });
      return this.start(port);
    });
    //    this.initServerErrorHandler();
  }

  private errorHandler(
    error: HttpException,
    req: http.IncomingMessage,
    res: http.ServerResponse
  ) {
    res.writeHead(error.httpStatus ?? 500, {
      "Content-Type": error.httpContentType ?? "text/plain",
    });
    res.end(error.httpMessage ?? "Internal error");
    this.events.emit("http-exception", error);
  }

  public async start(port?: string | number) {
    return new Promise((resolve, reject) => {
      events.on("app_ready", () => {
        console.log("app_Ready " + port);
        !this.app.listening &&
          this.app.listen(port, () => {
            const ip = this.app.address();
            const host = typeof ip === "string" ? ip : ip.address;

            print("Server", format("Started at %s:%d", host, port));

            resolve(null);
          });
      });
    });
  }

  private checkPort(port: number): Promise<number> {
    return new Promise(async resolve => {
      let resolved = false;
      let newPort = port;

      while (!resolved || port > 5000) {
        try {
          const tmp = http.createServer();
          tmp.listen(newPort);
          await new Promise(res => tmp.close(res));
          tmp.unref();

          if (port !== newPort) {
            process.stdout.write(
              format(
                "\x1b[33mThe address is already in user, do you want to use %d instead?\x1b[0m [Y/n]: ",
                newPort
              )
            );

            const socket = process.openStdin();

            await new Promise(resolve =>
              socket.on("data", async data => {
                const response = data.toString().toLowerCase().trim();

                if (response.startsWith("n")) process.exit(1);
                else {
                  resolved = true;
                  resolve(newPort);
                }

                socket.end();
              })
            );
          }

          resolved = true;
          resolve(newPort);
        } catch (e) {
          if (e.code === "EADDRINUSE") newPort += 1;
        }
      }
    });
  }

  private initServerErrorHandler() {
    const errorListener = (e: any) => {
      if (e.code === "EADDRINUSE") {
        const newPort = Number(process.env.PORT) + 100;

        process.stdout.write(
          format(
            "\x1b[33mThe address is already in user, do you want to use %d instead?\x1b[0m [Y/n]: ",
            newPort
          )
        );

        const socket = process.openStdin();
        socket.on("data", async data => {
          const response = data.toString().toLowerCase().trim();

          console.log({ response });
          if (response.startsWith("n")) process.exit(1);
          else await this.start(newPort);

          socket.end();
        });
      }
    };

    this.app.on("error", errorListener);
  }
}
