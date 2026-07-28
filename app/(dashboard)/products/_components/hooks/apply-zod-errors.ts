import type { FieldValues, UseFormSetError } from "react-hook-form";
import type { ZodError } from "zod";

export function applyZodErrors<T extends FieldValues>(
  error: ZodError,
  setError: UseFormSetError<T>,
) {
  for (const issue of error.issues) {
    const fieldName = issue.path.join(".") as Parameters<UseFormSetError<T>>[0];
    setError(fieldName, { type: "manual", message: issue.message });
  }
}
