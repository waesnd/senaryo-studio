import { createMediaHandlers } from "../../../lib/server/media";
export default createMediaHandlers().upload;
export const config = { api: { bodyParser: false }, maxDuration: 60 };
