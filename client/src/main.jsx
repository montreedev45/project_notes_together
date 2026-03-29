import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom' // ✅ เพิ่มอันนี้
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter> {/* ✅ หุ้ม App ไว้ที่นี่ */}
      <App />
    </BrowserRouter>
  </StrictMode>,
)