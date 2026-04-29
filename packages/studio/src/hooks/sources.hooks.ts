import {
  createSource,
  deleteSource,
  extractSource,
  listExtractors,
  listSources,
} from "#/lib/server-functions";
import { useQueryClient } from "@tanstack/react-query";
import {
  createServerFnMutationHook,
  createServerFnQueryHook,
} from "#/utils/react-query.utils";

export const useSourcesQuery = createServerFnQueryHook(
  listSources,
  ({ data }) => ({ queryKey: ["sources", data] }),
);

export const useExtractorsQuery = createServerFnQueryHook(
  listExtractors,
  ({ data }) => ({ queryKey: ["extractors", data] }),
);

export const useCreateSourceMutation = createServerFnMutationHook(
  createSource,
  () => {
    const queryClient = useQueryClient();
    return {
      onSuccess: async () => {
        await queryClient.invalidateQueries();
      },
    };
  },
);

export const useDeleteSourceMutation = createServerFnMutationHook(
  deleteSource,
  () => {
    const queryClient = useQueryClient();
    return {
      onSuccess: async () => {
        await queryClient.invalidateQueries();
      },
    };
  },
);

export const useExtractSourceMutation = createServerFnMutationHook(
  extractSource,
  () => {
    const queryClient = useQueryClient();
    return {
      onSuccess: async () => {
        await queryClient.invalidateQueries();
      },
    };
  },
);
