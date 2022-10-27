import {useEffect, useState} from "react";
import {
    useAccount,
    useContract,
    useContractEvent,
    useContractRead,
    useContractWrite,
    useWaitForTransaction
} from "@web3modal/react";
import TokenAbi from "./TokenAbi.json";
import {BigNumberish, utils, constants} from 'ethers';

function Token() {
    const [contractInfo, setContractInfo] = useState(null);
    const [eventData, setEventData] = useState<unknown>(undefined)
    const tokenContractAddress = '0x3eF1D482cB33a3a2C3B07e9A0e9bd8370abfdf83'
    const toAddress = '0xC6C28316A74504EBA2113b0929B1b09a4c7a09F1'
    const {account} = useAccount()
    const {contract, isReady} = useContract({
        address: tokenContractAddress,
        abi: TokenAbi
    })

    useContractEvent({
        address: tokenContractAddress,
        abi: TokenAbi,
        eventName: 'Sent',
        listener: (...event: unknown[]) => {
            setEventData(event)
        },
    })

    const readBalance = useContractRead({
        address: tokenContractAddress,
        abi: TokenAbi,
        functionName: 'balanceOf',
        args: [account.address],
        enabled: true
    })

    const name = useContractRead({
        address: tokenContractAddress,
        abi: TokenAbi,
        functionName: 'name'
    })

    const symbol = useContractRead({
        address: tokenContractAddress,
        abi: TokenAbi,
        functionName: 'symbol'
    })

    const send = useContractWrite({
        address: tokenContractAddress,
        abi: TokenAbi,
        functionName: 'send',
        args: [toAddress, utils.parseEther('1'), constants.HashZero]
    })
    const {receipt, isWaiting} = useWaitForTransaction({hash: send.data?.hash})
    if(send.error) {
        console.error('send.error: ', send.error)
    }
    return (
        <>
            <h1>Contract</h1>
            <h2>Address: {tokenContractAddress}</h2>
            <h2>Name: {name.data ? name.data as string : ''} - Symbol: {symbol.data ? symbol.data as string : ''} </h2>
            <h2>Balance: {readBalance.data ? utils.formatEther(readBalance.data as BigNumberish) : 0}</h2>
            <button onClick={() => {
                send.write().then(() => {
                    readBalance.refetch()
                })
            }}>Transfer 1 to {toAddress}</button>
            <h2>Is sending: {isWaiting.toString()}</h2>
            <h1>Event: {eventData ? JSON.stringify(eventData) : ''}</h1>
        </>
    )
}

export default Token;
