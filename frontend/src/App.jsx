import { useState } from 'react'
import Login from "./components/auth/login"
import Signup from "./components/auth/signup"
import { createBrowserRouter,RouterProvider } from 'react-router-dom'
import Home from "./components/home"
import './App.css'

function App() {
  const router = createBrowserRouter([
    {
      path:"/",
      element:<Home/>
    },
    {
      path:"/login",
      element:<Login/>
    },
    {
      path:"/signup",
      element:<Signup/>
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
