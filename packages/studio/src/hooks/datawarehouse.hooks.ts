import {
  deleteDatawarehouseRecord,
  listDatawarehouseCollections,
  listDatawarehouseRecords,
} from "#/lib/server-functions";
import { useQueryClient } from "@tanstack/react-query";
import {
  createServerFnMutationHook,
  createServerFnQueryHook,
} from "#/utils/react-query.utils";

export const useDatawarehouseCollectionsQuery = createServerFnQueryHook(
  listDatawarehouseCollections,
  () => ({ queryKey: ["datawarehouse-collections"] }),
);

export const useDatawarehouseRecordsQuery = createServerFnQueryHook(
  listDatawarehouseRecords,
  ({ data }) => ({ queryKey: ["datawarehouse-records", data] }),
);

export const useDeleteDatawarehouseRecordMutation =
  createServerFnMutationHook(deleteDatawarehouseRecord, () => {
    const queryClient = useQueryClient();
    return {
      onSuccess: async () => {
        await queryClient.invalidateQueries();
      },
    };
  });
