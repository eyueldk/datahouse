import type { AnyExtractor } from "./extractor";
import type { AnyTransformer, Transformer } from "./transformer";

/** Second type param uses `any` for the collection slot so concrete transformer types are preserved. */
export interface Pipeline<
  TExtractor,
  TTransformer extends Transformer<TExtractor, any>,
> {
  extractor: TExtractor;
  transformer: TTransformer;
}

export type AnyPipeline = Pipeline<AnyExtractor, AnyTransformer>;

export function createPipeline<
  TExtractor,
  TTransformer extends Transformer<TExtractor, any>,
>(
  extractor: TExtractor,
  transformer: TTransformer,
): Pipeline<TExtractor, TTransformer> {
  return {
    extractor,
    transformer,
  };
}
