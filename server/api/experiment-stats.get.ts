import {retrieveExperimentStats} from "~/lib/experiment.methods";

export default defineEventHandler(async (event) => {
    try {
        const query = getQuery(event)
        // @ts-ignore
        return await retrieveExperimentStats(query.experimentId);
    } catch (error) {
        throw new Error('Failed');
    }
})
