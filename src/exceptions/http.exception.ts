export abstract class HttpException extends Error {
  protected constructor(
    public readonly httpStatus = 500,
    public readonly httpMessage = "Internal Server Error",
    public readonly httpContentType = "text/plain"
  ) {
    super();
  }
}

export class ExceptionInterceptor {}
