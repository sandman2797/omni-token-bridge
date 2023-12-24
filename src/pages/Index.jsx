import React, { useState, useEffect } from "react";
import { Link } from '@chakra-ui/react';
import { BigNumber, utils, ethers } from "ethers";
import {
  chainIdMapping,
  chainLzIdMapping,
  contractAddresses,
} from "../constants";
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
} from "@chakra-ui/react";
import { FaExchangeAlt, FaEthereum, FaWallet } from "react-icons/fa";

const Index = () => {
  const [walletConnected, setWalletConnected] = useState(false);
  const [fromTokenAmount, setFromTokenAmount] = useState("");
  const [tokenBalance, setTokenBalance] = useState("0"); // Initialize balance to zero
  const [userAddress, setUserAddress] = useState("");
  const [currNetwork, setCurrNetwork] = useState("");
  const [fromChain, setFromChain] = useState("arbitrum");
  const [toChain, setToChain] = useState("bnb");

  const [txHash, setTxHash] = useState("");
  const toast = useToast();

  async function estimateSendingFee() {
    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contractAddress = contractAddresses[fromChain];

      const contract = new ethers.Contract(
        contractAddress,
        contractAbi,
        provider.getSigner()
      );
      const dstChainId = chainLzIdMapping[toChain];

      const addressWithoutPrefix = userAddress.startsWith("0x")
        ? userAddress.slice(2)
        : userAddress;
      const convertedBytes32 = "0x" + "00".repeat(12) + addressWithoutPrefix;
      const parsedFromTokenAmount = ethers.utils.parseEther(fromTokenAmount);

      const estimatedFee = await contract.estimateSendFee(
        dstChainId,
        convertedBytes32,
        parsedFromTokenAmount,
        0,
        "0x000100000000000000000000000000000000000000000000000000000000000F4240"
      );
      // console.log("Estiamted Fees; ;", estimatedFee[0]["_hex"]);
      const bigNumberValue = BigNumber.from(estimatedFee[0]["_hex"]);
      console.log("Estiamted Fees; ;", bigNumberValue.toString());
      return bigNumberValue;
    } else {
      console.error("Ethereum provider not detected");
      // Handle the case where MetaMask or a compatible provider is not available
    }
  }

  async function estimateDstGasLimtt() {
    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contractAddress = contractAddresses[fromChain];

      const contract = new ethers.Contract(
        contractAddress,
        contractAbi,
        provider.getSigner()
      );
      const dstChainId = chainLzIdMapping[toChain];
      const estimatedFee = await contract.minDstGasLookup(dstChainId, 0);
      const hexValue0x = estimatedFee["_hex"];

      const hexValue = hexValue0x.startsWith("0x")
        ? hexValue0x.slice(2)
        : hexValue0x;
      return (
        "0x00010000000000000000000000000000000000000000000000000000000000" +
        hexValue
      );

      // const bigNumberValue = BigNumber.from(estimatedFee[0]["_hex"]);
      // console.log("Estiamted Fees; ;", bigNumberValue.toString())
      // return bigNumberValue;
    } else {
      console.error("Ethereum provider not detected");
      // Handle the case where MetaMask or a compatible provider is not available
    }
  }

  const updateBalance = async (userAddress) => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const contractAddress = contractAddresses[fromChain];

    const contract = new ethers.Contract(
      contractAddress,
      contractAbi,
      provider.getSigner()
    );

    const balance = await contract.balanceOf(userAddress);
    const remainder = balance.mod(BigNumber.from("10000000000000000"));
    const formattedValue = utils.formatUnits(balance.sub(remainder), 18);
    setTokenBalance(
      formattedValue
    );
  };

  // Soon as a wallet is connected

  useEffect(() => {
    async function getCurrentNetwork() {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);

        // Perform async operations here
        const network = await provider.getNetwork();
        setCurrNetwork(network.name);
        console.log("Connected Network:", network.name); // E.g., "mainnet", "ropsten", "rinkeby", etc.
      } catch (error) {
        // Handle any errors that occur during the async operation
        console.error("Error fetching network:", error);
      }
    }

    if (walletConnected) {
      getCurrentNetwork();
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const userAddress = provider.getSigner().getAddress();
      updateBalance(userAddress); // Replace with actual user address from MetaMask
    }

    // Call the async function
  }, [walletConnected]);

  async function handleSwitchNetwork() {
    if (window.ethereum) {
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: chainIdMapping[fromChain] }], // Specify the desired chain ID
        });
        setCurrNetwork(fromChain);
        updateBalance(userAddress);
      } catch (error) {
        console.error("Network switch request failed:", error);
        // Handle errors here
      }
    } else {
      console.error("Ethereum provider not detected");
      // Handle the case where MetaMask or a compatible provider is not available
    }
  }

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        if (accounts.length > 0) {
          setUserAddress(accounts[0]);
          setWalletConnected(true);
          updateBalance(accounts[0]); // Update balance with the connected user address
        }
        toast({
          title: "Wallet Connected",
          description: "Your MetaMask wallet has been connected successfully!",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to connect MetaMask wallet.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } else {
      toast({
        title: "Error",
        description: "MetaMask is not installed!",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const swapChainsDropdown = (chainType, value) => {
    if (chainType === "from" && value === toChain) {
      setToChain(fromChain);
      setFromChain(value);
    } else if (chainType === "to" && value === fromChain) {
      setFromChain(toChain);
      setToChain(value);
    }

    if (chainType === "from") {
      setFromChain(value);
    } else {
      setToChain(value);
    }
  };

  // Duplicate swapChainsDropdown function declaration remove

  const swapTokens = async () => {
    // TODO Automate the msg.value or sendFromAmount
    // TODO AUtomate adapter paramas
    const sendFromAmount = await estimateSendingFee();
    const adapterParams = await estimateDstGasLimtt(); // For Ex: 0x0f4240
    console.log(adapterParams);

    // const sendFromAmount = ethers.utils.parseEther("0.0049"); // Convert to wei
    const dstChainId = chainLzIdMapping[toChain];
    const contractAddress = contractAddresses[fromChain];

    if (typeof window.ethereum !== "undefined") {
      // A web3 provider is detected
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      // const multipliedAmount = tokenAmount * 1e18;
      const parsedFromTokenAmount = ethers.utils.parseEther(fromTokenAmount);
      const userAddress = await provider.getSigner().getAddress();
      const contract = new ethers.Contract(
        contractAddress,
        contractAbi,
        provider.getSigner()
      );

      const callParams = {
        refundAddress: userAddress,
        zroPaymentAddress: "0x0000000000000000000000000000000000000000",
        // adapterParams: "0x00010000000000000000000000000000000000000000000000000000000000030d40"
        adapterParams: adapterParams,
      };

      const addressWithoutPrefix = userAddress.startsWith("0x")
        ? userAddress.slice(2)
        : userAddress;
      const convertedBytes32 = "0x" + "00".repeat(12) + addressWithoutPrefix;

      console.log({
        sendFromAmount,
        userAddress,
        dstChainId,
        convertedBytes32,
        parsedFromTokenAmount,
        callParams,
      });
      const tx = await contract.sendFrom(
        userAddress,
        dstChainId,
        convertedBytes32,
        parsedFromTokenAmount,
        callParams,
        {
          value: sendFromAmount,
          // gasLimit: ethers.utils.parseUnits('4', 'gwei')
        }
      );

      // Wait for the transaction to be mined
      await tx.wait();

      // Transaction confirmed
      console.log("Transaction confirmed:", tx.hash);

      // Assuming the contract call is successful
      toast({
        title: "Swap Successful",
        description: `Bridged ${fromTokenAmount} OMNI to for ${toChain}`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      setTxHash(tx.hash);
    } else {
      // No web3 provider detected, you can provide a message or use a fallback
      console.error("No web3 provider detected");
    }
  };

  return (
    <Container maxW="container.md" py={8}>
      <Flex justifyContent="space-between" alignItems="center" mb={6}>
        <Heading as="h1" size="xl">
          Omni Swap
        </Heading>
        <Link href="https://arbiscan.io/address/0x949fa78174096543106ab1acce33f02d0243fee6" isExternal>
          <Button colorScheme="green" size="sm" mr={4}>
            Donate
          </Button>
        </Link>

        {walletConnected ? (
          <Flex alignItems="center">
            <Box borderWidth="1px" borderRadius="lg" p={2}>
              {`${currNetwork}: ${userAddress.slice(
                0,
                6
              )}...${userAddress.slice(-4)}`}
            </Box>
            {currNetwork !== fromChain && (
              <Button
                ml={2}
                leftIcon={<FaExchangeAlt />}
                colorScheme="orange"
                size="sm"
                onClick={() => {
                  handleSwitchNetwork();
                }}
              >
                Switch Network
              </Button>
            )}
          </Flex>
        ) : (
          <Button
            leftIcon={<FaWallet />}
            colorScheme="teal"
            variant="solid"
            onClick={connectWallet}
          >
            Connect Wallet
          </Button>
        )}
      </Flex>

      <Box borderWidth="1px" borderRadius="lg" overflow="hidden" p={6}>
        <Stack spacing={4}>
          <FormControl id="fromToken">
            <FormLabel>From</FormLabel>
            <Select
              placeholder="Select chain"
              mb={3}
              value={fromChain}
              onChange={(e) => swapChainsDropdown("from", e.target.value)}
            >
              <option value="ethereum">Ethereum</option>
              <option value="arbitrum">Arbitrum</option>
              <option value="base">Base</option>
              <option value="polygon">Polygon</option>
              <option value="bnb">BNB</option>
            </Select>
            <Flex>
              <Input
                type="number"
                placeholder="Enter amount"
                value={fromTokenAmount}
                onChange={(e) => setFromTokenAmount(e.target.value)}
                isRequired
              />
              <Button
                size="sm"
                onClick={() => setFromTokenAmount(tokenBalance)}
              >
                Max
              </Button>
              <Box p={2} borderWidth="1px" borderRadius="md">
                Balance: {tokenBalance} OMNI
              </Box>
            </Flex>
          </FormControl>

          <Flex justifyContent="center" alignItems="center" my={2}>
            <Button
              colorScheme="teal"
              variant="outline"
              onClick={() => {
                setFromChain(toChain);
                setToChain(fromChain);
              }}
            >
              <FaExchangeAlt />
            </Button>
          </Flex>
          <FormControl id="toToken">
            <FormLabel>To</FormLabel>
            <Select
              placeholder="Select chain"
              mb={3}
              value={toChain}
              onChange={(e) => swapChainsDropdown("to", e.target.value)}
            >
              <option value="ethereum">Ethereum</option>
              <option value="arbitrum">Arbitrum</option>
              <option value="base">Base</option>
              <option value="polygon">Polygon</option>
              <option value="bnb">BNB</option>
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
          {currNetwork === fromChain ? (
            <Button
              rightIcon={<FaEthereum />}
              colorScheme="blue"
              variant="solid"
              onClick={swapTokens}
              isDisabled={!walletConnected}
            >
              Bridge
            </Button>
          ) : (
            <Button
              ml={2}
              leftIcon={<FaExchangeAlt />}
              colorScheme="orange"
              size="sm"
              onClick={() => {
                {
                  handleSwitchNetwork();
                }
              }}
            >
              Switch Network
            </Button>
          )}
        </Stack>
      </Box>
      {txHash === "" ? (
        <></>
      ) : (
        <p>
          Check your txn status on LayerZeroScan: 
          <a
            href={`https://layerzeroscan.com/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'blue', textDecoration: 'underline', cursor: 'pointer' }}
          >
            LINK
          </a>
        </p>
      )}
    </Container>
  );
};

export default Index;
