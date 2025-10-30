'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { ethers } from 'ethers';
import { createFhevmInstance, FhevmAbortError } from '@/fhevm/fhevm';
import { FhevmInstance } from '@/fhevm/fhevmTypes';
import { FHEVM_CONSTANTS } from '@/fhevm/constants';

export function useFhevm() {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [instance, setInstance] = useState<FhevmInstance | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const isInitializingRef = useRef(false);

  // Check if wallet is connected on mount
  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = useCallback(async () => {
    if (typeof window === 'undefined' || !window.ethereum) {
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.listAccounts();
      
      if (accounts.length > 0) {
        const signer = await provider.getSigner();
        const network = await provider.getNetwork();
        
        setAddress(accounts[0].address);
        setChainId(Number(network.chainId));
        setIsConnected(true);
        
        // Initialize FHEVM instance
        await initializeFhevmInstance();
      }
    } catch (error) {
      console.error('Failed to check wallet connection:', error);
    }
  }, []);

  const initializeFhevmInstance = useCallback(async () => {
    // Prevent concurrent initialization
    if (isInitializingRef.current) {
      console.log('FHEVM initialization already in progress, skipping...');
      return;
    }

    try {
      isInitializingRef.current = true;
      setIsLoading(true);
      setError(null);

      // Cancel previous instance creation
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();

      const fhevmInstance = await createFhevmInstance({
        provider: window.ethereum!,
        signal: abortControllerRef.current.signal,
        onStatusChange: (status) => {
          console.log('FHEVM status:', status);
        },
      });

      setInstance(fhevmInstance);
    } catch (error) {
      if (error instanceof FhevmAbortError) {
        console.log('FHEVM instance creation was cancelled');
        return;
      }

      console.error('Failed to initialize FHEVM instance:', error);
      setError('Failed to initialize FHEVM. Please try again.');
    } finally {
      setIsLoading(false);
      isInitializingRef.current = false;
    }
  }, []);

  const connect = useCallback(async () => {
    if (typeof window === 'undefined' || !window.ethereum) {
      throw new Error('No wallet found. Please install MetaMask.');
    }

    try {
      setIsLoading(true);
      setError(null);

      const provider = new ethers.BrowserProvider(window.ethereum);
      
      // Request account access
      const accounts = await provider.send('eth_requestAccounts', []);
      
      if (accounts.length === 0) {
        throw new Error('No accounts found');
      }

      const signer = await provider.getSigner();
      const network = await provider.getNetwork();
      
      setAddress(accounts[0]);
      setChainId(Number(network.chainId));
      setIsConnected(true);

      // Initialize FHEVM instance
      await initializeFhevmInstance();

      // Set up event listeners
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
      window.ethereum.on('disconnect', handleDisconnect);

    } catch (error) {
      console.error('Failed to connect wallet:', error);
      setError('Failed to connect wallet. Please try again.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [initializeFhevmInstance]);

  const disconnect = useCallback(async () => {
    try {
      // Remove event listeners
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
        window.ethereum.removeListener('disconnect', handleDisconnect);
      }

      // Cancel FHEVM instance creation
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      setInstance(null);
      setAddress(null);
      setChainId(null);
      setIsConnected(false);
      setError(null);
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
    }
  }, []);

  const handleAccountsChanged = useCallback(async (accounts: string[]) => {
    if (accounts.length === 0) {
      await disconnect();
    } else {
      setAddress(accounts[0]);
      // Reinitialize FHEVM instance with new account (only if not currently initializing)
      if (window.ethereum && !isInitializingRef.current) {
        await initializeFhevmInstance();
      }
    }
  }, [disconnect, initializeFhevmInstance]);

  const handleChainChanged = useCallback(async (chainId: string) => {
    const newChainId = parseInt(chainId, 16);
    setChainId(newChainId);

    // Reinitialize FHEVM instance with new chain (only if not currently initializing)
    if (window.ethereum && !isInitializingRef.current) {
      await initializeFhevmInstance();
    }
  }, [initializeFhevmInstance]);

  const handleDisconnect = useCallback(async () => {
    await disconnect();
  }, [disconnect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      isInitializingRef.current = false;
    };
  }, []);

  return {
    isConnected,
    address,
    chainId,
    instance,
    isLoading,
    error,
    connect,
    disconnect,
  };
}
