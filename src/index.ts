import { loadEnv } from "./utils/load-env";
import { Server } from "./server";
import { Controller } from "./decorators/controller.decorator";
import { Get, Post } from "./decorators/method.decorator";
import { Body, Param, Query } from "./decorators/argument.decorator";
import { JSONParser } from "./parser/json.parser";
import { UrlEncodedParser } from "./parser/url-encoded.parser";
import { Logger } from "./middlewares/logger.middleware";
import { NotImplementedException } from "./exceptions/not-implemented.exception";

loadEnv();

class MyDependency {
  static configure() {
    return async () => {
      await new Promise((res, rej) => {
        setTimeout(() => {
          console.log("Dependency loaded");
          res(null);
        }, 500);
      });
    };
  }
}

@Controller("/")
class MyController {
  @Get("/")
  public firstMethod() {
    return { message: "this is a message from the first handler" };
  }

  @Post("/")
  public postMethod(@Body() body: any) {
    return body;
  }

  @Post("/another")
  public secondMethod(@Body() body: any) {
    return body;
  }
}

@Controller("/other")
class OtherController {
  @Get("/{param}")
  public method(@Param("param") p: string) {
    return { message: "this is a message from the other's handler: p=" + p };
  }

  @Get("/")
  public firstMethod() {
    throw new NotImplementedException();
  }

  @Post("/")
  public postMethod(@Body() body: any) {
    return body;
  }

  @Post("/{param}")
  public secondMethod(
    @Body() body: any,
    @Query("message") query: string[],
    @Param("param") param: any
  ) {
    return (
      "the param is " +
      JSON.stringify(param) +
      ", the body is " +
      JSON.stringify(body) +
      " and the query is " +
      query.join(" ")
    );
  }
}

const server = new Server({
  controllers: [MyController, OtherController],
  dependencies: [MyDependency.configure()],
  middlewares: [JSONParser(), UrlEncodedParser(), Logger],
});

server.start().catch(console.error);
