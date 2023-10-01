import {neo4jDriver} from "~/lib";

export default defineEventHandler(async (event) => {
    const session = neo4jDriver.session();
    try {
        await session.run('MATCH (n) RETURN n LIMIT 1');
        return 'Connection successful'
    } catch (error) {
        throw new Error('Connection to neo4j failed')
    } finally {
        await session.close();
    }
})
