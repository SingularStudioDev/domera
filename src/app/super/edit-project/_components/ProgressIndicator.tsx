import { ProgressIndicatorProps } from "./types";

export default function ProgressIndicator({
  authStep,
}: ProgressIndicatorProps) {
  return (
    <div className="mb-8 w-full">
      <div className="mb-4 flex items-center justify-center space-x-4">
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium ${
            authStep === "credentials"
              ? "bg-blue-600 text-white"
              : authStep === "verification" || authStep === "success"
                ? "bg-green-600 text-white"
                : "bg-gray-200 text-gray-600"
          }`}
        >
          1
        </div>
        <div
          className={`h-1 w-16 rounded ${
            authStep === "verification" || authStep === "success"
              ? "bg-green-600"
              : "bg-gray-200"
          }`}
        ></div>
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium ${
            authStep === "verification"
              ? "bg-blue-600 text-white"
              : authStep === "success"
                ? "bg-green-600 text-white"
                : "bg-gray-200 text-gray-600"
          }`}
        >
          2
        </div>
        <div
          className={`h-1 w-16 rounded ${
            authStep === "success" ? "bg-green-600" : "bg-gray-200"
          }`}
        ></div>
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium ${
            authStep === "success"
              ? "bg-green-600 text-white"
              : "bg-gray-200 text-gray-600"
          }`}
        >
          ✓
        </div>
      </div>
    </div>
  );
}
