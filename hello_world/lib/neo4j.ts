import { driver, auth } from 'neo4j-driver'

export const neo4jDriver = driver(
    'bolt://localhost:7687',
    auth.basic(
        'neo4j',
        'testtesttest'
    )
)
