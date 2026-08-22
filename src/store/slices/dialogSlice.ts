export function createDialogSlice(set: any) {
  return {
    toast: null as any,
    showToast(message: string, type: "info" | "success" | "error" = "info") {
      set({ toast: { message, type } })
      setTimeout(() => {
        set((state: any) => (state.toast?.message === message ? { toast: null } : state))
      }, 3000)
    },
    confirmDialog: null as any,
    setConfirmDialog(confirmDialog: any) { set({ confirmDialog }) },
  }
}
