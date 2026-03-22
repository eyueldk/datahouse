export interface TaskExecuteParams<TData> {
  data: TData;
}

export interface TaskEnqueueParams<TData> {
  data: TData;
}

export interface TaskScheduleParams<TData> {
  key: string;
  cron: string;
  data: TData;
}

export interface TaskUnscheduleParams {
  key: string;
}

export interface Task<TData, TResult> {
  enqueue(params: TaskEnqueueParams<TData>): Promise<void>;
  schedule(params: TaskScheduleParams<TData>): Promise<void>;
  unschedule(params: TaskUnscheduleParams): Promise<void>;
}

export interface RegisterTaskParams<TData, TResult> {
  name: string;
  execute(params: TaskExecuteParams<TData>): Promise<TResult> | TResult;
}

export type TaskBackend = {
  register: <TData, TResult>(
    params: RegisterTaskParams<TData, TResult>,
  ) => Task<TData, TResult>;
};

export function createTaskBackend<TImpl extends TaskBackend>(
  impl: TImpl,
): TImpl {
  return impl;
}
