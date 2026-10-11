import { createMediaHandlers } from "../../lib/server/media";
export default createMediaHandlers().remove;

export const config = { api: { bodyParser: { sizeLimit: "16kb" } }, maxDuration: 60 };
