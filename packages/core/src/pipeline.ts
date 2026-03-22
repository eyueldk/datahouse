import type { Extractor } from "./extractor";
import type { Transformer } from "./transformer";
import type { AnyCollection } from "./collection";

export interface Pipeline<
  TExtractor,
  TTransformer extends Transformer<TExtractor, AnyCollection>,
> {
  extractor: TExtractor;
  transformer: TTransformer;
}

export type AnyPipeline = Pipeline<
  Extractor<unknown, unknown, unknown, unknown>,
  Transformer<Extractor<unknown, unknown, unknown, unknown>, AnyCollection>
>;

export function createPipeline<
  TExtractor,
  TTransformer extends Transformer<TExtractor, AnyCollection>,
>(
  extractor: TExtractor,
  transformer: TTransformer,
): Pipeline<TExtractor, TTransformer> {
  return {
    extractor,
    transformer,
  };
}
