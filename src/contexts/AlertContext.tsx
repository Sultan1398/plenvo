'use client'

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { CustomAlert } from '@/components/ui/CustomAlert'
import { useLanguage } from '@/contexts/LanguageContext'

export type AlertOptions = {
  title?: string
  message: string
  type?: 'alert' | 'confirm'
  onConfirm?: () => void | Promise<void>
  onCancel?: () => void
}

type AlertContextType = {
  showAlert: (options: AlertOptions) => void
  closeAlert: () => void
}

const AlertContext = createContext<AlertContextType | undefined>(undefined)

export function AlertProvider({ children }: { children: ReactNode }) {
  const { t } = useLanguage()
  const [alertConfig, setAlertConfig] = useState<AlertOptions & { isOpen: boolean }>({
    isOpen: false,
    message: '',
    type: 'alert',
  })

  const closeAlert = useCallback(() => {
    setAlertConfig((prev) => ({ ...prev, isOpen: false }))
  }, [])

  const showAlert = useCallback((options: AlertOptions) => {
    setAlertConfig({
      ...options,
      isOpen: true,
      type: options.type ?? 'alert',
    })
  }, [])

  const handleConfirm = useCallback(() => {
    void Promise.resolve(alertConfig.onConfirm?.())
    closeAlert()
  }, [alertConfig.onConfirm, closeAlert])

  const handleCancel = useCallback(() => {
    alertConfig.onCancel?.()
    closeAlert()
  }, [alertConfig.onCancel, closeAlert])

  const value = useMemo(() => ({ showAlert, closeAlert }), [showAlert, closeAlert])

  return (
    <AlertContext.Provider value={value}>
      {children}
      <CustomAlert
        isOpen={alertConfig.isOpen}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type ?? 'alert'}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        confirmLabel={t('تأكيد الحذف', 'Confirm Delete')}
        okLabel={t('حسناً', 'OK')}
      />
    </AlertContext.Provider>
  )
}

export function useAlert() {
  const ctx = useContext(AlertContext)
  if (!ctx) throw new Error('useAlert must be used within an AlertProvider')
  return ctx
}

