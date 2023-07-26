import fs from "node:fs";

export const loadEnv = () => {
  try {
    const file = fs.readFileSync(".env");
    if (!file) return;

    const contents = file.toString("utf-8");

    const lines = contents.split(/\n/g);

    lines.forEach(line => {
      if (!line || line.startsWith("#")) return;

      let [key, value] = line.split("=");

      if (value.startsWith(`"`) || value.startsWith(`'`))
        value = value.substring(1, value.length - 1);

      process.env[key] = value;
    });
  } catch (e) {}
};
