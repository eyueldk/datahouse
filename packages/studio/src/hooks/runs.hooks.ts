import { getRun, listRuns } from "#/lib/server-functions";
import {
  createServerFnQueryHook,
} from "#/utils/react-query.utils";

export const useRunsQuery = createServerFnQueryHook(
  listRuns,
  ({ data }) => ({ queryKey: ["runs", data] }),
);

export const useRunQuery = createServerFnQueryHook(
  getRun,
  ({ data }) => ({ queryKey: ["run", data] }),
);
