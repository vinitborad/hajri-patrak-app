import { create } from 'zustand';

interface AttendanceStore {
  refetch: (() => void) | null; // To hold the refetch function
  setRefetch: (fn: () => void) => void; // To set the refetch function
  triggerRefetch: () => void; // To trigger the refetch function if it exists

  shouldRefresh: boolean; // To track if parent should refresh
  setShouldRefresh: (value: boolean) => void; // To update the refresh flag
}

export const useAttendanceStore = create<AttendanceStore>((set, get) => ({
  refetch: null,
  setRefetch: (fn) => set({ refetch: fn }),
  triggerRefetch: () => {
    const refetchFn = get().refetch;
    if (refetchFn) refetchFn();
  },

  shouldRefresh: false,
  setShouldRefresh: (value) => set({ shouldRefresh: value }),
}));
