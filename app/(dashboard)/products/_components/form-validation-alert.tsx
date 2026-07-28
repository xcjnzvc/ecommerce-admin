"use client";

interface FormValidationAlertProps {
  messages: string[];
}

export function FormValidationAlert({ messages }: FormValidationAlertProps) {
  if (messages.length === 0) return null;

  return (
    <div
      role="alert"
      className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg"
    >
      <p className="font-semibold">
        입력이 필요한 항목이 {messages.length}개 있습니다. 아래 내용을 확인해
        주세요.
      </p>
      <ul className="mt-2 space-y-1 list-disc list-inside text-red-600">
        {messages.slice(0, 5).map((message) => (
          <li key={message}>{message}</li>
        ))}
        {messages.length > 5 && (
          <li>외 {messages.length - 5}개 항목</li>
        )}
      </ul>
    </div>
  );
}
