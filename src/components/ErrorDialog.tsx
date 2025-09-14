"use client";

import { useErrorDialog } from "@/contexts/ErrorDialogContext";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import MainButton from "@/components/custom-ui/MainButton";

export function ErrorDialog() {
  const { errorState, hideError } = useErrorDialog();

  return (
    <Dialog open={errorState.isOpen} onOpenChange={() => hideError()}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <div className="flex flex-col items-start gap-3">
            <DialogTitle className="text-2xl">Error</DialogTitle>
            <DialogDescription className="text-left text-base text-black">
              {errorState.message}
            </DialogDescription>
          </div>
        </DialogHeader>
        <DialogFooter className="mt-10">
          <MainButton onClick={hideError} variant="fill" showArrow>
            Aceptar
          </MainButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
