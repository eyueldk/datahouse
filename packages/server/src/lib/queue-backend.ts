export interface QueueExecuteParams<TData> {
  data: TData;
}

export interface QueueEnqueueParams<TData> {
  data: TData;
}

export interface QueueScheduleParams<TData> {
  key: string;
  cron: string;
  data: TData;
}

export interface QueueUnscheduleParams {
  key: string;
}

/** Handle for a registered named queue (enqueue / schedule / unschedule). */
export interface RegisteredQueue<TData> {
  enqueue(params: QueueEnqueueParams<TData>): Promise<void>;
  schedule(params: QueueScheduleParams<TData>): Promise<void>;
  unschedule(params: QueueUnscheduleParams): Promise<void>;
}

export interface RegisterQueueParams<TData, TResult> {
  name: string;
  execute(params: QueueExecuteParams<TData>): Promise<TResult> | TResult;
}

export type QueueBackend = {
  register: <TData, TResult>(
    params: RegisterQueueParams<TData, TResult>,
  ) => RegisteredQueue<TData>;
};

export function createQueueBackend<TImpl extends QueueBackend>(
  impl: TImpl,
): TImpl {
  return impl;
}
