export declare interface Field {
  key: string;
  value: string;
  placeholder?: string;
  layoutProp?: boolean;
}

export declare interface UVerifyCertificate {
  hash: string;
  address: string;
  blockHash: string;
  blockNumber: number;
  transactionHash: string;
  slot: number;
  creationTime: number;
  metadata: string;
  issuer: string;
}

export type UVerifyMetadata = Record<string, string | number | boolean | null>;
