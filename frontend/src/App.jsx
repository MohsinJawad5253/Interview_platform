
import { SignedIn, SignedOut, SignInButton, SignOutButton, UserButton, useUser } from '@clerk/clerk-react'
import { Navigate, Route, Routes } from 'react-router'
import HomePage from './pages/HomePage'
import ProblemsPage from './pages/ProblemsPage'
import DashBoard from './pages/Dashboard'
import { Toaster } from 'react-hot-toast'

function App() {

  const { isSignedIn , isLoaded} = useUser()

  if(!isLoaded) return null

  return (
    <>
      <Routes className='bg-black h-screen p-10'>
        <Route path="/" element={!isSignedIn ? <HomePage /> : <Navigate to={"/dashboard"}/>} />
        <Route path="/dashboard" element={isSignedIn? <DashBoard /> : <Navigate to={"/"}/>} />
        <Route path="/problems" element={isSignedIn ? <ProblemsPage /> : <Navigate to={"/"} />} />
      </Routes>
      <Toaster />
    </>
  )
}

export default App
