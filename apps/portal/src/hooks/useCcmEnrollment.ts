import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  updateMockEnrollment,
  addMockCcmPatient,
  getMockDevices,
  addMockDevice,
  updateMockDeviceStatus,
} from '@/lib/ccm-rpm-mock-data';
import type {
  CcmEnrollment,
  CcmDevice,
  CcmDeviceType,
  CcmDeviceStatus,
  CcmPatientWithEnrollment,
} from '@/types/ccm-rpm';

// ─── Enrollment Mutations ────────────────────────────────────────

interface EnrollmentUpdate {
  enrollmentId: string;
  updates: Partial<CcmEnrollment>;
}

export function useCcmUpdateEnrollment() {
  const queryClient = useQueryClient();

  return useMutation<CcmEnrollment | null, Error, EnrollmentUpdate>({
    mutationFn: async ({ enrollmentId, updates }) => {
      await new Promise((r) => setTimeout(r, 200));
      return updateMockEnrollment(enrollmentId, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ccm'] });
    },
  });
}

// ─── Add Patient ─────────────────────────────────────────────────

export function useCcmAddPatient() {
  const queryClient = useQueryClient();

  return useMutation<CcmPatientWithEnrollment, Error, Parameters<typeof addMockCcmPatient>[0]>({
    mutationFn: async (data) => {
      await new Promise((r) => setTimeout(r, 200));
      return addMockCcmPatient(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ccm'] });
    },
  });
}

// ─── Devices Query ───────────────────────────────────────────────

export function useCcmDevices(enrollmentId: string) {
  return useQuery<CcmDevice[]>({
    queryKey: ['ccm', 'devices', enrollmentId],
    queryFn: () => getMockDevices(enrollmentId),
    staleTime: 30_000,
    enabled: !!enrollmentId,
  });
}

// ─── Add Device ──────────────────────────────────────────────────

interface DeviceAdd {
  enrollment_id: string;
  device_type: CcmDeviceType;
  assigned_date: string;
  notes?: string;
}

export function useCcmAddDevice() {
  const queryClient = useQueryClient();

  return useMutation<CcmDevice, Error, DeviceAdd>({
    mutationFn: async (data) => {
      await new Promise((r) => setTimeout(r, 150));
      return addMockDevice(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ccm'] });
    },
  });
}

// ─── Update Device Status ────────────────────────────────────────

interface DeviceStatusUpdate {
  deviceId: string;
  status: CcmDeviceStatus;
}

export function useCcmUpdateDeviceStatus() {
  const queryClient = useQueryClient();

  return useMutation<CcmDevice | null, Error, DeviceStatusUpdate>({
    mutationFn: async ({ deviceId, status }) => {
      await new Promise((r) => setTimeout(r, 150));
      return updateMockDeviceStatus(deviceId, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ccm'] });
    },
  });
}
