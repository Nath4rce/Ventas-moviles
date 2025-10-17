import { useNotificacionStore } from '../stores/notificacion'

export function useNotificacion() {
  const store = useNotificacionStore()
  return {
    success: (message, title) => store.success(message, title),
    error: (message, title) => store.error(message, title),
    info: (message, title) => store.info(message, title),
    warning: (message, title) => store.warning(message, title)
  }
}


