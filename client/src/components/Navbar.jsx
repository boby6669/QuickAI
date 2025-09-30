// import React from 'react'
// import { assets } from '../assets/assets'
// import { useNavigate } from 'react-router-dom'
// import { ArrowRight } from 'lucide-react'
// import { useClerk, UserButton, useUser } from '@clerk/clerk-react'

// const Navbar = () => {

//     const navigate = useNavigate()
//     const { user } = useUser()
//     const { openSignIn } = useClerk()

//     return (
//         <div className='fixed z-5 w-full backdrop-blur-2xl flex
//             justify-between items-center py-3 px-4 sm:px-20 xl:px-32 cursor-pointer'>
//             <img src={assets.logo} alt="logo" className='w-32 sm:w-44' onClick={() => navigate('/')} />

//             {
//                 user ? <UserButton />
//                     :
//                     (
//                         <button onClick={openSignIn} className='flex items-center gap-2 rounded-full text-sm cursor-pointer bg-primary text-black px-10 py-2.5' > Get started  <ArrowRight className='w-4 h-4' /> </button>
//                     )
//             }
//         </div>
//     )
// }

// export default Navbar



import React from 'react'
import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useClerk, UserButton, useUser } from '@clerk/clerk-react'

const Navbar = () => {
  const navigate = useNavigate()
  const { user } = useUser()
  const { openSignIn } = useClerk()

  const handleSignIn = () => {
    openSignIn({
      afterSignInUrl: '/',
      afterSignUpUrl: '/',
    })
  }

  return (
    <div className="fixed z-20 w-full backdrop-blur-2xl flex justify-between items-center py-3 px-4 sm:px-20 xl:px-32 cursor-pointer">
      <img
        src={assets.logo}
        alt="logo"
        className="w-32 sm:w-44"
        onClick={() => navigate('/')}
      />

      {user ? (
        <UserButton afterSignOutUrl="/" />
      ) : (
        <button
          onClick={handleSignIn}
          className="flex items-center gap-2 rounded-full text-sm cursor-pointer bg-primary text-black px-10 py-2.5"
        >
          Get started <ArrowRight className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}

export default Navbar

