import type { FhevmInstance } from "@zama-fhe/relayer-sdk/bundle";
import type { FhevmInstanceConfig } from "@zama-fhe/relayer-sdk/web";
import type { HandleContractPair } from "@zama-fhe/relayer-sdk/bundle";
import type { DecryptedResults } from "@zama-fhe/relayer-sdk/bundle";

export type { FhevmInstance, FhevmInstanceConfig, HandleContractPair, DecryptedResults };

export interface EncryptedInput {
  add32(value: number): void;
  encrypt(): Promise<{ handles: string[]; inputProof: string }>;
}

export interface FhevmDecryptionSignature {
  privateKey: string;
  publicKey: string;
  signature: string;
  contractAddresses: string[];
  userAddress: string;
  startTimestamp: number;
  durationDays: number;
}

export type FhevmDecryptionSignatureType = {
  publicKey: string;
  privateKey: string;
  signature: string;
  startTimestamp: number; // Unix timestamp in seconds
  durationDays: number;
  userAddress: `0x${string}`;
  contractAddresses: `0x${string}`[];
  eip712: EIP712Type;
};

export type EIP712Type = {
  domain: {
    chainId: number;
    name: string;
    verifyingContract: `0x${string}`;
    version: string;
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  message: any;
  primaryType: string;
  types: {
    [key: string]: {
      name: string;
      type: string;
    }[];
  };
};

export interface GenericStringStorage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
  // Backward compatibility
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
  remove(key: string): Promise<void>;
}

export interface SurveyType {
  STAR_5: 0;
  SCORE_10: 1;
  GRADE_ABC: 2;
}

export interface SurveyStatus {
  DRAFT: 0;
  ACTIVE: 1;
  ENDED: 2;
}

export interface Survey {
  id: number;
  title: string;
  description: string;
  surveyType: number;
  startTime: number;
  endTime: number;
  status: number;
  creator: string;
  totalResponses: string;
  averageScore: string;
}

export interface SurveyStats {
  surveyId: number;
  title: string;
  surveyType: number;
  startTime: number;
  endTime: number;
  status: number;
  totalResponsesHandle: string;
  totalScoreHandle: string;
  averageScoreHandle: string;
}

export interface DecryptedSurveyStats {
  surveyId: number;
  title: string;
  surveyType: number;
  startTime: number;
  endTime: number;
  status: number;
  responseCount: number;
  totalScore: number;
  averageScore: number;
}
