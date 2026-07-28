import axios from "axios";

interface AxiosErrorContext {
  [key: string]: string | number | boolean | null | undefined;
}

export function logAxiosError(
  channel: "cafe24" | "shopify",
  operation: string,
  error: unknown,
  context?: AxiosErrorContext,
): void {
  const prefix = `[${channel}] ${operation} 실패`;

  if (axios.isAxiosError(error)) {
    console.error(prefix, {
      ...context,
      status: error.response?.status,
      data: error.response?.data,
      headers: error.response?.headers,
      message: error.message,
    });
    return;
  }

  console.error(prefix, {
    ...context,
    message: error instanceof Error ? error.message : String(error),
  });
}
