import { Session, Node, Relationship } from 'neo4j-driver';
import { neo4jDriver } from './neo4j';

let driver = neo4jDriver;

export function backupNodes(): Promise<object[]> {
    let session: Session = driver.session();
    let result: object[] = [];

    return new Promise((resolve, reject) => {
        session.run('MATCH (n) RETURN n')
            .subscribe({
                onNext: function (record) {
                    let node = record.get('n');
                    result.push({
                        identity: node.identity.toNumber(),
                        labels: node.labels,
                        properties: node.properties
                    });
                },
                onCompleted: function () {
                    session.close();
                    resolve(result);
                },
                onError: function (error) {
                    console.log(error);
                    session.close();
                    reject(error);
                }
            });
    });
}

export function backupRelationships(): Promise<object[]> {
    let session: Session = driver.session();
    let result: object[] = [];

    return new Promise((resolve, reject) => {
        session.run('MATCH (a)-[r]->(b) RETURN a, r, b')
            .subscribe({
                onNext: function (record) {
                    let relationship = record.get('r');
                    let startNode = record.get('a');
                    let endNode = record.get('b');
                    result.push({
                        relationship: {
                            identity: relationship.identity.toNumber(),
                            type: relationship.type,
                            properties: relationship.properties
                        },
                        startNode: {
                            identity: startNode.identity.toNumber(),
                            labels: startNode.labels,
                            properties: startNode.properties
                        },
                        endNode: {
                            identity: endNode.identity.toNumber(),
                            labels: endNode.labels,
                            properties: endNode.properties
                        }
                    });
                },
                onCompleted: function () {
                    session.close();
                    resolve(result);
                },
                onError: function (error) {
                    console.log(error);
                    session.close();
                    reject(error);
                }
            });
    });
}
