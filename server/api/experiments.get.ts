import {retrieveExperiments} from "~/lib/experiment.methods";

export default defineEventHandler(async (event) => {
    try {
        const query = getQuery(event)
        // @ts-ignore
        return await retrieveExperiments(Number.parseInt(query.page), Number.parseInt(query.pageSize), query.experimentName, query.experimentId, query.startDate, query.endDate, query.minNodes, query.maxNodes, query.minEdges, query.maxEdges
        );
    } catch (error) {
        throw new Error('Failed');
    }
})
