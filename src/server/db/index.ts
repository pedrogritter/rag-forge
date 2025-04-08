import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

// import * as schema from "./schema";
// const allPosts = await db.select().from(posts);

const client = postgres(process.env.POSTGRES_URL!);
export const db = drizzle({ client });
