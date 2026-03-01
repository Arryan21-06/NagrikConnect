import { useState } from 'react'

import { createBrowserRouter,RouterProvider } from 'react-router-dom'
import Home from "./components/home"
import './App.css'

function App() {
  const router = createBrowserRouter([
    {
      path:"/",
      element:<Home/>
    }
  ])
  const [count, setCount] = useState(0)

  return (
    <>
      <RouterProvider router={router}/>
    </>
  )
}

export default App
