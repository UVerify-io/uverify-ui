const BASE62 =
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

/**
 * Deterministic 10-char code from the top 59 bits of the SHA-256 certificate
 * hash. Must stay in sync with io.uverify.backend.util.ShortCode.
 */
export function shortCodeFromHash(hexHash: string): string {
  let value = BigInt('0x' + hexHash.slice(0, 16)) >> 5n;
  let code = '';
  for (let i = 0; i < 10; i++) {
    code = BASE62[Number(value % 62n)] + code;
    value /= 62n;
  }
  return code;
}
