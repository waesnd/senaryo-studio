import { withAI } from "../../lib/server/withAI";
import { aiOperations } from "../../lib/server/aiOperations";

export default withAI("karakterbible", aiOperations.karakterbible);

export const config = { api: { bodyParser: { sizeLimit: "128kb" } }, maxDuration: 60 };
