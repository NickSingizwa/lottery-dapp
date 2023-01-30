import React from 'react'
import { useMetamask } from "@thirdweb-dev/react"

function Login() {
    const connectWithMeta = useMetamask();
  return (

    <div className='bg-[#091B1B] min-h-screen flex flex-col items-center justify-center text-center'>
        <div className='flex flex-col items-center mb-10'>
            <img className='rounded-full h-56 w-56 mb-18' src="https://avatars.githubusercontent.com/u/74837665?v=4" alt="" />
            <h1 className='text-6xl text-white font-bold'>LOTTERY DAPP</h1>
            <h2 className='text-white'>Get Started By logging in with your MetaMask</h2>
            <button onClick={connectWithMeta} className='bg-gradient-to-r from-purple-500 to-pink-500 text-[#091B1B] px-8 py-5 mt-10 rounded-lg shadow-lg font-bold'> Login with Metamask</button>
        </div>
    </div>
  )
}

export default Login