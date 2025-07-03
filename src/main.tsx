import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './theme.css'
import { RouterProvider } from 'react-router-dom'
import { router } from './router'

import { Provider } from 'react-redux'
import store from './store'
import { WebSocketProvider } from './contexts/WebSocketContext'
import { PlayerProvider } from './contexts/PlayerContext'
import { initWebSocket } from './util/initWebSocket'

// Initialiser le WebSocket au démarrage de l'application
initWebSocket();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <PlayerProvider>
        <WebSocketProvider>
          <RouterProvider router={router}/>
        </WebSocketProvider>
      </PlayerProvider>
    </Provider>
  </StrictMode>,
)
