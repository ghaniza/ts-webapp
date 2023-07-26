import querystring from "node:querystring";

export class Request {
  public body: any;
  public headers: { [key: string]: string | string[] } = {};
  public startTime = process.hrtime();
  public method: string;
  public url: string;
  public params: any = {};
  public query: any = {};

  public matchPattern(path: string): boolean {
    const template = path.split("/").filter(p => !!p);
    const paths = this.url.split("/").filter(p => !!p);

    if (template.length !== paths.length) return false;

    const results = [];

    for (let i = 0; i < template.length; i++) {
      const p = template[i];

      if (p === paths[i]) {
        results.push({ path: p, value: p, injected: false });
      } else if (/{.*}/g.test(p)) {
        results.push({
          path: p.substring(1, p.length - 1),
          value: paths[i],
          injected: true,
        });
      } else {
        return false;
      }
    }

    const match = results.every(
      p =>
        !!p &&
        ((p.path === p.value && !p.injected) ||
          (p.path !== p.value && p.injected))
    );

    if (match)
      results.forEach(r => {
        if (r.injected) this.params[r.path] = r.value;
      });

    return match;
  }

  public setMethod(method: string) {
    this.method = method;
  }

  public setUrl(url: string) {
    let qs;

    if ((qs = url.split("?")).length > 1) {
      this.query = querystring.parse(qs[1]);
      this.url = qs[0];
    } else {
      this.url = url;
    }
  }

  public hasHeader(headerName: string): boolean {
    return Object.keys(this.headers)
      .map(k => k.toLowerCase())
      .includes(headerName.toLowerCase());
  }

  public getHeader(headerName: string): string | string[] {
    return Object.entries(this.headers).find(
      ([k, v]) => k.toLowerCase() === headerName.toLowerCase()
    )?.[1];
  }
}
