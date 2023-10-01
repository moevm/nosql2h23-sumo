import {backupNodes, backupRelationships} from "~/lib/neo4j-backup";

export default defineEventHandler(async (event) => {
    try {

        const nodes = await backupNodes();
        const relations = await backupRelationships();

        return {nodes, relations}
    } catch (error) {
        throw new Error('Backup failed')
    }
})
