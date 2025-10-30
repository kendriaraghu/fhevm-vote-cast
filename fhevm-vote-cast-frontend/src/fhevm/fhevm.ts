import { ethers } from 'ethers';
import { FhevmInstance, FhevmInstanceConfig } from './fhevmTypes';
import { FHEVM_CONSTANTS } from './constants';

export class FhevmReactError extends Error {
  code: string;
  constructor(code: string, message?: string, options?: { cause?: unknown }) {
    super(message);
    this.code = code;
    this.name = 'FhevmReactError';
    if (options?.cause) {
      (this as any).cause = options.cause;
    }
  }
}

function throwFhevmError(
  code: string,
  message?: string,
  cause?: unknown
): never {
  throw new FhevmReactError(code, message, cause ? { cause } : undefined);
}

export class FhevmAbortError extends Error {
  constructor(message = 'FHEVM operation was cancelled') {
    super(message);
    this.name = 'FhevmAbortError';
  }
}

type FhevmRelayerStatusType =
  | 'sdk-loading'
  | 'sdk-loaded'
  | 'sdk-initializing'
  | 'sdk-initialized'
  | 'creating';

async function getChainId(
  providerOrUrl: ethers.Eip1193Provider | string
): Promise<number> {
  if (typeof providerOrUrl === 'string') {
    const provider = new ethers.JsonRpcProvider(providerOrUrl);
    return Number((await provider.getNetwork()).chainId);
  }
  const chainId = await providerOrUrl.request({ method: 'eth_chainId' });
  return Number.parseInt(chainId as string, 16);
}

async function tryFetchFHEVMHardhatNodeRelayerMetadata(rpcUrl: string): Promise<
  | {
      ACLAddress: `0x${string}`;
      InputVerifierAddress: `0x${string}`;
      KMSVerifierAddress: `0x${string}`;
    }
  | undefined
> {
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  try {
    const version = await provider.send('web3_clientVersion', []);
    if (
      typeof version !== 'string' ||
      !version.toLowerCase().includes('hardhat')
    ) {
      return undefined;
    }
    
    const metadata = await provider.send('fhevm_relayer_metadata', []);
    if (!metadata || typeof metadata !== 'object') {
      return undefined;
    }
    
    if (
      !(
        'ACLAddress' in metadata &&
        typeof metadata.ACLAddress === 'string' &&
        metadata.ACLAddress.startsWith('0x')
      )
    ) {
      return undefined;
    }
    
    if (
      !(
        'InputVerifierAddress' in metadata &&
        typeof metadata.InputVerifierAddress === 'string' &&
        metadata.InputVerifierAddress.startsWith('0x')
      )
    ) {
      return undefined;
    }
    
    if (
      !(
        'KMSVerifierAddress' in metadata &&
        typeof metadata.KMSVerifierAddress === 'string' &&
        metadata.KMSVerifierAddress.startsWith('0x')
      )
    ) {
      return undefined;
    }
    
    return metadata;
  } catch {
    return undefined;
  } finally {
    provider.destroy();
  }
}

type MockResolveResult = { isMock: true; chainId: number; rpcUrl: string };
type GenericResolveResult = { isMock: false; chainId: number; rpcUrl?: string };
type ResolveResult = MockResolveResult | GenericResolveResult;

async function resolve(
  providerOrUrl: ethers.Eip1193Provider | string,
  mockChains?: Record<number, string>
): Promise<ResolveResult> {
  const chainId = await getChainId(providerOrUrl);
  
  let rpcUrl = typeof providerOrUrl === 'string' ? providerOrUrl : undefined;
  
  const _mockChains: Record<number, string> = {
    31337: 'http://localhost:8545',
    ...(mockChains ?? {}),
  };
  
  if (chainId in _mockChains) {
    if (!rpcUrl) {
      rpcUrl = _mockChains[chainId];
    }
    return { isMock: true, chainId, rpcUrl };
  }
  
  return { isMock: false, chainId, rpcUrl };
}

export const createFhevmInstance = async (parameters: {
  provider: ethers.Eip1193Provider | string;
  mockChains?: Record<number, string>;
  signal: AbortSignal;
  onStatusChange?: (status: FhevmRelayerStatusType) => void;
}): Promise<FhevmInstance> => {
  const throwIfAborted = () => {
    if (parameters.signal.aborted) throw new FhevmAbortError();
  };

  const notify = (status: FhevmRelayerStatusType) => {
    if (parameters.onStatusChange) parameters.onStatusChange(status);
  };

  const { signal, onStatusChange, provider: providerOrUrl, mockChains } = parameters;

  // Resolve chainId
  const { isMock, rpcUrl, chainId } = await resolve(providerOrUrl, mockChains);

  if (isMock) {
    const fhevmRelayerMetadata = await tryFetchFHEVMHardhatNodeRelayerMetadata(rpcUrl);

    if (fhevmRelayerMetadata) {
      notify('creating');

      // Dynamic import to avoid including mock utils in production bundle
      const fhevmMock = await import('./mock/fhevmMock');
      const mockInstance = await fhevmMock.fhevmMockCreateInstance({
        rpcUrl,
        chainId,
        metadata: fhevmRelayerMetadata,
      });

      // Note: We don't call throwIfAborted() here for Mock instances
      // as they are created synchronously and shouldn't be interrupted
      return mockInstance;
    }
  }

  throwIfAborted();

  // Load and initialize real relayer SDK
  if (!(window as any).relayerSDK) {
    notify('sdk-loading');
    
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/@zama-fhe/relayer-sdk@latest/dist/index.js';
    script.async = true;
    
    await new Promise((resolve, reject) => {
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
    
    throwIfAborted();
    notify('sdk-loaded');
  }

  if (!(window as any).relayerSDK.__initialized__) {
    notify('sdk-initializing');
    
    const result = await (window as any).relayerSDK.initSDK();
    (window as any).relayerSDK.__initialized__ = result;
    
    if (!result) {
      throw new Error('window.relayerSDK.initSDK failed.');
    }
    
    throwIfAborted();
    notify('sdk-initialized');
  }

  const relayerSDK = (window as any).relayerSDK;
  
  // Use Sepolia config for now
  const config: FhevmInstanceConfig = {
    ...relayerSDK.SepoliaConfig,
    network: providerOrUrl,
    publicKey: '', // Will be set after getting from storage
    publicParams: '', // Will be set after getting from storage
  };

  notify('creating');
  
  const instance = await relayerSDK.createInstance(config);
  
  throwIfAborted();
  return instance;
};
