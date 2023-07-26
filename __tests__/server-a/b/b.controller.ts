import { Controller } from "../../../lib/decorators/controller.decorator";
import { Get, Post } from "../../../lib/decorators/method.decorator";
import { Body, Param, Query } from "../../../lib/decorators/argument.decorator";

@Controller("/other")
export class OtherController {
  @Get("/")
  public firstMethod() {
    return { message: "this is a message from the first handler" };
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
