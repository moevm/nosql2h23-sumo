import { Session } from 'neo4j-driver';
import { neo4jDriver } from './neo4j';

let driver = neo4jDriver;

export async function restoreDatabase(data: {nodes: any, relations: any}): Promise<void> {
    const session: Session = driver.session();

    try {
        await session.run('MATCH (n) DETACH DELETE n');

        const nodeMappings: Record<number, any> = {};

        for (let node of data.nodes) {
            const labels = node.labels.join(':');
            const createNodeQuery = `CREATE (n:${labels} $properties) RETURN id(n) AS id`;
            const result = await session.run(createNodeQuery, {properties: node.properties});
            nodeMappings[node.identity] = result.records[0].get('id');
        }

        for (let relation of data.relations) {
            if (!relation.startNode || !relation.endNode) {
                console.error('Invalid relation object: missing startNode or endNode');
                continue;
            }

            const createRelationQuery = `
                MATCH (a)
                WHERE id(a) = $startNodeIdentity
                MATCH (b)
                WHERE id(b) = $endNodeIdentity
                CREATE (a)-[:${relation.relationship.type} $properties]->(b)
            `;

            await session.run(createRelationQuery, {
                startNodeIdentity: nodeMappings[relation.startNode.identity],
                endNodeIdentity: nodeMappings[relation.endNode.identity],
                properties: relation.relationship.properties,
            });
        }
    } catch (error) {
        console.error(error);
    } finally {
        session.close();
    }
}

