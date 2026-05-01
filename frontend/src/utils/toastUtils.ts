import { toast } from 'react-toastify';
import type { ToastOptions } from 'react-toastify';

const defaultOptions: ToastOptions = {
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
};

/**
 * Notifica sucesso ao usuário
 */
export const toastSuccess = (message: string, options?: ToastOptions) => {
  toast.success(message, { ...defaultOptions, ...options });
};

/**
 * Notifica erro ao usuário
 */
export const toastError = (message: string, options?: ToastOptions) => {
  toast.error(message, { ...defaultOptions, ...options });
};

/**
 * Notifica aviso ao usuário
 */
export const toastWarning = (message: string, options?: ToastOptions) => {
  toast.warning(message, { ...defaultOptions, ...options });
};

/**
 * Notifica informação ao usuário
 */
export const toastInfo = (message: string, options?: ToastOptions) => {
  toast.info(message, { ...defaultOptions, ...options });
};

/**
 * Executa uma promise com notificações de loading, sucesso e erro
 */
export const toastPromise = (
  promise: Promise<unknown>,
  messages: {
    pending: string;
    success: string;
    error: string;
  },
  options?: ToastOptions
): Promise<unknown> => {
  return toast.promise(promise, messages, { ...defaultOptions, ...options });
};

/**
 * Trata erro de API e mostra mensagem apropriada
 */
export const handleApiError = (error: any, defaultMessage: string = "Erro ao processar requisição") => {
  const errorMessage = error?.response?.data?.message || error?.message || defaultMessage;
  toastError(errorMessage);
};
