import type { FieldErrors, FieldValues, Path, UseFormSetFocus } from "react-hook-form";

export type ProductFormSection = "basic" | "options" | "legal" | "channels";

const SECTION_IDS: Record<ProductFormSection, string> = {
  basic: "product-section-basic",
  options: "product-section-options",
  legal: "product-section-legal",
  channels: "product-section-channels",
};

export function getSectionForFieldPath(path: string): ProductFormSection {
  if (path.startsWith("options")) return "options";
  if (path.startsWith("legalInfo")) return "legal";
  if (path.startsWith("channels") || path.startsWith("channelData")) {
    return "channels";
  }
  return "basic";
}

function collectErrorMessages(
  errors: FieldErrors,
  prefix = "",
): Array<{ path: string; message: string }> {
  const result: Array<{ path: string; message: string }> = [];

  for (const key of Object.keys(errors)) {
    const value = errors[key];
    if (!value || typeof value !== "object") continue;

    const path = prefix ? `${prefix}.${key}` : key;

    if ("message" in value && typeof value.message === "string") {
      result.push({ path, message: value.message });
      continue;
    }

    result.push(...collectErrorMessages(value as FieldErrors, path));
  }

  return result;
}

export function getFirstErrorPath(errors: FieldErrors): string | null {
  const messages = collectErrorMessages(errors);
  return messages[0]?.path ?? null;
}

export function collectFormErrorMessages(errors: FieldErrors): string[] {
  return collectErrorMessages(errors).map((item) => item.message);
}

export function scrollToFormField(
  fieldPath: string,
  setFocus: UseFormSetFocus<FieldValues>,
  onSectionFocus?: (section: ProductFormSection) => void,
) {
  const section = getSectionForFieldPath(fieldPath);
  onSectionFocus?.(section);

  const sectionEl = document.getElementById(SECTION_IDS[section]);
  if (sectionEl) {
    sectionEl.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  window.setTimeout(() => {
    setFocus(fieldPath as Path<FieldValues>, { shouldSelect: true });
  }, 250);
}

export function focusFirstFormError(
  errors: FieldErrors,
  setFocus: UseFormSetFocus<FieldValues>,
  onSectionFocus?: (section: ProductFormSection) => void,
) {
  const firstPath = getFirstErrorPath(errors);
  if (!firstPath) return;

  scrollToFormField(firstPath, setFocus, onSectionFocus);
}
