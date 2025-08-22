import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Dispatch, SetStateAction } from 'react';

interface ShoppingSheetProps {
  isSheetOpen: boolean;
  setIsSheetOpen: Dispatch<SetStateAction<boolean>>;
}

export function ShoppingSheet({
  isSheetOpen,
  setIsSheetOpen,
}: ShoppingSheetProps) {
  return (
    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
      <SheetContent
        side="right"
        className="w-[80vw] rounded-l-xl sm:max-w-[80vw]"
      >
        <SheetHeader>
          <SheetTitle>Winks Americas</SheetTitle>
          <SheetDescription>
            Detalles del proyecto inmobiliario
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6">
          <p>Información detallada del proyecto aquí...</p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
