import { DB_PATH, ensureDatabase } from "@/db";

ensureDatabase();

console.log(`[db] schema ready at ${DB_PATH}`);
