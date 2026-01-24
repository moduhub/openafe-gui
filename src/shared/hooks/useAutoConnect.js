import { useEffect } from 'react'
import { useSettingsContext } from '../contexts'
import { useArduinoContext } from '../contexts'

/**
 * Hook para gerenciar a funcionalidade de auto-connect com Arduino
 * 
 * Comportamento:
 * - Sincroniza o estado de autoConnect do SettingsContext com o Electron main process
 * - Escuta eventos de detecção automática de Arduino
 * - Atualiza a porta conectada quando Arduino é detectado automaticamente
 * - Limpa listeners quando o componente é desmontado
 * 
 * @returns {void}
 */
export const useAutoConnect = () => {
  const { autoConnect } = useSettingsContext()
  const { handleSetPortConnected, handleSetIsConnecting } = useArduinoContext()

  // Sincronizar auto-connect com o Electron
  useEffect(() => {
    if (window.electron && window.electron.setAutoConnect) {
      window.electron.setAutoConnect(autoConnect)
      //console.log(`Auto-connect feature ${autoConnect ? 'enabled' : 'disabled'}`)
    }
  }, [autoConnect])

  // Escutar eventos de auto-conexão
  useEffect(() => {
    if (!window.electron) return

    // Listener para evento de auto-connect
    const unsubscribeAutoConnectEvent = window.electron.onAutoConnectEvent?.((data) => {
      //console.log('Auto-connect event received:', data)
      if (data.status === 'connecting') {
        handleSetIsConnecting?.(true)
      }
    })

    // Listener para evento de porta conectada
    const unsubscribePortConnected = window.electron.onPortConnected?.((port) => {
      //console.log('Port connected via auto-connect:', port)
      handleSetPortConnected?.(port)
      handleSetIsConnecting?.(false)
    })

    // Cleanup
    return () => {
      unsubscribeAutoConnectEvent?.()
      unsubscribePortConnected?.()
    }
  }, [handleSetPortConnected, handleSetIsConnecting])
}
