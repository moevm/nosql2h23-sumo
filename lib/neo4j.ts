import { driver } from 'neo4j-driver'

export const neo4jDriver = driver(
    'bolt://127.0.0.1:7687',
)
