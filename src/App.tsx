import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import Board from './components/Board'
import './App.css'

function App() {
  return (
    <div className="app">
      <h1>五子棋游戏</h1>
      <Board />
    </div>
  )
}

export default App
