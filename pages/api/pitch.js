import { withAI } from "../../lib/server/withAI";
import { aiOperations } from "../../lib/server/aiOperations";

export default withAI("pitch", aiOperations.pitch);

export const config = { api: { bodyParser: { sizeLimit: "128kb" } }, maxDuration: 60 };
