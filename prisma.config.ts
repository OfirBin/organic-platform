import "dotenv/config";
import { defineConfig, env } from "@prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  engine: "classic", // This tells Prisma to use the standard local setup
  datasource: {
    url: env("DATABASE_URL"),
  },
});