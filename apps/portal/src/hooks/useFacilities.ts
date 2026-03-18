/**
 * React Query hooks for Facility Directory CRUD operations.
 * Currently uses mock data — swap queryFn bodies to Supabase in Phase 7.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  Facility,
  FacilityContact,
  FacilityNote,
  FacilityCensus,
  FacilityType,
  FacilityStatus,
} from '@/types/mobile-docs';
import type { FacilityFormData, ContactFormData, NoteFormData, CensusFormData } from '@/schemas/facilitySchema';
import {
  getMockFacilities,
  getMockFacilityById,
  getMockFacilityContacts,
  getMockFacilityNotes,
  getMockFacilityCensus,
  addMockFacility,
  updateMockFacility,
  archiveMockFacility,
  addMockContact,
  addMockNote,
  updateMockContact,
  deleteMockContact,
  setMockPrimaryContact,
  toggleMockNotePin,
  addMockCensus,
} from '@/lib/mobile-docs-mock-data';

// ─── Filter Types ──────────────────────────────────────────────────

export interface FacilityFilters {
  search?: string;
  type?: FacilityType | 'all';
  status?: FacilityStatus | 'all';
  sortColumn?: 'name' | 'patients' | 'distance' | 'updated_at';
  sortDirection?: 'asc' | 'desc';
  showArchived?: boolean;
}

// ─── Queries ───────────────────────────────────────────────────────

export function useFacilities(filters: FacilityFilters = {}) {
  return useQuery({
    queryKey: ['facilities', filters],
    queryFn: async () => {
      let facilities = getMockFacilities();

      // Filter archived
      if (!filters.showArchived) {
        facilities = facilities.filter((f) => !f.is_archived);
      }

      // Filter by type
      if (filters.type && filters.type !== 'all') {
        facilities = facilities.filter((f) => f.type === filters.type);
      }

      // Filter by status
      if (filters.status && filters.status !== 'all') {
        facilities = facilities.filter((f) => f.status === filters.status);
      }

      // Search
      if (filters.search) {
        const q = filters.search.toLowerCase();
        facilities = facilities.filter(
          (f) =>
            f.name.toLowerCase().includes(q) ||
            f.address_line1.toLowerCase().includes(q) ||
            f.city.toLowerCase().includes(q)
        );
      }

      // Sort
      const col = filters.sortColumn || 'name';
      const dir = filters.sortDirection || 'asc';
      facilities.sort((a, b) => {
        let cmp = 0;
        switch (col) {
          case 'name':
            cmp = a.name.localeCompare(b.name);
            break;
          case 'distance':
            cmp = (a.distance_miles ?? 999) - (b.distance_miles ?? 999);
            break;
          case 'updated_at':
            cmp = new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
            break;
          case 'patients':
            // Will be sorted by census data in the component if needed
            cmp = a.name.localeCompare(b.name);
            break;
        }
        return dir === 'desc' ? -cmp : cmp;
      });

      return facilities;
    },
    staleTime: 30_000,
  });
}

export function useFacility(id: string | null) {
  return useQuery({
    queryKey: ['facility', id],
    queryFn: async () => {
      if (!id) return null;
      return getMockFacilityById(id) ?? null;
    },
    enabled: !!id,
    staleTime: 30_000,
  });
}

export function useFacilityContacts(facilityId: string | null) {
  return useQuery({
    queryKey: ['facility-contacts', facilityId],
    queryFn: async () => {
      if (!facilityId) return [];
      return getMockFacilityContacts(facilityId);
    },
    enabled: !!facilityId,
    staleTime: 30_000,
  });
}

export function useFacilityNotes(facilityId: string | null) {
  return useQuery({
    queryKey: ['facility-notes', facilityId],
    queryFn: async () => {
      if (!facilityId) return [];
      return getMockFacilityNotes(facilityId);
    },
    enabled: !!facilityId,
    staleTime: 30_000,
  });
}

export function useFacilityCensus(facilityId: string | null) {
  return useQuery({
    queryKey: ['facility-census', facilityId],
    queryFn: async () => {
      if (!facilityId) return null;
      return getMockFacilityCensus(facilityId) ?? null;
    },
    enabled: !!facilityId,
    staleTime: 30_000,
  });
}

// ─── Mutations ─────────────────────────────────────────────────────

export function useCreateFacility() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: FacilityFormData) => {
      const posCodeMap: Record<string, number> = { SNF: 32, 'Board & Care': 33, Homebound: 99 };
      return addMockFacility({
        name: data.name,
        type: data.type,
        status: data.status,
        address_line1: data.address_line1,
        address_line2: data.address_line2 || null,
        city: data.city,
        state: data.state,
        zip: data.zip,
        latitude: 34.15,
        longitude: -118.14,
        phone: data.phone || null,
        total_beds: data.type === 'Homebound' ? null : (data.total_beds ?? null),
        pos_code: data.pos_code ?? posCodeMap[data.type] ?? null,
        distance_miles: null,
        drive_minutes: null,
        visit_cadence: data.visit_cadence,
        assigned_provider_id: data.assigned_provider_id || null,
        is_archived: false,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['facilities'] });
    },
  });
}

export function useUpdateFacility() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<FacilityFormData> }) => {
      const result = updateMockFacility(id, data as Partial<Facility>);
      if (!result) throw new Error('Facility not found');
      return result;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['facilities'] });
      queryClient.invalidateQueries({ queryKey: ['facility', variables.id] });
    },
  });
}

export function useArchiveFacility() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const ok = archiveMockFacility(id);
      if (!ok) throw new Error('Facility not found');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['facilities'] });
    },
  });
}

export function useCreateContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ facilityId, data }: { facilityId: string; data: ContactFormData }) => {
      return addMockContact(facilityId, {
        name: data.name,
        role: data.role,
        title: null,
        phone: data.phone || null,
        email: data.email || null,
        is_primary: false,
        contact_type: data.contact_type,
        notes: null,
      });
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['facility-contacts', variables.facilityId] });
    },
  });
}

export function useCreateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ facilityId, data }: { facilityId: string; data: NoteFormData }) => {
      return addMockNote(facilityId, {
        author_id: 'admin-0000-0000-0000-000000000001',
        author_name: 'Current User',
        note_type: data.note_type,
        content: data.content,
        is_pinned: false,
      });
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['facility-notes', variables.facilityId] });
    },
  });
}

export function useUpdateContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ contactId, facilityId, data }: { contactId: string; facilityId: string; data: ContactFormData }) => {
      const result = updateMockContact(contactId, {
        name: data.name,
        role: data.role,
        contact_type: data.contact_type,
        phone: data.phone || null,
        email: data.email || null,
      });
      if (!result) throw new Error('Contact not found');
      return result;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['facility-contacts', variables.facilityId] });
    },
  });
}

export function useDeleteContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ contactId }: { contactId: string; facilityId: string }) => {
      const ok = deleteMockContact(contactId);
      if (!ok) throw new Error('Contact not found');
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['facility-contacts', variables.facilityId] });
    },
  });
}

export function useSetPrimaryContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ facilityId, contactId }: { facilityId: string; contactId: string }) => {
      const ok = setMockPrimaryContact(facilityId, contactId);
      if (!ok) throw new Error('Contact not found');
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['facility-contacts', variables.facilityId] });
    },
  });
}

export function useToggleNotePin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ noteId }: { noteId: string; facilityId: string }) => {
      const result = toggleMockNotePin(noteId);
      if (!result) throw new Error('Note not found');
      return result;
    },
    onMutate: async ({ noteId, facilityId }) => {
      await queryClient.cancelQueries({ queryKey: ['facility-notes', facilityId] });
      const prev = queryClient.getQueryData<FacilityNote[]>(['facility-notes', facilityId]);
      if (prev) {
        queryClient.setQueryData<FacilityNote[]>(
          ['facility-notes', facilityId],
          prev.map((n) => (n.id === noteId ? { ...n, is_pinned: !n.is_pinned } : n))
        );
      }
      return { prev };
    },
    onError: (_err, variables, context) => {
      if (context?.prev) {
        queryClient.setQueryData(['facility-notes', variables.facilityId], context.prev);
      }
    },
    onSettled: (_data, _err, variables) => {
      queryClient.invalidateQueries({ queryKey: ['facility-notes', variables.facilityId] });
    },
  });
}

export function useCreateCensus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ facilityId, data }: { facilityId: string; data: CensusFormData }) => {
      return addMockCensus(facilityId, {
        snapshot_date: new Date().toISOString().split('T')[0],
        active_patients: data.active_patients,
        new_admissions: data.new_admissions ?? 0,
        discharges: data.discharges ?? 0,
        ccm_enrolled: data.ccm_enrolled ?? 0,
        rpm_enrolled: data.rpm_enrolled ?? 0,
        awv_eligible: data.awv_eligible ?? 0,
        updated_by: 'admin-0000-0000-0000-000000000001',
      });
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['facility-census', variables.facilityId] });
    },
  });
}
