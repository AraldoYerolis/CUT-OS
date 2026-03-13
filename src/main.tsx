import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { App } from './app/App'
import './styles/reset.css'
import './styles/tokens.css'
import './styles/global.css'
import { App } from './app/App'
import './features/food-input/registerHandlers'

const root = document.getElementById('root')
if (!root) throw new Error('Root element not found')

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter basename="/CUT-OS">
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
