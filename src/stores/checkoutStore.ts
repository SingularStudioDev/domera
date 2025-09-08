import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CheckoutItem {
  id: string;
  projectId: string;
  projectName: string;
  projectFirstImage?: string;
  unitId: string;
  unitTitle: string;
  image: string;
  bathrooms: number;
  bedrooms: number;
  builtArea: string;
  completion: string;
  price: number;
}

export interface CheckoutProject {
  id: string;
  name: string;
  firstImage?: string;
}

export type AddItemResult =
  | "success"
  | "already_exists"
  | "different_project"
  | "max_units_reached";

interface CheckoutStore {
  items: CheckoutItem[];
  currentProject: CheckoutProject | null;

  // Actions
  addItem: (item: CheckoutItem) => AddItemResult;
  removeItem: (itemId: string) => void;
  clearCheckout: () => void;
  canAddProject: (projectId: string) => boolean;
  getTotalPrice: () => number;
  getItemCount: () => number;
}

export const useCheckoutStore = create<CheckoutStore>()(
  persist(
    (set, get) => ({
      items: [],
      currentProject: null,

      addItem: (item: CheckoutItem): AddItemResult => {
        const state = get();

        // Verificar si ya existe el item
        const existingItem = state.items.find((i) => i.id === item.id);
        if (existingItem) {
          return "already_exists";
        }

        // Verificar si se puede agregar el proyecto
        if (!state.canAddProject(item.projectId)) {
          return "different_project";
        }

        // Verificar límite máximo de 2 unidades
        if (state.items.length >= 2) {
          return "max_units_reached";
        }

        set((state) => ({
          items: [...state.items, item],
          currentProject: state.currentProject || {
            id: item.projectId,
            name: item.projectName,
            firstImage: item.projectFirstImage,
          },
        }));

        return "success";
      },

      removeItem: (itemId: string) => {
        set((state) => {
          const newItems = state.items.filter((item) => item.id !== itemId);
          return {
            items: newItems,
            currentProject: newItems.length === 0 ? null : state.currentProject,
          };
        });
      },

      clearCheckout: () => {
        set({
          items: [],
          currentProject: null,
        });
      },

      canAddProject: (projectId: string) => {
        const state = get();
        return (
          state.currentProject === null || state.currentProject.id === projectId
        );
      },

      getTotalPrice: () => {
        return get().items.reduce((total, item) => total + item.price, 0);
      },

      getItemCount: () => {
        return get().items.length;
      },
    }),
    {
      name: "checkout-storage",
      version: 1,
    },
  ),
);
