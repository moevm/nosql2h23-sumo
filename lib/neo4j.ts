import { driver } from 'neo4j-driver'

export const neo4jDriver = driver(
    'bolt://neo4j:7687',
)
