import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <h1 className="text-3xl font-bold underline text-amber-300">
      Hello, Vite + React!
    </h1>
  )
}

export default App
