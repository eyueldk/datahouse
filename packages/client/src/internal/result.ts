interface TreatyError {
  status: number;
  value: unknown;
}

interface TreatyResponse<TData> {
  data: TData | null;
  error: TreatyError | null;
}

export function unwrapData<TData>(
  response: TreatyResponse<TData>,
  message: string,
): TData {
  if (response.error) {
    throw new Error(
      `${message} (status ${response.error.status}): ${JSON.stringify(response.error.value)}`,
    );
  }

  if (response.data === null) {
    throw new Error(`${message}: response data is empty`);
  }

  return response.data;
}
