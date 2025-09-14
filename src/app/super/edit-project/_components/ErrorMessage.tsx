import { ErrorMessageProps } from "./types";

export default function ErrorMessage({ error }: ErrorMessageProps) {
  if (!error) return null;

  return (
    <div
      className={`mb-4 rounded-md border p-3 ${
        error.includes("enviado")
          ? "border-green-200 bg-green-50"
          : "border-red-200 bg-red-50"
      }`}
    >
      <p
        className={`text-sm ${
          error.includes("enviado") ? "text-green-600" : "text-red-600"
        }`}
      >
        {error}
      </p>
    </div>
  );
}
