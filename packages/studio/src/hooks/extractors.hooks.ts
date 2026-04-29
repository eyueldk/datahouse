import { listExtractors } from "#/lib/server-functions";
import { createServerFnQueryHook } from "#/utils/react-query.utils";

export const useExtractorsQuery = createServerFnQueryHook(
  listExtractors,
  ({ data }) => ({ queryKey: ["extractors", data] }),
);
