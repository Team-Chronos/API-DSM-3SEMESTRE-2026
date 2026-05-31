import { type ReactNode } from "react"

interface ModalProps {
  open: boolean
  onClose: () => void
  children: ReactNode
}

function Modal({ open, onClose, children }: ModalProps) {

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-3 sm:items-center sm:p-4">
      
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      <div className="relative my-3 w-full max-w-[min(96vw,560px)] max-h-[94vh] overflow-y-auto rounded-2xl bg-mist-900 p-3 shadow-xl sm:my-0 sm:p-4">

        <button
          onClick={onClose}
          className="absolute right-3 top-3 cursor-pointer px-1 text-zinc-500 hover:text-zinc-200 sm:right-4 sm:top-4"
          >
          ✕
        </button>
          
        {children}
      </div>
    </div>
  )
}

export default Modal