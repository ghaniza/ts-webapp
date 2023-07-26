export class MyDependency {
  static configure() {
    return async () => {
      await new Promise((res, rej) => {
        setTimeout(() => {
          console.log("ok");
          res(null);
        }, 500);
      });
    };
  }
}
