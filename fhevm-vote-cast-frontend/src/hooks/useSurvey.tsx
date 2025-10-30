'use client';

import { useState, useCallback } from 'react';
import { ethers } from 'ethers';
import { useFhevm } from './useFhevm';
import { Survey, SurveyStats, DecryptedSurveyStats } from '@/fhevm/fhevmTypes';

// Import generated ABI and addresses
import { FHEVoteCastABI } from '@/abi/FHEVoteCastABI';
import { FHEVoteCastAddresses } from '@/abi/FHEVoteCastAddresses';

interface CreateSurveyData {
  title: string;
  description: string;
  surveyType: number;
  startTime: number;
  endTime: number;
}

export function useSurvey() {
  const { isConnected, address, chainId, instance } = useFhevm();
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getContractAddress = useCallback(() => {
    if (!chainId) return null;

    // Convert chainId to number for comparison
    const chainIdNum = typeof chainId === 'bigint' ? Number(chainId) : chainId;

    // Map chainId to network name
    const networkName = chainIdNum === 31337 ? 'localhost' :
                       chainIdNum === 11155111 ? 'sepolia' :
                       `chain-${chainIdNum}`;

    const networkAddresses = (FHEVoteCastAddresses as any)[networkName];
    if (!networkAddresses || !networkAddresses.FHEVoteCast || !networkAddresses.FHEVoteCast.address) {
      return null;
    }

    return networkAddresses.FHEVoteCast.address;
  }, [chainId]);

  const getContract = useCallback(async () => {
    if (!isConnected || !address || !chainId) {
      throw new Error('Wallet not connected');
    }

    const contractAddress = getContractAddress();
    if (!contractAddress) {
      throw new Error('Contract not deployed on this network');
    }

    const provider = new ethers.BrowserProvider(window.ethereum!);
    const signer = await provider.getSigner();
    
    return new ethers.Contract(contractAddress, FHEVoteCastABI.abi, signer);
  }, [isConnected, address, chainId, getContractAddress]);

  const refreshSurveys = useCallback(async () => {
    if (!isConnected) return;

    setLoading(true);
    setError(null);

    try {
      const contract = await getContract();
      const nextSurveyId = await contract.getNextSurveyId();
      
      const surveyPromises = [];
      for (let i = 0; i < Number(nextSurveyId); i++) {
        surveyPromises.push(
          contract.getSurveyInfo(i).then((info: any) => ({
            id: i,
            title: info.title,
            description: info.description,
            surveyType: Number(info.surveyType),
            startTime: Number(info.startTime),
            endTime: Number(info.endTime),
            status: Number(info.status),
            creator: info.creator,
            totalResponses: '0', // Will be decrypted separately
            averageScore: '0', // Will be decrypted separately
          }))
        );
      }

      const surveyData = await Promise.all(surveyPromises);
      setSurveys(surveyData);
    } catch (error) {
      console.error('Failed to fetch surveys:', error);
      setError('Failed to fetch surveys');
    } finally {
      setLoading(false);
    }
  }, [isConnected, getContract]);

  const createSurvey = useCallback(async (data: CreateSurveyData) => {
    if (!isConnected) {
      throw new Error('Wallet not connected');
    }

    setIsCreating(true);
    setError(null);

    try {
      const contract = await getContract();
      
      const tx = await contract.createSurvey(
        data.title,
        data.description,
        data.surveyType,
        data.startTime,
        data.endTime
      );

      await tx.wait();
      
      // Refresh surveys after creation
      await refreshSurveys();
    } catch (error) {
      console.error('Failed to create survey:', error);
      setError('Failed to create survey');
      throw error;
    } finally {
      setIsCreating(false);
    }
  }, [isConnected, getContract, refreshSurveys]);

  const startSurvey = useCallback(async (surveyId: number) => {
    if (!isConnected) {
      throw new Error('Wallet not connected');
    }

    try {
      const contract = await getContract();
      const tx = await contract.startSurvey(surveyId);
      await tx.wait();
      
      await refreshSurveys();
    } catch (error) {
      console.error('Failed to start survey:', error);
      setError('Failed to start survey');
      throw error;
    }
  }, [isConnected, getContract, refreshSurveys]);

  const endSurvey = useCallback(async (surveyId: number) => {
    if (!isConnected) {
      throw new Error('Wallet not connected');
    }

    try {
      const contract = await getContract();
      const tx = await contract.endSurvey(surveyId);
      await tx.wait();
      
      await refreshSurveys();
    } catch (error) {
      console.error('Failed to end survey:', error);
      setError('Failed to end survey');
      throw error;
    }
  }, [isConnected, getContract, refreshSurveys]);

  const participateSurvey = useCallback(async (surveyId: number, score: number) => {
    if (!isConnected) {
      throw new Error('Wallet not connected');
    }

    if (!instance) {
      throw new Error('FHEVM instance not initialized. Please wait for initialization to complete.');
    }

    if (!address) {
      throw new Error('No wallet address available');
    }

    try {
      const contractAddress = getContractAddress();
      if (!contractAddress) {
        throw new Error('Contract not deployed on this network');
      }

      console.log('Creating encrypted input with:', { contractAddress, address, score });
      console.log('FHEVM instance:', instance);
      console.log('Instance methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(instance)));

      // Create encrypted input for the score
      const input = instance.createEncryptedInput(
        contractAddress as `0x${string}`,
        address as `0x${string}`
      );
      console.log('Encrypted input created:', input);
      console.log('Input methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(input)));

      input.add32(score);
      console.log('Added score to input:', score);

      // Encrypt the input (this is CPU-intensive)
      console.log('Starting encryption...');
      const enc = await input.encrypt();
      console.log('Encryption completed successfully');

      console.log('Encrypted data created:', {
        handles: enc.handles,
        inputProof: enc.inputProof
      });

      const contract = await getContract();
      console.log('Calling participateSurvey with encrypted data:', surveyId);

      // Call the real FHEVM function
      const tx = await contract.participateSurvey(
        surveyId,
        enc.handles[0],  // encrypted score handle
        enc.inputProof   // input proof
      );

      console.log('Transaction submitted:', tx.hash);
      await tx.wait();

      console.log('Survey participation completed successfully');
      await refreshSurveys();
    } catch (error) {
      console.error('Failed to participate in survey:', error);
      setError('Failed to participate in survey');
      throw error;
    }
  }, [isConnected, instance, address, getContractAddress, getContract, refreshSurveys]);

  const getSurveyStats = useCallback(async (surveyId: number): Promise<SurveyStats | null> => {
    if (!isConnected) {
      throw new Error('Wallet not connected');
    }

    try {
      const contractAddress = getContractAddress();
      if (!contractAddress) {
        throw new Error('Contract not deployed on this network');
      }

      const contract = await getContract();

      // Get basic survey info first
      const survey = await contract.getSurvey(surveyId);

      // Get encrypted statistics handles
      const [totalResponsesHandle, totalScoreHandle, averageScoreHandle] = await contract.getSurveyStats(surveyId);

      return {
        surveyId: Number(survey.id),
        title: survey.title,
        surveyType: Number(survey.surveyType),
        startTime: Number(survey.startTime),
        endTime: Number(survey.endTime),
        status: Number(survey.status),
        totalResponsesHandle,
        totalScoreHandle,
        averageScoreHandle,
      };
    } catch (error) {
      console.error('Failed to get survey stats:', error);
      setError('Failed to get survey stats');
      return null;
    }
  }, [isConnected, getContractAddress, getContract]);

  const decryptSurveyStats = useCallback(async (surveyId: number): Promise<DecryptedSurveyStats | null> => {
    if (!isConnected) {
      throw new Error('Wallet not connected');
    }

    if (!instance) {
      throw new Error('FHEVM instance not initialized');
    }

    if (!address) {
      throw new Error('No wallet address available');
    }

    try {
      const contractAddress = getContractAddress();
      if (!contractAddress) {
        throw new Error('Contract not deployed on this network');
      }

      const stats = await getSurveyStats(surveyId);
      if (!stats) {
        return null;
      }

      // Get decryption signature
      const { FhevmDecryptionSignature } = await import('@/fhevm/FhevmDecryptionSignature');
      const { GenericStringStorageImpl } = await import('@/fhevm/GenericStringStorage');

      // Create storage for decryption signature
      const storage = new GenericStringStorageImpl();

      // Get signer
      const provider = new ethers.BrowserProvider(window.ethereum!);
      const signer = await provider.getSigner();

      // Create decryption signature
      const sig = await FhevmDecryptionSignature.loadOrSign(
        instance,
        [contractAddress as `0x${string}`],
        signer,
        storage
      );

      if (!sig) {
        throw new Error('Unable to build FHEVM decryption signature');
      }

      // Decrypt the handles (only totalResponses and totalScore, since averageScore is not computed in contract)
      const handlesToDecrypt = [
        { handle: stats.totalResponsesHandle, contractAddress },
        { handle: stats.totalScoreHandle, contractAddress },
      ];

      const decryptedValues = await instance.userDecrypt(
        handlesToDecrypt,
        sig.privateKey,
        sig.publicKey,
        sig.signature,
        sig.contractAddresses,
        sig.userAddress,
        sig.startTimestamp,
        sig.durationDays
      );

      const responseCountRaw = decryptedValues[stats.totalResponsesHandle];
      const totalScoreRaw = decryptedValues[stats.totalScoreHandle];

      console.log('Raw decryption results:', {
        totalResponsesHandle: stats.totalResponsesHandle,
        totalScoreHandle: stats.totalScoreHandle,
        responseCountRaw,
        totalScoreRaw,
        responseCountType: typeof responseCountRaw,
        totalScoreType: typeof totalScoreRaw,
        decryptedValues
      });

      // Handle bigint values from FHEVM decryption
      const responseCount = typeof responseCountRaw === 'bigint' ? Number(responseCountRaw) : Number(responseCountRaw);
      const totalScore = typeof totalScoreRaw === 'bigint' ? Number(totalScoreRaw) : Number(totalScoreRaw);

      console.log('Converted values:', { responseCount, totalScore });

      // Calculate average score on the frontend since FHE.div is not available in the contract
      const averageScore = responseCount > 0 ? totalScore / responseCount : 0;

      console.log('Calculated averageScore:', averageScore);

      return {
        surveyId: stats.surveyId,
        title: stats.title,
        surveyType: stats.surveyType,
        startTime: stats.startTime,
        endTime: stats.endTime,
        status: stats.status,
        responseCount,
        totalScore,
        averageScore,
      };
    } catch (error) {
      console.error('Failed to decrypt survey stats:', error);
      setError('Failed to decrypt survey stats');
      return null;
    }
  }, [isConnected, instance, address, getContractAddress, getSurveyStats]);

  return {
    surveys,
    loading,
    isCreating,
    error,
    refreshSurveys,
    createSurvey,
    startSurvey,
    endSurvey,
    participateSurvey,
    getSurveyStats,
    decryptSurveyStats,
  };
}
