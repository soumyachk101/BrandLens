import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AgencyState {
 agency: any | null;
 brands: any[];
 isLoading: boolean;
 setAgency: (agency: any | null) => void;
 setBrands: (brands: any[]) => void;
 setLoading: (loading: boolean) => void;
}

export const useAgencyStore = create<AgencyState>()(
 persist(
 (set) => ({
 agency: null,
 brands: [],
 isLoading: false,
 setAgency: (agency) => set({ agency }),
 setBrands: (brands) => set({ brands }),
 setLoading: (isLoading) => set({ isLoading }),
 }),
 {
 name: 'agency-storage',
 }
 )
);
