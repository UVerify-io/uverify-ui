export declare interface Field {
  key: string;
  value: string;
}

export declare interface UVerifyCertificate {
  hash: string;
  address: string;
  block_hash: string;
  block_number: number;
  transaction_hash: string;
  slot: number;
  creation_time: number;
  metadata: string;
  issuer: string;
}

export type UVerifyMetadata = Record<string, string | number | boolean | null>;
