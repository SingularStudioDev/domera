export type AuthStep = "credentials" | "verification" | "success";

export interface UserData {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  tokenExpiry?: string;
}

export interface FormData {
  email: string;
  password: string;
}

export interface CredentialsFormProps {
  formData: FormData;
  showPassword: boolean;
  isSubmitting: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onTogglePassword: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export interface VerificationFormProps {
  userData: UserData | null;
  verificationCode: string;
  isSubmitting: boolean;
  countdown: number;
  onCodeChange: (code: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onResendCode: () => void;
  onBackToLogin: () => void;
}

export interface ProgressIndicatorProps {
  authStep: AuthStep;
}

export interface ErrorMessageProps {
  error: string;
}
