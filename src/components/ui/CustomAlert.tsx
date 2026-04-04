import { X, WarningCircle } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

type CustomAlertProps = {
  isOpen: boolean
  title?: string
  message: string
  type?: 'alert' | 'confirm'
  onConfirm: () => void
  onCancel: () => void
}

export function CustomAlert({
  isOpen,
  title = 'تنبيه',
  message,
  type = 'alert',
  onConfirm,
  onCancel,
}: CustomAlertProps) {
  if (!isOpen) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      dir="rtl"
    >
      <div className="w-full max-w-sm animate-in fade-in zoom-in-95 rounded-3xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-center gap-3">
          <div
            className={cn(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
              type === 'confirm' ? 'bg-red-600' : 'bg-[#2563EB]'
            )}
            {...(type === 'confirm' ? {} : { 'aria-label': 'Plenvo' })}
          >
            {type === 'confirm' ? (
              <WarningCircle weight="fill" className="h-5 w-5 text-white" aria-hidden />
            ) : (
              <span className="text-xl font-black tracking-tight text-white" aria-hidden>
                P
              </span>
            )}
          </div>

          <h3 className="text-lg font-bold text-gray-900">{title}</h3>

          <button
            type="button"
            onClick={onCancel}
            className="mr-auto rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <X weight="bold" className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-8 rounded-xl bg-gray-50 p-4 text-sm font-medium leading-relaxed text-gray-600">{message}</div>

        <div className="flex items-center justify-end gap-3">
          {type === 'confirm' && (
            <button
              type="button"
              onClick={onCancel}
              className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-bold text-gray-700 transition-colors hover:bg-gray-50"
            >
              إلغاء
            </button>
          )}

          <button
            type="button"
            onClick={onConfirm}
            className={cn(
              'rounded-xl px-5 py-2.5 text-sm font-bold text-white transition-colors shadow-sm',
              type === 'confirm' ? 'bg-red-600 hover:bg-red-700' : 'bg-[#2563EB] hover:bg-[#1D4ED8]'
            )}
          >
            {type === 'confirm' ? 'تأكيد الحذف' : 'حسناً'}
          </button>
        </div>
      </div>
    </div>
  )
}

