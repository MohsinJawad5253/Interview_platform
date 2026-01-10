import { useState } from 'react'

import './App.css'
import { SignedIn, SignedOut, SignInButton, SignOutButton, UserButton } from '@clerk/clerk-react'

function App() {
  

  return (
    <>
     Welcome 
    
       <SignedOut>
        <SignInButton mode='modal' />
       </SignedOut>
    

    <SignedIn>
      <SignOutButton />
    </SignedIn>

    <UserButton />
    </>
  )
}

export default App
