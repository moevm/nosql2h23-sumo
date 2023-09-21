import { driver, auth } from 'neo4j-driver'

export const neo4jDriver = driver(
    process.env.NEO4J_URI ?? '',
    auth.basic(
        process.env.NEO4J_USERNAME ?? 'username',
        process.env.NEO4J_PASSWORD ?? 'password'
    )
)
