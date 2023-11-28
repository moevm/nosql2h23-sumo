import xml2js from "xml2js";
import { neo4jDriver } from './neo4j';
function generateRandomId() {
    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let id = '';

    for (let i = 0; i < 5; i++) {
        let randomIndex = Math.floor(Math.random() * characters.length);
        id += characters.charAt(randomIndex);
    }

    return id;
}

let driver = neo4jDriver;
export async function importExperiment(data: { nodes: string; edges: string, experimentName: string}){
    await parseXMLAndCreateNodes(atob(data.nodes), data.experimentName, (new Date()).toLocaleDateString(), generateRandomId());
    await parseXMLAndCreateEdges(atob(data.edges), data.experimentName, (new Date()).toLocaleDateString());
}
async function parseXMLAndCreateNodes(xml: string, experimentName: string, date: string, experimentId: string) {
    const parser = new xml2js.Parser();
    const jsonData = await parser.parseStringPromise(xml);

    const session = driver.session();

    try {
        const nodes = jsonData.nodes.node;

        for (const node of nodes) {
            const nodeId = node.$.id;
            const x = parseFloat(node.$.x);
            const y = parseFloat(node.$.y);
            const type = node.$.type;

            const result = await session.run(
                'CREATE (n:Node {id: $id, x: $x, y: $y, type: $type, experimentName: $experimentName, date: $date, experimentId: $experimentId}) RETURN n',
                { id: nodeId, x, y, type, experimentName, date, experimentId }
            );

            // console.log(`Created node: ${result.records[0].get('n').properties.id}`);
        }
    } catch (error) {
        console.error('Error creating nodes in Neo4j:', error);
    } finally {
        await session.close();
    }
}

async function parseXMLAndCreateEdges(xml: string, experimentName: string, date: string) {
    const parser = new xml2js.Parser();
    const jsonData = await parser.parseStringPromise(xml);

    const session = driver.session();

    try {
        const edges = jsonData.edges.edge;

        for (const edge of edges) {
            const edgeId = edge.$.id;
            const from = edge.$.from; // node param "id"
            const to = edge.$.to; // node param "id"
            const priority = parseInt(edge.$.priority);
            const numLanes = parseInt(edge.$.numLanes);
            const speed = parseFloat(edge.$.speed);

            const result = await session.run(`
                MATCH (fromNode:Node {id: $from})
                MATCH (toNode:Node {id: $to})
                CREATE (fromNode)-[e:EDGE {
                    id: $edgeId,
                    priority: $priority,
                    numLanes: $numLanes,
                    speed: $speed
                }]->(toNode)
                RETURN e
            `, { from, to, edgeId, priority, numLanes, speed });

            // console.log(`Created edge: ${result.records[0].get('e').properties.id}`);
        }
    } catch (error) {
        console.error('Error creating edges in Neo4j:', error);
    } finally {
        await session.close();
    }
}

export async function retrieveExperiments(page: number, pageSize: number) {
    const session = driver.session();

    try {
        const result = await session.run(
            'MATCH (n:Node) RETURN DISTINCT n.experimentName AS experimentName, n.date AS date, n.experimentId as id SKIP TOINTEGER($skip) LIMIT TOINTEGER($limit)',
            { skip: (page - 1) * pageSize, limit: pageSize }
        );

        const experiments = result.records.map(record => {
            return {
                experimentName: record.get('experimentName'),
                id: record.get('id'),
                date: record.get('date')
            };
        });

        const totalCount = await session.run(
            'MATCH (n:Node) RETURN COUNT(DISTINCT n.experimentId) AS totalCount'
        );
        const totalExperiments = totalCount.records[0].get('totalCount').low;

        return { experiments, totalExperiments };
    } catch (error) {
        console.error('Error retrieving experiments from Neo4j:', error);
        return { experiments: [], totalExperiments: 0 };
    } finally {
        await session.close();
    }
}
