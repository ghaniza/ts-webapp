const ArgumentDecorator = (type: string, payload: { [key: string]: any }) => {
  return (target: any, propertyKey: string, index: number) => {
    let routes = target.routes ?? [];
    let route = routes.find(r => r.name === propertyKey);

    if (!route) {
      route = {
        name: propertyKey,
        arguments: [],
        middlewares: [],
        headers: {},
      };
    } else {
      routes = routes.filter(r => r.name !== propertyKey);
    }

    const argument = {
      type,
      index,
      ...payload,
    };

    route.arguments = [argument, ...route.arguments];

    Object.defineProperty(target, "routes", {
      configurable: true,
      get(): any {
        return [...routes, route];
      },
    });
  };
};

export const Body = (property?: string) =>
  ArgumentDecorator("body", { property });
export const Param = (property?: string) =>
  ArgumentDecorator("params", { property });
export const Query = (property?: string) =>
  ArgumentDecorator("query", { property });
