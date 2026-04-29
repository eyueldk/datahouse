import { listFiles } from "#/lib/server-functions";
import { createServerFnQueryHook } from "#/utils/react-query.utils";

export const useFilesQuery = createServerFnQueryHook(
  listFiles,
  ({ data }) => ({ queryKey: ["files", data] }),
);
