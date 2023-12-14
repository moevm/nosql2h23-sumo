import {retrieveAllExperimentStats} from "~/lib/experiment.methods";

export default defineEventHandler(async (event) => {
    try {
        // @ts-ignore
        return await retrieveAllExperimentStats();
    } catch (error) {
        throw new Error('Failed');
    }
})
