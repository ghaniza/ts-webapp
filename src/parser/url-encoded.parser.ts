import { Request } from "../request";
import { Response } from "../response";
import querystring from "node:querystring";

export const UrlEncodedParser =
  () =>
  (request: Request, response: Response): Promise<any> => {
    if (!request.hasHeader("content-type")) return;

    if (
      (request.getHeader("content-type") as string).startsWith(
        "application/x-www-form-urlencoded"
      )
    ) {
      request.body = querystring.parse(request.body.toString()) as any;
    }
  };
