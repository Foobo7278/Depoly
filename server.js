import { createServer } from "node:http";
import { parse } from "node:url";
import { rmSync, existsSync } from "node:fs";
import { join } from "node:path";
import next from "next";

const dev = process.env.NODE_ENV !== "production";

if (dev) {
  const nextDir = join(process.cwd(), ".next");
  if (existsSync(nextDir)) {
    try {
      rmSync(nextDir, { recursive: true, force: true });
      console.log("> Drastically cleaned .next directory for development mode");
    } catch (e) {
      console.warn("> Failed to clean .next directory:", e);
    }
  }
}

const hostname = "0.0.0.0";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url || "", true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error("Error occurred handling", req.url, err);
      res.statusCode = 500;
      res.end("Internal Server Error");
    }
  })
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Server listening on port ${port}`);
    });
});
