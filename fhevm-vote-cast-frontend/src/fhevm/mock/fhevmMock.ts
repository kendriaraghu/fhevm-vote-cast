import { JsonRpcProvider } from 'ethers';
import { MockFhevmInstance } from '@fhevm/mock-utils';
import { FhevmInstance } from '../fhevmTypes';

export const fhevmMockCreateInstance = async (parameters: {
  rpcUrl: string;
  chainId: number;
  metadata: {
    ACLAddress: `0x${string}`;
    InputVerifierAddress: `0x${string}`;
    KMSVerifierAddress: `0x${string}`;
  };
}): Promise<FhevmInstance> => {
  try {
    console.log('Creating FHEVM Mock instance with parameters:', {
      rpcUrl: parameters.rpcUrl,
      chainId: parameters.chainId,
      metadata: parameters.metadata,
    });

    const provider = new JsonRpcProvider(parameters.rpcUrl);
    console.log('Provider created, creating MockFhevmInstance...');

    const instance = await MockFhevmInstance.create(provider, provider, {
      aclContractAddress: parameters.metadata.ACLAddress,
      chainId: parameters.chainId,
      gatewayChainId: 55815,
      inputVerifierContractAddress: parameters.metadata.InputVerifierAddress,
      kmsContractAddress: parameters.metadata.KMSVerifierAddress,
      verifyingContractAddressDecryption: "0x5ffdaAB0373E62E2ea2944776209aEf29E631A64",
      verifyingContractAddressInputVerification: "0x812b06e1CDCE800494b79fFE4f925A504a9A9810",
    });

    console.log('FHEVM Mock instance created successfully');
    return instance as unknown as FhevmInstance;
  } catch (error) {
    console.error('Failed to create FHEVM Mock instance:', error);
    throw error;
  }
};
