import { type Config } from "drizzle-kit";

import { env } from "@/env";

// export default {
//   schema: "./src/server/db/schema.ts",
//   dialect: "postgresql",
//   dbCredentials: {
//     url: env.POSTGRES_URL,
//   },
//   tablesFilter: ["rag-forge_*"],
// } satisfies Config;

export default {
  schema: "./src/server/db/schema.ts",
  out: "./supabase/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.POSTGRES_URL!,
  },
  tablesFilter: ["rag-forge_*"],
} satisfies Config;
