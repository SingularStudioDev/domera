export default function SuccessMessage() {
  return (
    <div className="w-full space-y-4 text-center">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
        <svg
          className="h-8 w-8 text-green-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-gray-900">
        ¡Autenticación exitosa!
      </h3>
      <p className="text-sm text-gray-600">
        Redirigiendo al panel de super administración...
      </p>
    </div>
  );
}
