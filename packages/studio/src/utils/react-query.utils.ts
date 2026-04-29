import {
  useMutation,
  useQuery,
  type UseMutationOptions,
  type UseMutationResult,
  type UseQueryOptions,
  type UseQueryResult,
} from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

type ServerFn<TData, TResult> = (params: { data: TData }) => Promise<TResult>;

export function createServerFnQueryHook<
  TData,
  TResult,
>(
  serverFn: ServerFn<TData, TResult>,
  useOptions: (params: {
    data: TData;
  }) => Omit<UseQueryOptions<TResult, Error, TResult>, "queryFn">,
) {
  return <TSelected = TResult>(
    data: TData,
    options?: Omit<
      UseQueryOptions<TResult, Error, TSelected>,
      "queryFn" | "queryKey"
    >,
  ): UseQueryResult<TSelected, Error> => {
    const fn = useServerFn<ServerFn<TData, TResult>>(serverFn);
    const baseOptions = useOptions({ data }) as Omit<
      UseQueryOptions<TResult, Error, TSelected>,
      "queryFn"
    >;
    return useQuery({
      ...baseOptions,
      ...options,
      queryFn: () =>
        data === undefined ? (fn as () => Promise<TResult>)() : fn({ data }),
    });
  };
}

export function createServerFnMutationHook<
  TData,
  TResult,
>(
  serverFn: ServerFn<TData, TResult>,
  useOptions: () => Omit<
    UseMutationOptions<TResult, Error, TData>,
    "mutationFn"
  >,
) {
  return <TContext = unknown>(
    options?: Omit<
      UseMutationOptions<TResult, Error, TData, TContext>,
      "mutationFn"
    >,
  ): UseMutationResult<TResult, Error, TData, TContext> => {
    const fn = useServerFn<ServerFn<TData, TResult>>(serverFn);
    const baseOptions = useOptions() as Omit<
      UseMutationOptions<TResult, Error, TData, TContext>,
      "mutationFn"
    >;
    return useMutation({
      ...baseOptions,
      ...options,
      mutationFn: (data) => fn({ data }),
    });
  };
}
