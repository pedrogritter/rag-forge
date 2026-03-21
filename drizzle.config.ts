import { type Config } from "drizzle-kit";

export default {
  schema: "./src/server/db/schema",
  out: "./supabase/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.POSTGRES_URL!,
  },
  tablesFilter: ["ragforge_*"],
} satisfies Config;
