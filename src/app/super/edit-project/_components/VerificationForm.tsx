import { VerificationFormProps } from "./types";

export default function VerificationForm({
  userData,
  verificationCode,
  isSubmitting,
  countdown,
  onCodeChange,
  onSubmit,
  onResendCode,
  onBackToLogin,
}: VerificationFormProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="w-full space-y-4">
      <div className="mb-6 text-center">
        <h3 className="mb-2 text-lg font-medium text-gray-900">
          Verificación de dos factores
        </h3>
        <p className="text-sm text-gray-600">
          Hemos enviado un código de 6 dígitos a{" "}
          <strong>{userData?.email}</strong>
        </p>
        {countdown > 0 && (
          <p className="mt-2 text-xs text-gray-500">
            El código expira en {formatTime(countdown)}
          </p>
        )}
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Código de verificación
          </label>
          <input
            type="text"
            value={verificationCode}
            onChange={(e) => {
              onCodeChange(e.target.value.replace(/\D/g, "").slice(0, 6));
            }}
            className="w-full rounded-md border border-gray-300 px-4 py-3 text-center text-2xl tracking-widest transition-all outline-none focus:border-transparent focus:ring-2 focus:ring-blue-500"
            placeholder="000000"
            maxLength={6}
            required
            disabled={isSubmitting}
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting || verificationCode.length !== 6}
          className="w-full cursor-pointer rounded-md bg-blue-600 px-4 py-3 font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
        >
          {isSubmitting ? "Verificando..." : "Verificar código"}
        </button>
      </form>

      <div className="space-y-2 text-center">
        <button
          onClick={onResendCode}
          disabled={isSubmitting || countdown > 540} // Allow resend after 1 minute
          className="text-sm text-blue-600 hover:text-blue-700 disabled:cursor-not-allowed disabled:text-gray-400"
        >
          {countdown > 540
            ? "Espera 1 minuto para reenviar"
            : "Reenviar código"}
        </button>

        <button
          onClick={onBackToLogin}
          className="block w-full text-sm text-gray-600 hover:text-gray-700"
        >
          ← Volver al inicio de sesión
        </button>
      </div>
    </div>
  );
}
