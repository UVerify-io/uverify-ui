import {
  Address,
  Bytes,
  Transaction,
  TransactionHash,
  TransactionWitnessSet,
  PrivateKey,
  MessageSigning,
} from '@evolution-sdk/evolution';
import { addressFromSeed } from '@evolution-sdk/evolution/sdk/wallet/Derivation';
import { hashTransactionRaw } from '@evolution-sdk/evolution/utils/Hash';

const DEMO_WALLET_KEY = 'uverify_demo_wallet_mnemonic';

export interface DemoWallet {
  address: string;
  signTx: (unsignedTx: string) => Promise<string>;
  signMessage: (message: string) => Promise<{ key: string; signature: string }>;
}

function walletFromMnemonic(mnemonic: string): DemoWallet {
  const { address: addressObj } = addressFromSeed(mnemonic, {
    addressType: 'Enterprise',
    network: 'Testnet',
  });

  const addressBech32 = Address.toBech32(addressObj);
  const addressHex = Address.toHex(addressObj);
  const paymentKey = PrivateKey.fromMnemonicCardano(mnemonic);
  const vkey = PrivateKey.toPublicKey(paymentKey);

  return {
    address: addressBech32,
    signTx: async (unsignedTx: string) => {
      const txBytes = Bytes.fromHex(unsignedTx);
      const bodyBytes = Transaction.extractBodyBytes(txBytes);
      const txHash = hashTransactionRaw(bodyBytes);
      const hashBytes = TransactionHash.toBytes(txHash);
      const signature = PrivateKey.sign(paymentKey, hashBytes);
      const witness = new TransactionWitnessSet.VKeyWitness({ vkey, signature });
      const witnessSet = TransactionWitnessSet.fromVKeyWitnesses([witness]);
      return TransactionWitnessSet.toCBORHex(witnessSet);
    },
    signMessage: async (message: string) => {
      const payload = new TextEncoder().encode(message);
      const { signature, key } = MessageSigning.SignData.signData(
        addressHex,
        payload,
        paymentKey,
      );
      return {
        key: Bytes.toHex(key),
        signature: Bytes.toHex(signature),
      };
    },
  };
}

/** Create a fresh disposable wallet, persist the mnemonic in localStorage. */
export function createDemoWallet(): DemoWallet {
  const mnemonic = PrivateKey.generateMnemonic(256);
  localStorage.setItem(DEMO_WALLET_KEY, mnemonic);
  return walletFromMnemonic(mnemonic);
}

/** Restore a previously created demo wallet from localStorage. Returns null if none exists. */
export function loadDemoWallet(): DemoWallet | null {
  const mnemonic = localStorage.getItem(DEMO_WALLET_KEY);
  if (!mnemonic) return null;
  return walletFromMnemonic(mnemonic);
}

/** Remove the demo wallet mnemonic from localStorage. */
export function clearDemoWallet(): void {
  localStorage.removeItem(DEMO_WALLET_KEY);
}

/** Returns true when a demo wallet mnemonic is stored in localStorage. */
export function hasDemoWallet(): boolean {
  return localStorage.getItem(DEMO_WALLET_KEY) !== null;
}
