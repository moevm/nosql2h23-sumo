import {retrieveExperiments} from "~/lib/experiment.methods";

export default defineEventHandler(async (event) => {
    try {
        const query = getQuery(event)
        // @ts-ignore
        return await retrieveExperiments(Number.parseInt(query.page), Number.parseInt(query.size), query.experimentName, query.startDate, query.endDate, query.experimentId
        );
    } catch (error) {
        throw new Error('Failed');
    }
})
