import { Request } from "../request";
import { Response } from "../response";

export const JSONParser =
  () =>
  (request: Request, response: Response): Promise<any> => {
    if (!request.hasHeader("content-type")) return;

    if (
      (request.getHeader("content-type") as string).startsWith(
        "application/json"
      )
    ) {
      request.body = JSON.parse(request.body.toString());
    }
  };
