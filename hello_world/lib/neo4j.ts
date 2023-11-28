import { driver, auth } from 'neo4j-driver'

export const neo4jDriver = driver(
    'bolt://neo4j:7687',
    auth.basic(
        'neo4j',
        'testtesttest'
    )
)
