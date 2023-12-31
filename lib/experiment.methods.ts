import xml2js from "xml2js";
import { neo4jDriver } from './neo4j';
import { SoundTwoTone } from "#build/components";
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
    const id = generateRandomId();
    await parseXMLAndCreateNodes(atob(data.nodes), data.experimentName, (new Date()).toISOString().slice(0,10), id);
    await parseXMLAndCreateEdges(atob(data.edges), data.experimentName, id);
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

async function parseXMLAndCreateEdges(xml: string, experimentName: string, experimentId: string) {
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
                MATCH (fromNode:Node {id: $from, experimentId: $experimentId})
                MATCH (toNode:Node {id: $to, experimentId: $experimentId})
                CREATE (fromNode)-[e:EDGE {
                    id: $edgeId,
                    priority: $priority,
                    numLanes: $numLanes,
                    speed: $speed
                }]->(toNode)
                RETURN e
            `, { from, to, edgeId, priority, numLanes, speed, experimentId });

            // console.log(`Created edge: ${result.records[0].get('e').properties.id}`);
        }
    } catch (error) {
        console.error('Error creating edges in Neo4j:', error);
    } finally {
        await session.close();
    }
}
export async function retrieveExperiments(page: number, pageSize: number,
                                          experimentName?: string,
                                          experimentId?: string,
                                          startDate?: string, endDate?: string, 
                                          minNodes?: string, maxNodes?: string,
                                          minEdges?: string, maxEdges?: string) {
    const session = driver.session();
    
    try {
        let query = 'MATCH (n:Node)';
        let countQuery = 'MATCH (n:Node)';
        const params: { [key: string]: any } = {};
        

        if (experimentName) {
            query += ' WHERE toLower(n.experimentName) CONTAINS toLower($experimentName)';
            countQuery += ' WHERE toLower(n.experimentName) CONTAINS toLower($experimentName)';
            params.experimentName = experimentName;
        }

        if (startDate && endDate) {
            const startDateObj = new Date(startDate);
            const endDateObj = new Date(endDate);

            params.startDate = startDateObj.toISOString().slice(0,10);
            params.endDate = endDateObj.toISOString().slice(0,10);
            console.log(params.startDate, params.endDate)
            query += (experimentName ? ' AND' : ' WHERE') +
                ` date(n.date) >= date("${params.startDate}") AND date(n.date) <= date("${params.endDate}")`;
            countQuery += (experimentName ? ' AND' : ' WHERE') +
                ` date(n.date) >= date("${params.startDate}") AND date(n.date) <= date("${params.endDate}")`;
        }
        
        if (minNodes) {
            params.minNodes = minNodes;
            query += (experimentName || (startDate && endDate) ? ' AND' : ' WHERE') +
            ` COUNT {MATCH (m1:Node) WHERE toLower(n.experimentId) CONTAINS toLower(m1.experimentId)} >= ${params.minNodes}`;
            countQuery += (experimentName || (startDate && endDate) ? ' AND' : ' WHERE') +
            ` COUNT {MATCH (m1:Node) WHERE toLower(n.experimentId) CONTAINS toLower(m1.experimentId)} >= ${params.minNodes}`;
        }
        
        
        if (maxNodes) {
            params.maxNodes = maxNodes;
            query += ((experimentName || minNodes || (startDate && endDate)) ? ' AND' : ' WHERE') +
            ` COUNT {MATCH (m2:Node) WHERE toLower(n.experimentId) CONTAINS toLower(m2.experimentId)} <= ${params.maxNodes}`;
            countQuery += ((experimentName || minNodes || (startDate && endDate)) ? ' AND' : ' WHERE') +
            ` COUNT {MATCH (m2:Node) WHERE toLower(n.experimentId) CONTAINS toLower(m2.experimentId)} <= ${params.maxNodes}`;
        }
        
        if (minEdges) {
            params.minEdges = minEdges;
            query += (experimentName || (startDate && endDate) || minNodes || maxNodes ? ' AND' : ' WHERE') +
            ` COUNT {MATCH (n3:Node {experimentId: n.experimentId})-[r]->(m3:Node {experimentId: n.experimentId})} >= ${params.minEdges}`;
            countQuery += (experimentName || (startDate && endDate) || minNodes || maxNodes ? ' AND' : ' WHERE') +
            ` COUNT {MATCH (n3:Node {experimentId: n.experimentId})-[r]->(m3:Node {experimentId: n.experimentId})} >= ${params.minEdges}`;
        }
        
        
        if (maxEdges) {
            params.maxEdges = maxEdges;
            query += (experimentName || (startDate && endDate) || minNodes || maxNodes || minEdges ? ' AND' : ' WHERE') +
            ` COUNT {MATCH (n4:Node {experimentId: n.experimentId})-[r]->(m4:Node {experimentId: n.experimentId})} <= ${params.maxEdges}`;
            countQuery += (experimentName || (startDate && endDate) || minNodes || maxNodes || minEdges ? ' AND' : ' WHERE') +
            ` COUNT {MATCH (n4:Node {experimentId: n.experimentId})-[r]->(m4:Node {experimentId: n.experimentId})} <= ${params.maxEdges}`;
        }


        if (experimentId) {
            query += (experimentName || (startDate && endDate) || minNodes || maxNodes || minEdges || maxEdges ? ' AND' : ' WHERE') +
                ` toLower(n.experimentId) CONTAINS toLower("${experimentId}")`;
            countQuery += (experimentName || (startDate && endDate) || minNodes || maxNodes || minEdges || maxEdges ? ' AND' : ' WHERE') +
                ` toLower(n.experimentId) CONTAINS toLower("${experimentId}")`;
            params.experimentId = experimentId;
        }

        query += ' RETURN DISTINCT n.experimentName AS experimentName, n.date AS date, n.experimentId as id SKIP TOINTEGER($skip) LIMIT TOINTEGER($limit)';
        countQuery += ' RETURN COUNT(DISTINCT n.experimentId) AS totalCount';

        const result = await session.run(query, {
            ...params,
            skip: (page - 1) * pageSize,
            limit: pageSize
        });


        const experiments = result.records.map(record => {
            return {
                experimentName: record.get('experimentName'),
                id: record.get('id'),
                date: record.get('date'),
            };
        });

        

        const totalCountResult = await session.run(countQuery, params);
        const totalExperiments = totalCountResult.records[0].get('totalCount').low;
        
        return { experiments, totalExperiments };

    } catch (error) {
        console.error('Error retrieving experiments from Neo4j:', error);
        return { experiments: [], totalExperiments: 0 };
    } finally {
        await session.close();
    }
}

export async function retrieveExperimentNodesAndEdges(experimentId: string) {
    const session = driver.session();
    try {
        const nodeListQuery = 'MATCH (n:Node {experimentId: $experimentId}) RETURN n.id as id, n.x as x, n.y as y'
        const edgeListQuery = 'MATCH (n:Node {experimentId: $experimentId})-[r]->(m:Node {experimentId: $experimentId}) RETURN r.id as id, n.id as fromId, m.id as toId'

        const nodeListResult = await session.run(nodeListQuery, { experimentId: experimentId });
        const edgeListResult = await session.run(edgeListQuery, { experimentId: experimentId });


        const nodeList = nodeListResult.records.map(node => `${node.get('id')}(${node.get('x')}:${node.get('y')})`);
        const edgeList = edgeListResult.records.map(edge => `${edge.get('fromId')}(${edge.get('id')}:${edge.get('toId')})`);
        
        const nodeListAsString = nodeList.join("; ");
        const edgeListAsString = edgeList.join("; ");

        const nodeListSimple = nodeListResult.records.map(node => node.get('id')).join("; ");
        const edgeListSimple = edgeListResult.records.map(edge => edge.get('id')).join("; ");

        return {
            nodeListAsString: nodeListAsString,
            edgeListAsString: edgeListAsString,
            nodeListSimple: nodeListSimple,
            edgeListSimple: edgeListSimple,
        };
    } catch (error) {
        console.error('Error retrieving experiment nodes and edges from Neo4j:', error);
        return {};
    } finally {
        await session.close();
    }
}
     

export async function retrieveExperimentStats(experimentId: string) {
    const session = driver.session();

    try {
        const nodesQuery = 'MATCH (n:Node {experimentId: $experimentId}) RETURN COUNT(n) as nodeCount';
        const edgesQuery = 'MATCH (:Node {experimentId: $experimentId})-[r]->(:Node {experimentId: $experimentId}) RETURN COUNT(r) as edgeCount';
        const degreeDistQuery = 'MATCH (n:Node {experimentId: $experimentId}) RETURN COUNT{(n)--()} as degree ORDER BY degree';
        
        const nodesResult = await session.run(nodesQuery, { experimentId: experimentId });
        const edgesResult = await session.run(edgesQuery, { experimentId: experimentId });
        const degreeDistResult = await session.run(degreeDistQuery, { experimentId: experimentId });
        
        const nodeCount = nodesResult.records[0].get('nodeCount').low;
        const edgeCount = edgesResult.records[0].get('edgeCount').low;
        
        const degreeDist = degreeDistResult.records.map(record => record.get('degree').low);
        const minNodeDegree = degreeDist.length > 0? Math.min(...degreeDist): 0 ;
        const maxNodeDegree = degreeDist.length > 0? Math.max(...degreeDist): 0 ;
        const medianNodeDegree = degreeDist.length > 0? degreeDist[Math.floor(degreeDist.length / 2)]: 0 ;
        

        const degreeSum = degreeDist.reduce((a, b) => a + b, 0);
        const avgNodeDegree = degreeSum / nodeCount;

        return {
            numberOfNodes: nodeCount,
            numberOfEdges: edgeCount,
            averageNodeDegree: avgNodeDegree,
            minNodeDegree: minNodeDegree,
            maxNodeDegree: maxNodeDegree,
            medianNodeDegree: medianNodeDegree,
        };
    } catch (error) {
        console.error('Error retrieving experiment stats from Neo4j:', error);
        return {};
    } finally {
        await session.close();
    }
}

export async function retrieveAllExperimentStats() {
    const session = driver.session();

    try {
        const statsQuery =
            'MATCH (n:Node) ' +
            'OPTIONAL MATCH (n)-[r]->(:Node) ' +
            'WITH COUNT(DISTINCT n.experimentId) as totalExperiments, COUNT(n) as totalNodes, COUNT(r) as totalEdges ' +
            'RETURN totalExperiments, totalNodes, totalEdges';

        const statsResult = await session.run(statsQuery);

        const record = statsResult.records[0];
        const totalExperiments = record.get('totalExperiments').low;
        const totalNodes = record.get('totalNodes').low;
        const totalEdges = record.get('totalEdges').low;

        return {
            totalExperiments,
            totalNodes,
            totalEdges
        };

    } catch (error) {
        console.error('Error retrieving all experiment stats from Neo4j:', error);
        return {};
    } finally {
        await session.close();
    }
}



