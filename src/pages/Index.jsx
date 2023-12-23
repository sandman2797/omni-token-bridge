import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import contractAbi from "../../abi.json";

// ethers import removed
import {
  Box,
  Button,
  Container,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Select,
  Stack,
  useToast,
} from '@chakra-ui/react';
import { FaExchangeAlt, FaEthereum, FaWallet } from 'react-icons/fa';

const Index = () => {
  const [walletConnected, setWalletConnected] = useState(false);
  const [fromTokenAmount, setFromTokenAmount] = useState('');
const [toTokenAmount, setToTokenAmount] = useState('');
const [fromChain, setFromChain] = useState('arbitrum');
const [toChain, setToChain] = useState('bsc');
  const toast = useToast();

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        setWalletConnected(true);
        toast({
          title: 'Wallet Connected',
          description: 'Your MetaMask wallet has been connected successfully!',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to connect MetaMask wallet.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    } else {
      toast({
        title: 'Error',
        description: 'MetaMask is not installed!',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleChainChange = (chainType, value) => {
    if (chainType === 'from' && value === toChain) {
      toast({
        title: 'Invalid Selection',
        description: 'From and To chains cannot be the same.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    } else if (chainType === 'to' && value === fromChain) {
      toast({
        title: 'Invalid Selection',
        description: 'From and To chains cannot be the same.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (chainType === 'from') {
      setFromChain(value);
    } else {
      setToChain(value);
    }
  };

  // Duplicate handleChainChange function declaration removed

const contractAddresses = {
  ethereum: '0x9e20461bc2c4c980f62f1B279D71734207a6A356',
  polygon: '0x9e20461bc2c4c980f62f1B279D71734207a6A356',
  bsc: '0x9e20461bc2c4c980f62f1B279D71734207a6A356',
  arbitrum: '0x9e20461bc2c4c980f62f1B279D71734207a6A356',
  base: '0xC48E605c7b722a57277e087a6170B9E227e5AC0A',
};

const chainIdMapping = {
  ethereum: 101,
  polygon: 109,
  bsc: 102,
  arbitrum: 110,
  base: 184,
};


const swapTokens = async () => {
  // Assume we have the user's address from MetaMask
  const sendFromAmount = ethers.utils.parseEther('0.0005'); // Convert to wei
  const dstChainId = chainIdMapping[toChain];
  const contractAddress = contractAddresses[fromChain];
  const tokenAmount = fromTokenAmount;
if (typeof window.ethereum !== 'undefined') {
  // A web3 provider is detected
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  // const multipliedAmount = tokenAmount * 1e18;
  const multipliedAmount = ethers.utils.parseEther(tokenAmount);

// console.log({xmultipliedAmount, multipliedAmount})
  const userAddress = await provider.getSigner().getAddress();
  const contract = new ethers.Contract(contractAddress, contractAbi, provider.getSigner());
  const balance = await contract.balanceOf(userAddress);

  console.log('Contract Balance:', balance.toString());
  const callParams = {
    refundAddress: userAddress,
    zroPaymentAddress: "0x0000000000000000000000000000000000000000",
    adapterParams: "0x00010000000000000000000000000000000000000000000000000000000000030d40"
  };

  // Send the transaction
  console.log({
    sendFromAmount, userAddress, dstChainId, userAddress, multipliedAmount, callParams
  })

  const addressWithoutPrefix = userAddress.startsWith('0x') ? userAddress.slice(2) : userAddress;

  const convertedBytes32 = '0x' + '00'.repeat(12) + addressWithoutPrefix;

  const tx = await contract
    .sendFrom(userAddress, dstChainId, convertedBytes32, multipliedAmount, callParams, {
      value: sendFromAmount
    })

  // Wait for the transaction to be mined
  await tx.wait();

  // Transaction confirmed
  console.log('Transaction confirmed:', tx.hash);

  // Removed getContractInstance and updated swapTokens with mock contract interaction
// Rest of the code remains unchanged

  // Assuming the contract call is successful
  toast({
    title: 'Swap Successful',
    description: `Swapped ${fromTokenAmount} ETH for ${toTokenAmount} DAI`,
    status: 'success',
    duration: 3000,
    isClosable: true,
  });
} else {
  // No web3 provider detected, you can provide a message or use a fallback
  console.error('No web3 provider detected');
}

};

  return (
    <Container maxW="container.md" py={8}>
      <Flex justifyContent="space-between" alignItems="center" mb={6}>
        <Heading as="h1" size="xl">
          Omni Swap
        </Heading>
        <Button
          leftIcon={<FaWallet />}
          colorScheme="teal"
          variant="solid"
          onClick={connectWallet}
          isDisabled={walletConnected}
        >
          {walletConnected ? 'Connected' : 'Connect Wallet'}
        </Button>
      </Flex>
      <Box borderWidth="1px" borderRadius="lg" overflow="hidden" p={6}>
        <Stack spacing={4}>
          <FormControl id="fromToken">
            <FormLabel>From</FormLabel>
<Select
  placeholder="Select chain"
  mb={3}
  value={fromChain}
  onChange={(e) => handleChainChange('from', e.target.value)}
>
              <option value="ethereum">Ethereum</option>
              <option value="arbitrum">Arbitrum</option>
              <option value="base">Base</option>
              <option value="polygon">Polygon</option>
              <option value="bsc">BSC</option>
            </Select>
            <Input
              type="number"
              placeholder="Enter amount"
              value={fromTokenAmount}
              onChange={(e) => setFromTokenAmount(e.target.value)}
              isRequired
            />
          </FormControl>
          <Flex justifyContent="center" alignItems="center" my={2}>
            <Button colorScheme="teal" variant="outline">
              <FaExchangeAlt />
            </Button>
          </Flex>
          <FormControl id="toToken">
            <FormLabel>To</FormLabel>
<Select
  placeholder="Select chain"
  mb={3}
  value={toChain}
  onChange={(e) => handleChainChange('to', e.target.value)}
>
              <option value="ethereum">Ethereum</option>
              <option value="arbitrum">Arbitrum</option>
              <option value="base">Base</option>
              <option value="polygon">Polygon</option>
              <option value="bsc">BSC</option>
            </Select>
            <Box
              p={2}
              borderWidth="1px"
              borderRadius="md"
              placeholder="Enter amount"
            >
              {fromTokenAmount}
            </Box>
          </FormControl>
          <Button
            rightIcon={<FaEthereum />}
            colorScheme="blue"
            variant="solid"
            onClick={swapTokens}
            isDisabled={!walletConnected}
          >
            Swap
          </Button>
        </Stack>
      </Box>
    </Container>
  );
};

export default Index;
