import { HttpException } from "./http.exception";

export class NotImplementedException extends HttpException {
  constructor(httpMessage = "Not Implemented", httpContentType?: string) {
    super(501, httpMessage, httpContentType);
  }
}
