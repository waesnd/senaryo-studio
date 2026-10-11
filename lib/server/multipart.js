import { ApiError } from "./errors";
export const MULTIPART_OVERHEAD_BYTES = 256 * 1024;
export async function readMultipartFile(req, maxFileBytes, timeoutMs = 15_000) {
  const contentType = req.headers?.["content-type"];
  if (typeof contentType !== "string" || !/^multipart\/form-data;\s*boundary=/i.test(contentType) || contentType.length > 300) throw new ApiError(400, "MEDIA_VALIDATION_ERROR", "Dosya multipart formunda gönderilmeli.");
  const maxBody = maxFileBytes + MULTIPART_OVERHEAD_BYTES;
  const declaredLength = req.headers?.["content-length"];
  if (declaredLength !== undefined && (!Number.isSafeInteger(Number(declaredLength)) || Number(declaredLength) < 1 || Number(declaredLength) > maxBody)) throw new ApiError(413, "MEDIA_TOO_LARGE", "Dosya boyutu yükleme sınırını aşıyor.");
  const chunks = await new Promise((resolve, reject) => {
    const buffers = [];
    let bytes = 0;
    const cleanup = () => { clearTimeout(timer); req.removeListener("data", onData); req.removeListener("end", onEnd); req.removeListener("error", onError); req.removeListener("aborted", onAbort); };
    const fail = error => { cleanup(); req.pause(); reject(error); };
    const onData = chunk => { const buffer = Buffer.from(chunk); bytes += buffer.length; if (bytes > maxBody) return fail(new ApiError(413, "MEDIA_TOO_LARGE", "Dosya boyutu yükleme sınırını aşıyor.")); buffers.push(buffer); };
    const onEnd = () => { cleanup(); resolve(buffers); };
    const onError = () => fail(new ApiError(400, "MEDIA_UPLOAD_INTERRUPTED", "Dosya aktarımı kesildi."));
    const onAbort = () => fail(new ApiError(400, "MEDIA_UPLOAD_INTERRUPTED", "Dosya aktarımı kesildi."));
    const timer = setTimeout(() => fail(new ApiError(408, "MEDIA_UPLOAD_TIMEOUT", "Dosya aktarımı zaman aşımına uğradı.")), timeoutMs);
    req.on("data", onData); req.on("end", onEnd); req.on("error", onError); req.on("aborted", onAbort);
  });
  let form;
  try { form = await new Response(Buffer.concat(chunks), { headers: { "Content-Type": contentType } }).formData(); } catch { throw new ApiError(400, "MEDIA_VALIDATION_ERROR", "Dosya formu okunamadı."); }
  const entries = [...form.entries()];
  const file = form.get("file");
  if (entries.length !== 1 || entries[0][0] !== "file" || typeof file === "string" || !file || typeof file.arrayBuffer !== "function" || file.size <= 0) throw new ApiError(400, "MEDIA_VALIDATION_ERROR", "Tam olarak bir dosya gönderilmeli.");
  if (file.size > maxFileBytes) throw new ApiError(413, "MEDIA_TOO_LARGE", "Dosya boyutu yükleme sınırını aşıyor.");
  return file;
}
