/**
 * Builds an RFC 5987–aware `Content-Disposition` value for a file download
 * (`attachment` disposition with ASCII `filename` + UTF-8 `filename*`).
 */
export function attachmentContentDisposition(params: { filename: string }) {
  const safe = params.filename.replace(/[\r\n"]/g, "_").slice(0, 200);
  const encoded = encodeURIComponent(params.filename).replace(/'/g, "%27");
  return `attachment; filename="${safe}"; filename*=UTF-8''${encoded}`;
}
