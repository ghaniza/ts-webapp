import { Request } from "../request";
import { Response } from "../response";

export type ControllerOptions = {
  middlewares?: ((
    request: Request,
    response: Response
  ) => Promise<any> | any)[];
  guards?: any[];
};

export const Controller = (path: string, options?: ControllerOptions) => {
  return <T extends { new (...args: any[]): any }>(constructor: T) => {
    return class ControllerClass extends constructor {
      static controllerName = constructor.name;
      path = path;
      middlewares = options?.middlewares ?? [];
    };
  };
};
