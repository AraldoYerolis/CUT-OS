import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { App } from './app/App'
import './styles/reset.css'
import './styles/tokens.css'
import './styles/global.css'
import './features/food-input/registerHandlers'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter basename="/CUT-OS">
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
