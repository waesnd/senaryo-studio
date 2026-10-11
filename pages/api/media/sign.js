import { createMediaHandlers } from "../../../lib/server/media";
export default createMediaHandlers().sign;

export const config = { api: { bodyParser: { sizeLimit: "16kb" } }, maxDuration: 60 };
