import querystring from "node:querystring";

export class Response {
  public _statusCode = 200;
  public _headers: { [key: string]: string | string[] } = {};
  public _body: Buffer | string | { [key: string]: any };

  get headers() {
    return this._headers;
  }

  set headers(headers: { [key: string]: string | string[] }) {
    this._headers = headers;
  }

  get statusCode() {
    return this._statusCode;
  }

  get body(): Buffer | string | { [key: string]: any } {
    if (this._body instanceof Buffer) {
      this._headers["Content-Length"] = Buffer.byteLength(this._body).toString(
        10
      );
      return this._body;
    }

    if (typeof this._body === "string") {
      this._headers["Content-Type"] = "text/html";
      this._headers["Content-Length"] = Buffer.byteLength(this._body).toString(
        10
      );
      return this._body;
    }

    try {
      const body = JSON.stringify(this._body);
      this._headers["Content-Type"] = "application/json";
      this._headers["Content-Length"] = Buffer.byteLength(body).toString(10);
      return body;
    } catch (e) {}

    try {
      const body = querystring.stringify(this._body as any);
      this._headers["Content-Type"] = "application/x-www-form-urlencoded";
      this._headers["Content-Length"] = Buffer.byteLength(body).toString(10);
      return body;
    } catch (e) {}

    return this._body;
  }

  set body(body: Buffer | string | { [key: string]: any }) {
    this._body = body;
  }

  public status(statusCode: number) {
    this._statusCode = statusCode;
    return this;
  }
}
