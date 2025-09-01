import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useCheckoutStore, CheckoutItem } from '@/stores/checkoutStore';
import { toast } from 'react-hot-toast';

export const useCheckout = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const store = useCheckoutStore();

  const addItemWithNotification = (item: CheckoutItem) => {
    if (status === 'loading') {
      return false;
    }

    if (!session?.user) {
      toast.error('Debes iniciar sesión para agregar unidades al checkout');
      router.push('/login?redirect=/checkout');
      return false;
    }

    const success = store.addItem(item);
    
    if (success) {
      toast.success(`${item.unitTitle} agregada al checkout`);
    } else {
      toast.error('Solo puedes agregar unidades del mismo proyecto al checkout');
    }
    
    return success;
  };

  const removeItemWithNotification = (itemId: string) => {
    const item = store.items.find(i => i.id === itemId);
    store.removeItem(itemId);
    
    if (item) {
      toast.success(`${item.unitTitle} removida del checkout`);
    }
  };

  const clearCheckoutWithConfirmation = () => {
    if (!session?.user) {
      return false;
    }

    if (store.items.length > 0) {
      const confirmed = window.confirm(
        '¿Estás seguro de que quieres limpiar el checkout? Se perderán todas las unidades seleccionadas.'
      );
      
      if (confirmed) {
        store.clearCheckout();
        toast.success('Checkout limpiado');
        return true;
      }
      return false;
    }
    return true;
  };

  return {
    ...store,
    addItemWithNotification,
    removeItemWithNotification,
    clearCheckoutWithConfirmation,
    isAuthenticated: !!session?.user,
    isLoading: status === 'loading',
  };
};