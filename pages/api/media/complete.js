import { createMediaHandlers } from "../../../lib/server/media";
export default createMediaHandlers().complete;

export const config = { api: { bodyParser: { sizeLimit: "16kb" } }, maxDuration: 60 };
