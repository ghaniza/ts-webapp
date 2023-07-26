import { Request } from "../request";
import { Response } from "../response";

export const Middleware = (
  handlers: ((request: Request, response: Response) => Promise<void> | void)[]
) => {
  return (target: any, propertyKey: string) => {
    let routes = target.routes ?? [];
    let route = routes.find(r => r.name === propertyKey);

    if (!route) {
      route = {
        name: propertyKey,
        arguments: [],
        headers: {},
        middlewares: [],
      };
    } else {
      routes = routes.filter(r => r.name !== propertyKey);
    }

    route.middlewares = [...route.middlewares, ...handlers];

    Object.defineProperty(target, "routes", {
      configurable: true,
      get(): any {
        return [...routes, route];
      },
    });
  };
};
