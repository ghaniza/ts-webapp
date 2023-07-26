import { IncomingMessage, ServerResponse } from "node:http";
import { Request } from "../request";
import { Response } from "../response";
import events from "../events";
import { print } from "../utils/print";
import { format } from "node:util";
import { NotFoundException } from "../exceptions/not-found.exception";
import { Server } from "../server";

type HandlerConfiguration = {
  middlewares: (
    | ((request: Request, response: Response) => Promise<void>)
    | Function
  )[];
  controllers: { new (...args: any[]): any }[];
  dependencies: ((...args: any[]) => Promise<any> | any)[];
};

export class Handler {
  private controllers: {
    new (...args: any[]): any;
    controllerName?: string;
  }[] = [];
  private dependencies: ((...args: any[]) => Promise<any> | any)[] = [];

  private incomingMessage: IncomingMessage;
  private serverResponse: ServerResponse;
  private routes: any[] = [];

  private request: Request;
  private response: Response;

  private readonly middlewares: (
    | ((request: Request, response: Response, server: Server) => Promise<void>)
    | Function
  )[] = [];

  constructor(
    config: HandlerConfiguration,
    private readonly _server: Server
  ) {
    this.middlewares = config.middlewares;
    this.controllers = config.controllers;
    this.dependencies = config.dependencies;
    this.request = new Request();
    this.response = new Response();

    Promise.all(
      this.middlewares.map(async (mw: any) => {
        if (mw.prototype) {
          const mwInstance = new mw();
          return mwInstance.use(this.request, this.response, this._server);
        }

        return mw(this.request, this.response, this._server);
      })
    ).then(() => {
      print("Server", "Global middlewares loaded");
    });

    this.resolveDependencies().then(() => {
      this.controllers.forEach(controller => {
        const start = process.hrtime();

        const c = new controller();
        print(
          controller.controllerName,
          format('Controller mapped to "%s"', c.path)
        );

        c.routes.forEach(r => {
          this.routes.push({
            arguments: r.arguments,
            statusCode: r.statusCode,
            name: r.name,
            method: r.method,
            handler: r.handler.bind(c),
            headers: r.headers,
            middlewares: [...c.middlewares, ...r.middlewares],
            path: c.path.length > 1 ? c.path + r.path : r.path,
          });
        });

        const end = process.hrtime(start);
        print(
          controller.controllerName,
          format(
            "%d routes discovered in %dms",
            c.routes.length,
            (end[1] / 100000).toFixed(2)
          )
        );
      });

      if (!events.emit("app_ready")) {
        process.stdout.write(
          "[Server]...........: Awaiting server to start..."
        );

        const t = setInterval(() => {
          process.stdout.write(".");
          if (events.emit("app_ready")) {
            clearInterval(t);
            process.stdout.write(" Done.\n");
          }
        }, 100);
      }
    });
  }

  public async configure(req: IncomingMessage, res: ServerResponse) {
    this.request.startTime = process.hrtime();

    this.incomingMessage = req;
    this.serverResponse = res;

    this.request.setMethod(req.method);
    this.request.setUrl(req.url);
    await this.registerMessage();
  }

  private async resolveDependencies() {
    print("Server", "Loading dependencies...");
    await Promise.all(this.dependencies.map(dp => dp()));
  }

  private async registerMessage() {
    return new Promise((resolve, reject) => {
      this.incomingMessage.on("data", data => {
        try {
          this.request.body = data;
        } catch (e) {
          reject(e);
        }
      });

      this.incomingMessage.on("close", async () => {
        try {
          this.request.headers = this.incomingMessage.headers;
          await this.finish();
          resolve(null);
        } catch (e) {
          reject(e);
        }
      });

      this.incomingMessage.on("error", e => {
        reject(e);
      });
    });
  }

  private async finish() {
    const { method } = this.incomingMessage;

    const route = this.routes.find(
      route => route.method === method && this.request.matchPattern(route.path)
    );

    if (!route) throw new NotFoundException();

    await Promise.all(
      route.middlewares.map(async (mw: any) => {
        if (mw.prototype) {
          const mwInstance = new mw();
          return mwInstance.use(this.request, this.response, this._server);
        }

        return mw(this.request, this.response, this._server);
      })
    );

    const args = this.loadArguments(route.arguments);

    this.response.status(route.statusCode);
    this.response.body = await route.handler(...args);
    return this.send();
  }

  private send() {
    const { body, statusCode, headers } = this.response;

    this.serverResponse.writeHead(statusCode, headers);
    this.serverResponse.end(body);

    this._server.events.emit("send");
  }

  private loadArguments(args: { type: string; [key: string]: any }[]) {
    return args.map(arg => {
      switch (arg.type) {
        case "body":
          return arg.property
            ? this.request.body[arg.property]
            : this.request.body;
        case "query":
          return arg.property
            ? this.request.query[arg.property]
            : this.request.query;
        case "params":
          return arg.property
            ? this.request.params[arg.property]
            : this.request.params;
        default:
          return null;
      }
    });

    // const response = [];
    // const max = args[args.length - 1].index;
    //
    // for (let i = 0; i <= max; i++) {
    //     const index = args.findIndex(o => o.index === i)
    //
    //     console.log({index})
    //
    //     if (index >= 0)
    //         response.push(parsed[index])
    //     else
    //         response.push("")
    // }
    //
    // return response
  }

  public use(
    handler:
      | ((request: Request, response: Response) => Promise<void>)
      | Function
  ) {
    this.middlewares.push(handler);
  }
}
