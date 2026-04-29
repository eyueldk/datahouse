import {
  deleteDatalakeRecord,
  listDatalake,
  listTransformers,
  transformDatalake,
} from "#/lib/server-functions";
import { useQueryClient } from "@tanstack/react-query";
import {
  createServerFnMutationHook,
  createServerFnQueryHook,
} from "#/utils/react-query.utils";

export const useDatalakeQuery = createServerFnQueryHook(
  listDatalake,
  ({ data }) => ({ queryKey: ["datalake", data] }),
);

export const useTransformersQuery = createServerFnQueryHook(
  listTransformers,
  ({ data }) => ({ queryKey: ["transformers", data] }),
);

export const useTransformDatalakeMutation =
  createServerFnMutationHook(transformDatalake, () => {
    const queryClient = useQueryClient();
    return {
      onSuccess: async () => {
        await queryClient.invalidateQueries();
      },
    };
  });

export const useDeleteDatalakeRecordMutation =
  createServerFnMutationHook(deleteDatalakeRecord, () => {
    const queryClient = useQueryClient();
    return {
      onSuccess: async () => {
        await queryClient.invalidateQueries();
      },
    };
  });
