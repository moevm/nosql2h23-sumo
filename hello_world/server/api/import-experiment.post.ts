import {importExperiment} from "~/lib/experiment.methods";

export default defineEventHandler(async (event) => {
    try {
        const data = await readBody(event)
        return await importExperiment(data);
    } catch (error) {
        throw new Error('Failed');
    }
})
