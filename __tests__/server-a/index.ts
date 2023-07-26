import { loadEnv } from "../../lib/utils/load-env";
import { OtherController } from "./b/b.controller";
import { MyController } from "./a/a.controller";
import { JSONParser } from "../../lib/middlewares/json.parser";
import { UrlEncodedParser } from "../../lib/middlewares/urlencoded.parser";
import { MyDependency } from "./dependencies";
import { Server } from "../../src/server";

loadEnv();

const server = new Server({
  controllers: [MyController, OtherController],
  dependencies: [MyDependency.configure()],
  middlewares: [JSONParser(), UrlEncodedParser()],
});

setTimeout(() => {
  server.start();
}, 1000);
