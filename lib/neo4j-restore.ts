import { Session } from 'neo4j-driver';
import { neo4jDriver } from './neo4j';

let driver = neo4jDriver;

export async function restoreDatabase(data: {nodes: any, relations: any}): Promise<void> {
    let session: Session = driver.session();

    try {
        // Delete all existing nodes and relationships
        await session.run('MATCH (n) DETACH DELETE n');

        // Create nodes
        for (let node of data.nodes) {
            let labels = node.labels.join(':');
            let query = `CREATE (n:${labels} $properties) RETURN n`;
            await session.run(query, {properties: node.properties});
        }

        // Create relationships
        for (let relation of data.relations) {
            let query = `
            MATCH (a:${relation.startNode.labels.join(':')}), (b:${relation.endNode.labels.join(':')})
            WHERE a.name = $startNodeName AND b.name = $endNodeName
            CREATE (a)-[:${relation.relationship.type} $properties]->(b)
            `;

            await session.run(query, {
                startNodeName: relation.startNode.properties.name,
                endNodeName: relation.endNode.properties.name,
                properties: relation.relationship.properties
            });
        }
    } catch (error) {
        console.log(error);
    } finally {
        session.close();
    }
}
