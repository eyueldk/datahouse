import { Theme as ShadcnTheme } from "@rjsf/shadcn";
import { withTheme } from "@rjsf/core";
import validator from "@rjsf/validator-ajv8";
import { cn } from "#/lib/utils";
import { safeObjectFormData, stringifyJson } from "#/lib/json-config";

const ThemedForm = withTheme(ShadcnTheme);

export type JsonSchemaFormProps = {
  schema: Record<string, unknown>;
  /** Current config as JSON text; kept in sync with visual edits. */
  valueJson: string;
  onChangeJson: (json: string) => void;
  className?: string;
};

/**
 * RJSF + shadcn theme: edits a JSON-serializable object described by `schema`.
 */
export function JsonSchemaForm(props: JsonSchemaFormProps) {
  const { schema, valueJson, onChangeJson, className } = props;

  return (
    <div className={cn("rounded-md border border-border p-3", className)}>
      <ThemedForm
        schema={schema}
        validator={validator}
        formData={safeObjectFormData(valueJson)}
        onChange={(event: { formData?: unknown }) => {
          const nextData = event.formData ?? {};
          onChangeJson(stringifyJson(nextData));
        }}
      >
        <div />
      </ThemedForm>
    </div>
  );
}
