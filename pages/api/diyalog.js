import { withAI } from "../../lib/server/withAI";
import { aiOperations } from "../../lib/server/aiOperations";

export default withAI("diyalog", aiOperations.diyalog);

export const config = { api: { bodyParser: { sizeLimit: "128kb" } }, maxDuration: 60 };
