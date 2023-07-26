import { HttpException } from "./http.exception";

export class NotFoundException extends HttpException {
  constructor(httpMessage = "Not found", httpContentType?: string) {
    super(404, httpMessage, httpContentType);
  }
}
