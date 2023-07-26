const RequestMethod = (method: string, path: string, statusCode = 200) => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
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

    route.path = path;
    route.method = method;
    route.handler = descriptor.value;
    route.statusCode = statusCode;

    Object.defineProperty(target, "routes", {
      configurable: true,
      get(): any {
        return [...routes, route];
      },
    });
  };
};
export const Get = (path: string) => RequestMethod("GET", path);
export const Post = (path: string) => RequestMethod("POST", path, 201);
export const Put = (path: string) => RequestMethod("PUT", path, 201);
export const Patch = (path: string) => RequestMethod("PATCH", path, 201);
export const Options = (path: string) => RequestMethod("OPTIONS", path, 204);
export const Head = (path: string) => RequestMethod("HEAD", path);
export const Delete = (path: string) => RequestMethod("DELETE", path);
export const Trace = (path: string) => RequestMethod("TRACE", path);
