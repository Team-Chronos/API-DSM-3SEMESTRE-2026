import { type ReactNode } from "react"

interface ModalProps {
  open: boolean
  onClose: () => void
  children: ReactNode
}

function Modal({ open, onClose, children }: ModalProps) {

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      <div className={`relative bg-mist-900 rounded-2xl shadow-xl min-w-sm p-4`}>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 cursor-pointer text-zinc-500 hover:text-zinc-200 px-1"
          >
          ✕
        </button>
          
        {children}
      </div>
    </div>
  )
}

export default Modal