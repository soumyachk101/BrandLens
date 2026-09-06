import { create } from "zustand";
import type { Agency, Brand, Plan, UserRole } from "@/types";

interface AgencyState {
 agency: Agency | null;
 brands: Brand[];
 isLoading: boolean;
 error: string | null;

 // Actions
 setAgency: (agency: Agency) => void;
 setBrands: (brands: Brand[]) => void;
 addBrand: (brand: Brand) => void;
 updateBrand: (id: string, updates: Partial<Brand>) => void;
 removeBrand: (id: string) => void;
 setLoading: (loading: boolean) => void;
 setError: (error: string | null) => void;
 reset: () => void;
}

const initialState = {
 agency: null,
 brands: [],
 isLoading: false,
 error: null,
};

export const useAgencyStore = create<AgencyState>((set) => ({
 ...initialState,

 setAgency: (agency) => set({ agency }),
 setBrands: (brands) => set({ brands }),

 addBrand: (brand) =>
 set((state) => ({
 brands: [...state.brands, brand],
 })),

 updateBrand: (id, updates) =>
 set((state) => ({
 brands: state.brands.map((b) =>
 b.id === id ? { ...b, ...updates } : b
 ),
 })),

 removeBrand: (id) =>
 set((state) => ({
 brands: state.brands.filter((b) => b.id !== id),
 })),

 setLoading: (isLoading) => set({ isLoading }),
 setError: (error) => set({ error }),
 reset: () => set(initialState),
}));
