import { useErrorDialog } from "@/contexts/ErrorDialogContext";

export function useShowError() {
  const { showError } = useErrorDialog();
  return showError;
}