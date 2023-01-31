import React from 'react'
import { useContract,useContractRead } from "@thirdweb-dev/react"
import Countdown from 'react-countdown'

type Props = {
    hours: number;
    minutes: number;
    seconds: number;
    completed: boolean;
}

function CountdownTimer() {
    const { contract,isLoading} = useContract(process.env.NEXT_PUBLIC_LOTTERY_CONTRACT_ADDRESS)
    const { data: expiration } = useContractRead(contract, 'expiration')

    const renderer = ({ hours, minutes, seconds, completed }: Props) => {
        if(completed){
            return(
                <div>
                    <h2 className='text-white text-xl text-center animate-bounce'>Ticket Sales have now CLOSED for this draw</h2>
                    <div className='flex space-x-6'>
                        <div className='flex-1'>
                            <h3 className='countdown animate-pulse'>{hours}</h3>
                            <p className='countdown-label'>Hours</p>
                        </div>
                        <div className='flex-1'>
                            <h3 className='countdown animate-pulse'>{minutes}</h3>
                            <p className='countdown-label'>Minutes</p>
                        </div>
                        <div className='flex-1'>
                            <h3 className='countdown animate-pulse'>{seconds}</h3>
                            <p className='countdown-label'>Seconds</p>
                        </div>
                    </div>
                </div>
            )
        }else{
            return(
                <div>
                    <h3 className='text-white text-sm mb-2 italic'>Ticket Sales close in</h3>
                    <div className='flex space-x-6'>
                        <div className='flex-1'>
                            <h3 className='countdown'>{hours}</h3>
                            <p className='countdown-label'>Hours</p>
                        </div>
                        <div className='flex-1'>
                            <h3 className='countdown'>{minutes}</h3>
                            <p className='countdown-label'>Minutes</p>
                        </div>
                        <div className='flex-1'>
                            <h3 className='countdown'>{seconds}</h3>
                            <p className='countdown-label'>Seconds</p>
                        </div>
                    </div>
                </div>
            )
        }
    }

  return (
    <div>
        <Countdown date={new Date(expiration * 1000)} renderer={renderer}/>
    </div>
  )
}

export default CountdownTimer