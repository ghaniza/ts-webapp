import { Controller } from "../../../lib/decorators/controller.decorator";
import { Get, Post } from "../../../lib/decorators/method.decorator";
import { Body } from "../../../lib/decorators/argument.decorator";

@Controller("/")
export class MyController {
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
