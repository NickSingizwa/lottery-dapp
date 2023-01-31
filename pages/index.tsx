import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import Header from '../components/Header'
import { useContract,useMetamask,useAddress,useDisconnect,useContractRead,useContractWrite } from "@thirdweb-dev/react"
import Login from '../components/Login'
import Loading from '../components/Loading'
import { useEffect, useState } from 'react'
import { ethers } from 'ethers'
import { currency } from '../constants'
import CountdownTimer from '../components/CountdownTimer'
import toast from 'react-hot-toast'

const Home: NextPage = () => {
  const [quantity,setQuantity] = useState<number>(1)
  const [userTickets,setUserTickets] = useState(0)

  //solidity functions from the contract I deployed on thirdweb
  const address = useAddress();
  const { contract,isLoading} = useContract(process.env.NEXT_PUBLIC_LOTTERY_CONTRACT_ADDRESS)
  const { data: remainingTickets } = useContractRead(contract, 'RemainingTickets')
  const { data: currentWinningReward } = useContractRead(contract, 'CurrentWinningReward')
  const { data: ticketPrice } = useContractRead(contract, 'ticketPrice')
  const { data: ticketCommission } = useContractRead(contract, 'ticketCommission')
  const { data: expiration } = useContractRead(contract, 'expiration')
  const { data: tickets } = useContractRead(contract, 'getTickets')
  const { data: winnings } = useContractRead(contract, 'getWinningsForAddress',address)
  const { mutateAsync: BuyTickets } = useContractWrite(contract, 'BuyTickets')
  const { mutateAsync: WithdrawWinnings } = useContractWrite(contract, 'WithdrawWinnings')

  useEffect(()=>{
    if(!tickets) return
    const totalTickets: string[] = tickets
    const noOfUserTickets = totalTickets.reduce((total,ticketAddress)=>(ticketAddress === address ? total+1 : total),0)
    setUserTickets(noOfUserTickets)
  },[tickets,address])

  const handleClick = async () => {
    if (!ticketPrice) return
    const notification = toast.loading('Buying tickets...')
    try{
      const data = await BuyTickets([
        {
          value: ethers.utils.parseEther((Number(ethers.utils.formatEther(ticketPrice))*quantity).toString()),
        }
      ])
      toast.success("Tickets bought successfully",{id: notification})
    }catch(err){
      toast.error("whoops something went wrong",{
        id: notification
      })
    }
  }

  const onWithdrawWinnings = async () => {
    const notification = toast.loading('Withdrawing winnings...')
    try{
      const data = await WithdrawWinnings([{}])
      toast.success("Winnings withdrawn successfully",{id: notification})
    }catch(err){
      toast.error("whoops something went wrong",{
        id: notification
      })
    }
  }

  if (isLoading ) return <Loading/>
    
  if (!address) return <Login/>

  return (
    <div className="bg-[#091818] min-h-screen flex flex-col">
      <Head>
        <title>Lottery dapp</title>
        {/* <link rel="icon" href="/favicon.ico" /> */}
      </Head>

      <div className='flex-1'>
      <Header/>

      {winnings > 0 && (
        <div className='max-w-md md:max-w-2xl lg:max-w-4xl mx-auto mt-5'>
          <button onClick={onWithdrawWinnings} className='p-5 bg-gradient-to-b from-orange-500 to-emerald-600 animate-pulse text-center rounded-xl w-full'>
            <p className='font-bold'>Winner Winner Chicken Dinner!</p>
            <p>Total Winnings: {ethers.utils.formatEther(winnings.toString())}{" "}{currency}</p>
            <br />
            <p className='font-semibold'>Click here to withdraw</p>
          </button>
        </div>
      )}

      <div className='space-y-5 md:space-y-0 m-5 md:flex md:flex-row items-start justify-center md:space-x-5'>
        <div className='stats-container'>
            <h1 className='text-5xl text-white font-semibold text-center'>The Next Draw</h1>
        <div className='flex justify-between p-2 space-x-2'>
          <div className='stats'>
            <h2 className='text-sm'>Total Pool</h2>
            <p>{currentWinningReward && ethers.utils.formatEther(currentWinningReward.toString())} {" "}{currency}</p>
          </div>
          <div className="stats">
            <h2 className='text-sm'>Tickets Remaining</h2>
            <p className='text-xl'>{remainingTickets?.toNumber()}</p>
          </div>
        </div>

      {/* countdown */}
      <div className='mt-5 mb-3'>
        <CountdownTimer/>
      </div>

      </div>

      <div className='stats-container space-y-2'>
        <div className="stats-container">
          <div className='flex justify-between items-center text-white pb-2'>
            <h2>Price per ticket</h2>
            <p>{ticketPrice && ethers.utils.formatEther(ticketPrice.toString())} {" "}{currency}</p>
          </div>

          <div className='flex text-white items-center space-x-2 bg-[#091818] border-[#004337] border p-4'>
            <p>TICKETS</p>
            <input value={quantity} onChange={e=>setQuantity(Number(e.target.value))} min={1} max={10} className='flex w-full bg-transparent text-right outline-none' type="number" />
          </div>

          <div className='space-y-2 mt-5'>
            <div className='flex items-center justify-between text-emerald-300 text-sm italic font-extrabold'>
              <p>Total cost of tickets</p>
              <p>{ticketPrice && Number(ethers.utils.formatEther(ticketPrice.toString())) * quantity} {" "}{currency}</p>
            </div>
            <div className='flex items-center justify-between text-emerald-300 text-xs italic'>
              <p>Service fees</p>
              <p>{ticketCommission && ethers.utils.formatEther(ticketCommission.toString())} {" "}{currency}</p>
            </div>
            <div className='flex items-center justify-between text-emerald-300 text-xs italic'>
              <p>+ Network Fees</p>
              <p>TBC</p>
            </div>
          </div>
          <button onClick={handleClick} disabled={expiration?.toString() < Date.now().toString() || remainingTickets?.toNumber() === 0} className='mt-5 w-full font-semibold bg-gradient-to-br from-orange-500 to-emerald-600 px-10 py-5 rounded-md text-white shadow-xl disabled:from-gray-700 disabled:to-gray-500 disabled:text-gray-100 disabled:cursor-not-allowed'>Buy {quantity} tickets</button>
        </div>

        {userTickets > 0 && <div className='stats'>
            <p className='text-lg mb-2'>you have {userTickets} Tickets in this draw</p>
            <div className='flex max-w-sm flex-wrap gap-x-2 gap-y-2'>
              {Array(userTickets).fill("").map((_,index)=>(       //_ for ignoring the normal parameter and taking only the index
                <p className='text-emerald-300 h-20 w-12 bg-emerald-500/30 rounded-lg flex flex-shrink-0 items-center justify-center text-xs italic' key={index}>{index + 1}</p>
              ))}
            </div>
          </div>}

      </div>
      </div>
      </div>

    </div>
  )
}

export default Home
