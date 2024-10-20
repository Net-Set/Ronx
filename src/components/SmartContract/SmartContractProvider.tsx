"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { ethers } from "ethers";
import abi from "@/components/SmartContract/abi.json";

const CONTRACT_ADDRESS = "0xb2e1eD3394AC2191313A4a9Fcb5B52C4d3c046eF";
const INFURA_PROJECT_ID = "54342a1556274e579ef82ed1022b7a7c"; 

interface SmartContractContextType {
  fetchData: (methodName: string, ...params: any[]) => Promise<any | null>;
  writeData: (methodName: string, ...params: any[]) => Promise<any | null>;
  users: (userAddress: string) => Promise<{ id: number; referrer: string; partnersCount: number; registrationTime: number } | null>;
  usersActiveX3Levels: (userAddress: string, level: number) => Promise<boolean | null>;
  usersActiveX4Levels: (userAddress: string, level: number) => Promise<boolean | null>;
  userX3Matrix: (userAddress: string, level: number) => Promise<number | null>;
  userX4Matrix: (userAddress: string, level: number) => Promise<number | null>;
  getPartnerCount: (userAddress: string, matrix: number, level: number) => Promise<number | null>;
  getTotalCycles: (userAddress: string, matrix: number, level: number) => Promise<number | null>;
  provider: ethers.providers.JsonRpcProvider | null;
}

const SmartContractContext = createContext<SmartContractContextType | undefined>(undefined);

export const SmartContractProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [provider, setProvider] = useState<ethers.providers.JsonRpcProvider | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const infuraProvider = new ethers.providers.JsonRpcProvider(`https://bsc-testnet.infura.io/v3/${INFURA_PROJECT_ID}`);
        setProvider(infuraProvider);
        const contractInstance = new ethers.Contract(CONTRACT_ADDRESS, abi, infuraProvider);
        setContract(contractInstance);
      } catch (error) {
        console.error("Error initializing provider or contract:", error);
      }
    };
    init();
  }, []);

  const fetchData = async (methodName: string, ...params: any[]) => {
    if (!contract) return null;
    try {
      const result = await contract[methodName](...params);
      return result;
    } catch (error) {
      console.error(`Error fetching data from ${methodName}:`, error);
      return null;
    }
  };

  const writeData = async (methodName: string, ...params: any[]) => {
    if (!contract) return null;
    try {
      const signer = provider?.getSigner();
      const contractWithSigner = contract.connect(signer);
      const tx = await contractWithSigner[methodName](...params);
      await tx.wait();
      return tx;
    } catch (error) {
      console.error(`Error writing data to ${methodName}:`, error);
      return null;
    }
  };

  // Users method to fetch user details based on the provided address
  const users = async (userAddress: string) => {
    if (!contract) return null;
    try {
      const result = await contract.users(userAddress);
      const userData = {
        id: result.id.toNumber(),
        referrer: result.referrer,
        partnersCount: result.partnersCount.toNumber(),
        registrationTime: result.registrationTime.toNumber(),
      };
      return userData;
    } catch (error) {
      console.error("Error fetching user details:", error);
      return null;
    }
  };

  // Check if a user is active in X3 at a certain level
  const usersActiveX3Levels = async (userAddress: string, level: number) => {
    if (!contract) return null;
    try {
      const result = await contract.usersActiveX3Levels(userAddress, level);
      return result; // Assuming this returns a boolean
    } catch (error) {
      console.error("Error fetching usersActiveX3Levels:", error);
      return null;
    }
  };

  // Check if a user is active in X4 at a certain level
  const usersActiveX4Levels = async (userAddress: string, level: number) => {
    if (!contract) return null;
    try {
      const result = await contract.usersActiveX4Levels(userAddress, level);
      return result; // Assuming this returns a boolean
    } catch (error) {
      console.error("Error fetching usersActiveX4Levels:", error);
      return null;
    }
  };

  // Fetch users X3 matrix
  const userX3Matrix = async (userAddress: string, level: number) => {
    if (!contract) return null;
    try {
      const result = await contract.usersX3Matrix(userAddress, level);
      return result; // Return relevant data
    } catch (error) {
      console.error("Error fetching usersX3Matrix:", error);
      return null;
    }
  };

  // Fetch contract data for X4 matrix
  const userX4Matrix = async (userAddress: string, level: number) => {
    if (!contract) return null;
    try {
      const result = await contract.usersX4Matrix(userAddress, level);
      return result.toNumber(); // Assuming this returns a number
    } catch (error) {
      console.error("Error fetching userX4Matrix:", error);
      return null;
    }
  };

  // Fetch the total cycles for a user at a certain level and matrix
  const getTotalCycles = async (userAddress: string, matrix: number, level: number) => {
    if (!contract) return null;
    try {
      const cycles = await contract.getTotalCycles(userAddress, matrix, level);
      return cycles.toNumber();
    } catch (error) {
      console.error("Error fetching total cycles:", error);
      return null;
    }
  };

  // Fetch the partner count for a user at a certain level and matrix
  const getPartnerCount = async (userAddress: string, matrix: number, level: number): Promise<number | null> => {
    if (!contract) return null;
    try {
      const partnerCount = await contract.getPartnerCount(userAddress, matrix, level);
      return partnerCount.toNumber(); // Assuming this returns a BigNumber that needs to be converted to a number
    } catch (error) {
      console.error("Error fetching partner count:", error);
      return null;
    }
  };

  return (
    <SmartContractContext.Provider
      value={{
        fetchData,
        writeData,
        users,
        usersActiveX3Levels,
        usersActiveX4Levels,
        getTotalCycles,
        userX3Matrix,
        userX4Matrix,
        getPartnerCount,
        provider,
      }}
    >
      {children}
    </SmartContractContext.Provider>
  );
};

// Hook to use the SmartContract context
export const useSmartContract = () => {
  const context = useContext(SmartContractContext);
  if (context === undefined) {
    throw new Error("useSmartContract must be used within a SmartContractProvider");
  }
  return context;
};
