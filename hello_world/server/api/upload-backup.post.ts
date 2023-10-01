import { restoreDatabase } from "~/lib/neo4j-restore";

export default defineEventHandler(async (event) => {
    try {
        const data = await readBody(event)
        await restoreDatabase(data);
        return { message: "Database restored successfully" };
    } catch (error) {
        throw new Error('Restore failed');
    }
})
