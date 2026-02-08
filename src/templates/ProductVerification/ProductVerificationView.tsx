import {
  type UVerifyCertificate,
  type UVerifyCertificateExtraData,
  type UVerifyMetadata,
} from '@uverify/core';
import { useState, useEffect, useRef } from 'react';
import { useWebNfc } from '@uverify/asymmetric-nfc';
import nacl from 'tweetnacl';
import {
  CheckCircle2,
  XCircle,
  Loader2,
  Radio,
  ShieldCheck,
  AlertCircle,
  Copy,
  Check,
  ExternalLink,
} from 'lucide-react';

function ProductVerificationView({
  metadata = {},
  certificate,
  extra = {
    hashedMultipleTimes: false,
    firstDateTime: '',
    issuer: '',
    serverError: false,
    isLoading: false,
  },
}: {
  metadata: UVerifyMetadata;
  certificate?: UVerifyCertificate;
  extra: UVerifyCertificateExtraData;
}) {
  const [verificationStep, setVerificationStep] = useState<
    'idle' | 'extracting-key' | 'signing' | 'verifying' | 'verified' | 'failed'
  >('idle');

  const [publicKey, setPublicKey] = useState('');
  const [chipId, setChipId] = useState('');
  const [randomMessage, setRandomMessage] = useState('');
  const [signature, setSignature] = useState('');
  const [_isProcessing, setIsProcessing] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [_isScanning, setIsScanning] = useState(false);

  // Debug UI (for on-phone debugging)
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const [lastPayloadText, setLastPayloadText] = useState<string>('');
  const [lastReadTime, setLastReadTime] = useState<number>(0);
  const [tagInRange, setTagInRange] = useState<boolean>(true);

  const addDebugLog = (msg: string) => {
    const ts = new Date().toLocaleTimeString();
    setDebugLogs((prev) => [...prev.slice(-40), `[${ts}] ${msg}`]);
  };

  // Refs to avoid stale closure issues inside onReading
  const publicKeyRef = useRef<string>('');
  const randomMessageRef = useRef<string>('');
  useEffect(() => {
    publicKeyRef.current = publicKey;
  }, [publicKey]);
  useEffect(() => {
    randomMessageRef.current = randomMessage;
  }, [randomMessage]);

  const powerCycleIntervalRef = useRef<any>(null);
  const statusRef = useRef<
    'idle' | 'extracting-key' | 'signing' | 'verifying' | 'verified' | 'failed'
  >('idle');

  const singleReadTimeoutRef = useRef<number | null>(null);
  const isGettingDeviceInfoRef = useRef<boolean>(false);

  useEffect(() => {
    statusRef.current = verificationStep;
  }, [verificationStep]);

  // Tag-in-range indicator during signing/verifying
  useEffect(() => {
    if (verificationStep !== 'signing' && verificationStep !== 'verifying')
      return;
    const t = window.setInterval(() => {
      const delta = Date.now() - lastReadTime;
      setTagInRange(delta < 5000);
    }, 1000);
    return () => window.clearInterval(t);
  }, [verificationStep, lastReadTime]);

  const { isSupported, startScan, stopScan, writeText } = useWebNfc({
    onReading: (_tagId, payload: any) => {
      setLastReadTime(Date.now());

      try {
        setLastPayloadText(JSON.stringify(payload));
      } catch {
        setLastPayloadText(String(payload));
      }

      addDebugLog(
        `onReading state=${payload?.state ?? '(none)'} prog=${payload?.progress ?? '(none)'}`,
      );

      if (!payload) return;

      const isHex = (s: any, len: number) =>
        typeof s === 'string' && new RegExp(`^[0-9a-fA-F]{${len}}$`).test(s);

      // 1) Device info (pubkey) extraction mode:
      // IMPORTANT: do NOT fail on the first non-pubkey payload; keep scanning until timeout.
      if (isGettingDeviceInfoRef.current) {
        setStatusText('Reading device info (public key)...');

        const rawPk =
          (payload.state === 'PH_IDLE' ? payload.pubkey : undefined) ||
          payload.publicKey ||
          payload.pubkey;

        const pk =
          typeof rawPk === 'string' ? rawPk.replace(/^0x/i, '').trim() : rawPk;

        const cid: string | undefined = payload.chipId || payload.uid;

        addDebugLog(
          `deviceInfo: state=${payload?.state ?? '(none)'} pkType=${typeof pk} pkLen=${
            typeof pk === 'string' ? pk.length : 'n/a'
          } keys=${Object.keys(payload || {}).join(',')}`,
        );

        if (typeof pk === 'string' && isHex(pk, 64)) {
          // Success: clear timeout + stop scan
          if (singleReadTimeoutRef.current) {
            clearTimeout(singleReadTimeoutRef.current);
            singleReadTimeoutRef.current = null;
          }

          setPublicKey(pk);
          if (typeof cid === 'string' && cid.length) setChipId(cid);

          isGettingDeviceInfoRef.current = false;
          try {
            stopScan();
          } catch {}
          setIsScanning(false);

          // Generate message + start signing
          const msg = `VERIFY-${Date.now()}-${Math.random()
            .toString(36)
            .substring(7)}`;

          setRandomMessage(msg);
          setVerificationStep('signing');
          setStatusText(
            'Public key extracted! Now signing a random message...',
          );

          // Auto-start signing
          window.setTimeout(() => startSigning(msg), 400);
        }

        // Not recognized yet -> keep scanning until timeout
        return;
      }

      // 2) Signing state machine
      // Ignore late compute payloads after we move to verifying/verified/failed.
      if (statusRef.current !== 'signing') {
        return;
      }

      switch (payload.state) {
        case 'PH_INIT_K':
        case 'PH_INIT_R': {
          setStatusText('Initializing cryptographic computation...');
          const next =
            typeof payload.progress === 'number' ? payload.progress : 10;
          setProgress((prev) => Math.max(prev ?? 0, next));
          break;
        }

        case 'PH_R_WORK': {
          const steps =
            typeof payload.stepsRemaining === 'number'
              ? payload.stepsRemaining
              : undefined;

          const next =
            typeof payload.progress === 'number' ? payload.progress : undefined;

          // monotonic progress: never go backwards (prevents 100% -> 50% snap-back)
          setProgress((prev) => {
            const candidate = next ?? prev ?? 0;
            return Math.max(prev ?? 0, candidate);
          });

          if (typeof steps === 'number') {
            setStatusText(
              `Computing signature... ${
                typeof next === 'number' ? next : ''
              }% (${steps} steps remaining)`,
            );
            addDebugLog(
              `PH_R_WORK stepsRemaining=${steps} progress=${
                typeof next === 'number' ? next : '(none)'
              }`,
            );
          } else {
            setStatusText('Computing signature...');
            addDebugLog(
              `PH_R_WORK progress=${typeof next === 'number' ? next : '(none)'} (no stepsRemaining)`,
            );
          }
          break;
        }

        case 'PH_R_DONE': {
          // This is NOT "signature complete" yet. It's the end of R-phase.
          const next =
            typeof payload.progress === 'number' ? payload.progress : 97;
          setProgress((prev) => Math.max(prev ?? 0, next));
          setStatusText('Finalizing signature...');
          addDebugLog(`PH_R_DONE progress=${next}`);
          break;
        }

        case 'PH_DONE': {
          setProgress(100);
          setStatusText('Signature complete! Verifying...');
          addDebugLog(
            `PH_DONE sigLen=${
              typeof payload.signature === 'string'
                ? payload.signature.length
                : '(none)'
            }`,
          );

          // Move out of signing so late PH_R_WORK won't regress UI
          setVerificationStep('verifying');

          // Stop scanning/cycling ASAP
          stopPowerCycling();

          if (payload.signature && isHex(payload.signature, 128)) {
            setSignature(payload.signature);

            const keyNow = publicKeyRef.current;
            const msgNow = randomMessageRef.current;

            addDebugLog(
              `Verifying: keyLen=${keyNow.length}, msgLen=${msgNow.length}, sigLen=${payload.signature.length}`,
            );
            verifySignature(payload.signature, keyNow, msgNow);
          } else {
            addDebugLog(
              `PH_DONE but signature missing/invalid: ${String(payload.signature)}`,
            );
            setError('Chip finished but signature was missing/invalid');
            setVerificationStep('failed');
          }
          break;
        }

        case 'PH_IDLE':
          // ignore
          break;

        case 'BUSY':
          setStatusText('Device busy. Keep the tag in place...');
          addDebugLog('BUSY');
          break;

        case 'ERROR':
          setError(payload.error || 'Unknown error from device');
          setVerificationStep('failed');
          addDebugLog(`ERROR: ${payload.error || '(no error text)'}`);
          stopPowerCycling();
          break;

        default:
          addDebugLog(`Unrecognized state: ${String(payload.state)}`);
          break;
      }
    },

    onError: (err) => {
      addDebugLog(`NFC Error: ${err?.message ?? String(err)}`);
      setError(`NFC Error: ${err.message}`);
      setVerificationStep('failed');
      setIsProcessing(false);
    },
  });

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const startVerification = async () => {
    try {
      setError('');
      setDebugLogs([]);
      setLastPayloadText('');
      setProgress(0);

      setVerificationStep('extracting-key');
      setIsProcessing(true);
      setStatusText('Hold your phone near the NFC symbol on the product...');
      setPublicKey('');
      setChipId('');
      setSignature('');
      setRandomMessage('');

      // Make sure no previous operations are still running
      stopPowerCycling();
      try {
        stopScan();
      } catch {}

      isGettingDeviceInfoRef.current = true;

      if (singleReadTimeoutRef.current) {
        clearTimeout(singleReadTimeoutRef.current);
        singleReadTimeoutRef.current = null;
      }

      addDebugLog(`Writing 'pubkey' command...`);
      await writeText('pubkey');

      addDebugLog('Starting scan window for device info...');
      await startScan({
        pollMs: 300,
        deepResetEveryMs: 999999,
        deepResetPauseMs: 0,
        staleAfterMs: 999999,
      });
      setIsScanning(true);

      // Timeout that fails ONLY if we still haven't seen a pubkey
      singleReadTimeoutRef.current = window.setTimeout(() => {
        if (isGettingDeviceInfoRef.current) {
          addDebugLog('Device info scan timed out');
          isGettingDeviceInfoRef.current = false;
          setIsScanning(false);
          try {
            stopScan();
          } catch {}
          setError('Timed out reading device. Please try again.');
          setVerificationStep('failed');
          setIsProcessing(false);
        }
      }, 3500) as unknown as number;
    } catch (err) {
      const e = err as Error;
      addDebugLog(`startVerification failed: ${e?.message ?? String(err)}`);
      setError(`Failed: ${e.message}`);
      setVerificationStep('failed');
      setIsProcessing(false);
      isGettingDeviceInfoRef.current = false;
      try {
        stopScan();
      } catch {}
      setIsScanning(false);
    }
  };

  const startSigning = async (message: string) => {
    try {
      setError('');
      setVerificationStep('signing');
      setStatusText('Writing message to NFC chip...');
      setProgress(0);
      setSignature('');

      // Ensure no old cycle is running
      stopPowerCycling();
      try {
        stopScan();
      } catch {}

      addDebugLog(`Writing message len=${message.length}...`);
      await writeText(message);

      setStatusText('Message written! Computing signature...');
      setIsScanning(true);

      await new Promise((resolve) => setTimeout(resolve, 100));
      startPowerCycling();
    } catch (err) {
      const e = err as Error;
      addDebugLog(`startSigning failed: ${e?.message ?? String(err)}`);
      setError(`Failed: ${e.message}`);
      setVerificationStep('failed');
      setIsProcessing(false);
    }
  };

  const startPowerCycling = () => {
    let cycleCount = 0;
    const maxCycles = 100;
    let shouldContinue = true;

    const doCycle = async () => {
      if (cycleCount >= maxCycles) {
        stopPowerCycling();
        setError('Computation timeout');
        setVerificationStep('failed');
        addDebugLog('Power cycle timeout');
        return false;
      }
      if (!shouldContinue) return false;

      cycleCount++;
      addDebugLog(`Power cycle ${cycleCount}`);

      try {
        await startScan({
          pollMs: 300,
          deepResetEveryMs: 999999,
          deepResetPauseMs: 0,
          staleAfterMs: 999999,
        });
        await new Promise((resolve) => setTimeout(resolve, 20000));
        stopScan();

        await new Promise((resolve) => setTimeout(resolve, 500));

        await startScan({
          pollMs: 300,
          deepResetEveryMs: 999999,
          deepResetPauseMs: 0,
          staleAfterMs: 999999,
        });
        await new Promise((resolve) => setTimeout(resolve, 2000));
        stopScan();

        await new Promise((resolve) => setTimeout(resolve, 500));
        return true;
      } catch (err) {
        addDebugLog(
          `Power cycle error: ${String((err as any)?.message ?? err)}`,
        );
        return false;
      }
    };

    const runCycles = async () => {
      if (statusRef.current !== 'signing') {
        stopPowerCycling();
        return;
      }
      const continueNext = await doCycle();
      if (continueNext && shouldContinue && statusRef.current === 'signing') {
        powerCycleIntervalRef.current = window.setTimeout(
          () => runCycles(),
          100,
        );
      } else {
        stopPowerCycling();
      }
    };

    powerCycleIntervalRef.current = {
      stop: () => {
        shouldContinue = false;
      },
    } as any;

    runCycles();
  };

  const stopPowerCycling = () => {
    if (powerCycleIntervalRef.current) {
      if (
        typeof powerCycleIntervalRef.current === 'object' &&
        'stop' in powerCycleIntervalRef.current
      ) {
        (powerCycleIntervalRef.current as any).stop();
      } else {
        clearTimeout(powerCycleIntervalRef.current as number);
      }
      powerCycleIntervalRef.current = null;
    }
    try {
      stopScan();
    } catch {}
    setIsScanning(false);
  };

  const hexToBytes = (hex: string): Uint8Array => {
    const h = hex.replace(/^0x/i, '').trim();
    if (h.length % 2 !== 0) throw new Error(`Invalid hex length: ${h.length}`);
    const out = new Uint8Array(h.length / 2);
    for (let i = 0; i < out.length; i++) {
      out[i] = parseInt(h.substr(i * 2, 2), 16);
    }
    return out;
  };

  const verifySignature = (sigHex: string, pkHex: string, msg: string) => {
    try {
      addDebugLog(`verifySignature() starting... (raw ed25519)`);

      const sig = hexToBytes(sigHex);
      const pk = hexToBytes(pkHex);
      const msgBytes = new TextEncoder().encode(msg);

      const pkBytes = hexToBytes(pkHex);
      const sigBytes = hexToBytes(sigHex);
      const msgUtf8 = new TextEncoder().encode(msg);

      addDebugLog(
        `verify inputs bytes: pk=${pkBytes.length} sig=${sigBytes.length} msgUtf8=${msgUtf8.length} msg=${JSON.stringify(msg)}`,
      );

      if (sig.length !== 64)
        throw new Error(`Signature must be 64 bytes, got ${sig.length}`);
      if (pk.length !== 32)
        throw new Error(`Public key must be 32 bytes, got ${pk.length}`);

      const ok = nacl.sign.detached.verify(msgBytes, sig, pk);
      addDebugLog(`ed25519.verify result=${String(ok)}`);

      if (ok) {
        setVerificationStep('verified');
        setStatusText('Signature verified! Product is authentic.');
        setIsProcessing(false);
      } else {
        setVerificationStep('failed');
        setError('Signature verification failed (raw ed25519).');
        setIsProcessing(false);
      }
    } catch (err) {
      const e = err as Error;
      addDebugLog(`verifySignature exception: ${e?.message ?? String(err)}`);
      setVerificationStep('failed');
      setError(`Error verifying signature: ${e?.message ?? String(err)}`);
      setIsProcessing(false);
    }
  };

  const resetVerification = () => {
    setVerificationStep('idle');
    setPublicKey('');
    setChipId('');
    setSignature('');
    setRandomMessage('');
    setError('');
    setStatusText('');
    setProgress(0);
    setIsProcessing(false);
    setDebugLogs([]);
    setLastPayloadText('');
    isGettingDeviceInfoRef.current = false;

    if (singleReadTimeoutRef.current) {
      clearTimeout(singleReadTimeoutRef.current);
      singleReadTimeoutRef.current = null;
    }

    stopPowerCycling();
  };

  useEffect(() => {
    return () => {
      stopPowerCycling();
      if (singleReadTimeoutRef.current) {
        clearTimeout(singleReadTimeoutRef.current);
        singleReadTimeoutRef.current = null;
      }
    };
  }, []);

  if (extra.isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px] text-lg font-semibold">
        <Loader2 className="w-8 h-8 animate-spin mr-3" />
        Loading certificate...
      </div>
    );
  }

  if (extra.serverError) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px] text-lg font-semibold text-red-600">
        <XCircle className="w-8 h-8 mr-3" />
        Error loading certificate. Please try again later.
      </div>
    );
  }

  return (
    <div className="md:max-w-4xl md:mx-auto md:p-4 md:mt-8 md:mb-12">
      <div className="bg-white md:rounded-2xl md:shadow-xl overflow-hidden md:border md:border-gray-200">
        <div className="bg-purple-500 p-4 md:p-6 text-white">
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold mb-1 md:mb-2">
            {metadata.productName}
          </h1>
          {metadata.manufacturer && (
            <p className="text-pink-100 text-sm md:text-base">
              by {metadata.manufacturer}
            </p>
          )}
        </div>

        <div className="bg-gradient-to-br from-pink-50 to-purple-50">
          <div className="flex flex-col lg:flex-row lg:items-start">
            <div className="relative lg:w-2/5 p-4 md:p-6">
              {metadata.imageUrl ? (
                <img
                  src={metadata.imageUrl + '' || ''}
                  alt={metadata.productName + '' || 'Product'}
                  className="w-full max-w-xs mx-auto lg:mx-0 rounded-lg shadow-lg"
                />
              ) : (
                <div className="w-full max-w-xs mx-auto lg:mx-0 h-64 bg-gradient-to-br from-pink-200 to-purple-200 rounded-lg shadow-lg flex items-center justify-center">
                  <p className="text-gray-600 text-center px-4">
                    Product Image
                    <br />
                    <span className="text-sm">{metadata.productName}</span>
                  </p>
                </div>
              )}

              <div className="absolute top-2 right-2 md:top-4 md:right-4 bg-white/90 backdrop-blur-sm rounded-full p-2 md:p-3 shadow-lg">
                <Radio className="w-5 h-5 md:w-6 md:h-6 text-purple-600" />
              </div>
            </div>

            <div className="lg:w-3/5 p-4 md:p-6 space-y-4">
              {metadata.serialNumber && (
                <div>
                  <p className="text-xs md:text-sm text-gray-500 mb-1">
                    Serial Number
                  </p>
                  <p className="font-semibold text-gray-900 text-sm md:text-base">
                    {metadata.serialNumber}
                  </p>
                </div>
              )}
              {metadata.productionDate && (
                <div>
                  <p className="text-xs md:text-sm text-gray-500 mb-1">
                    Production Date
                  </p>
                  <p className="font-semibold text-gray-900 text-sm md:text-base">
                    {new Date(
                      metadata.productionDate + '',
                    ).toLocaleDateString()}
                  </p>
                </div>
              )}
              {metadata.materialInfo && (
                <div>
                  <p className="text-xs md:text-sm text-gray-500 mb-1">
                    Materials & Care
                  </p>
                  <p className="text-gray-900 text-sm md:text-base leading-relaxed">
                    {metadata.materialInfo}
                  </p>
                </div>
              )}

              {certificate && (
                <div className="p-3 md:p-4 bg-white/80 backdrop-blur-sm rounded-lg border border-gray-200 mt-4">
                  <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2 text-sm md:text-base">
                    <ShieldCheck className="w-4 h-4 md:w-5 md:h-5 text-purple-600" />
                    Blockchain Registration
                  </h3>
                  <div className="space-y-1.5 text-xs md:text-sm">
                    <div>
                      <span className="text-gray-500">Registered:</span>{' '}
                      <span className="font-mono text-xs text-gray-900">
                        {new Date(
                          certificate.creationTime * 1000,
                        ).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-start gap-1">
                      <span className="text-gray-500 flex-shrink-0">TX:</span>{' '}
                      <span className="font-mono text-xs text-gray-900 break-all">
                        {certificate.transactionHash}
                      </span>
                    </div>
                  </div>
                  <a
                    href={`https://cexplorer.io/tx/${certificate.transactionHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1.5 text-purple-600 hover:text-purple-700 font-medium text-xs md:text-sm"
                  >
                    View on Explorer
                    <ExternalLink className="w-3 h-3 md:w-4 md:h-4" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-4 md:p-6 border-t border-gray-200">
          <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 md:w-6 md:h-6 text-purple-600" />
            NFC Authenticity Verification
          </h3>

          {!isSupported && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 md:p-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 md:w-6 md:h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-blue-900 mb-2 text-sm md:text-base">
                    NFC Verification Unavailable
                  </h4>
                  <p className="text-blue-800 text-xs md:text-sm mb-3">
                    Web NFC is not supported on this device or browser. To
                    verify the authenticity of this product using the embedded
                    NFC chip, please:
                  </p>
                  <ul className="text-blue-800 text-xs md:text-sm space-y-1 ml-4 list-disc">
                    <li>Use an Android device with NFC capability</li>
                    <li>Open this page in Chrome browser</li>
                    <li>Ensure NFC is enabled in your device settings</li>
                    <li>
                      Allow NFC permissions for this website when prompted
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {isSupported && verificationStep === 'idle' && (
            <div className="text-center py-6 md:py-8">
              <p className="text-gray-600 mb-4 md:mb-6 text-sm md:text-base px-2">
                Verify the authenticity of this product using the embedded NFC
                chip.
                <br className="hidden md:block" />
                Hold your phone near the NFC symbol on the product.
              </p>
              <button
                onClick={startVerification}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-2.5 px-6 md:py-3 md:px-8 rounded-lg shadow-lg transition-all duration-200 flex items-center gap-2 md:gap-3 mx-auto text-sm md:text-base"
              >
                <Radio className="w-4 h-4 md:w-5 md:h-5" />
                Start Verification
              </button>
            </div>
          )}

          {(verificationStep === 'extracting-key' ||
            verificationStep === 'signing' ||
            verificationStep === 'verifying' ||
            verificationStep === 'failed') && (
            <div className="mt-4 p-3 rounded-lg border border-gray-200 bg-gray-50">
              <p className="text-xs font-semibold text-gray-700">Debug</p>
              <p className="text-xs text-gray-700">
                Last read:{' '}
                {lastReadTime
                  ? new Date(lastReadTime).toLocaleTimeString()
                  : '—'}{' '}
                {(verificationStep === 'signing' ||
                  verificationStep === 'verifying') && (
                  <span
                    className={tagInRange ? 'text-green-700' : 'text-red-700'}
                  >
                    {tagInRange
                      ? '(tag in range)'
                      : '(no reads for 5s — likely moved off tag)'}
                  </span>
                )}
              </p>
              <p className="text-xs text-gray-700 break-all">
                Last payload: {lastPayloadText || '—'}
              </p>

              <div className="mt-2 space-y-1">
                {debugLogs.map((line, i) => (
                  <p
                    key={i}
                    className="text-[11px] font-mono text-gray-700 break-all"
                  >
                    {line}
                  </p>
                ))}
              </div>
            </div>
          )}

          {isSupported &&
            (verificationStep === 'extracting-key' ||
              verificationStep === 'signing' ||
              verificationStep === 'verifying') && (
              <div className="space-y-3 md:space-y-4 mt-4">
                <div className="flex items-center gap-3 text-gray-700">
                  <Loader2 className="w-5 h-5 md:w-6 md:h-6 animate-spin text-purple-600" />
                  <span className="font-medium text-sm md:text-base">
                    {statusText}
                  </span>
                </div>

                {(verificationStep === 'signing' ||
                  verificationStep === 'verifying') && (
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs md:text-sm font-medium text-gray-600">
                        Progress
                      </span>
                      <span className="text-xs md:text-sm font-bold text-purple-600">
                        {progress}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 md:h-3 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-blue-500 h-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 md:p-4 flex items-start gap-2 md:gap-3">
                  <Radio className="w-4 h-4 md:w-5 md:h-5 text-blue-600 flex-shrink-0 mt-0.5 animate-pulse" />
                  <p className="text-xs md:text-sm text-blue-900">
                    Keep your phone steady near the NFC symbol. The chip is
                    powered by your phone&apos;s NFC field.
                  </p>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 md:p-4 flex items-start gap-2 md:gap-3">
                    <AlertCircle className="w-4 h-4 md:w-5 md:h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs md:text-sm text-red-900">{error}</p>
                  </div>
                )}
              </div>
            )}

          {isSupported && verificationStep === 'verified' && (
            <div className="space-y-4 md:space-y-6">
              <div className="text-center py-4 md:py-6">
                <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-green-100 rounded-full mb-3 md:mb-4">
                  <CheckCircle2 className="w-10 h-10 md:w-12 md:h-12 text-green-600" />
                </div>
                <h4 className="text-xl md:text-2xl font-bold text-green-600 mb-2">
                  Authentic Product Verified!
                </h4>
                <p className="text-gray-600 text-sm md:text-base px-2">
                  The cryptographic signature has been verified successfully.
                  This product is genuine.
                </p>
              </div>

              <div className="space-y-3 md:space-y-4">
                {chipId && (
                  <div className="relative">
                    <label className="block text-xs md:text-sm font-medium text-gray-600 mb-1">
                      Chip ID
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={chipId}
                        readOnly
                        className="flex-1 px-2.5 py-1.5 md:px-3 md:py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 text-xs md:text-sm font-mono"
                      />
                      <button
                        onClick={() => copyToClipboard(chipId, 'chipId')}
                        className="p-1.5 md:p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        {copiedField === 'chipId' ? (
                          <Check className="w-3.5 h-3.5 md:w-4 md:h-4 text-green-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>
                )}

                <div className="relative">
                  <label className="block text-xs md:text-sm font-medium text-gray-600 mb-1">
                    Public Key
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={publicKey}
                      readOnly
                      className="flex-1 px-2.5 py-1.5 md:px-3 md:py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 text-xs md:text-sm font-mono"
                    />
                    <button
                      onClick={() => copyToClipboard(publicKey, 'publicKey')}
                      className="p-1.5 md:p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      {copiedField === 'publicKey' ? (
                        <Check className="w-3.5 h-3.5 md:w-4 md:h-4 text-green-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="relative">
                  <label className="block text-xs md:text-sm font-medium text-gray-600 mb-1">
                    Random Message
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={randomMessage}
                      readOnly
                      className="flex-1 px-2.5 py-1.5 md:px-3 md:py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 text-xs md:text-sm font-mono"
                    />
                    <button
                      onClick={() => copyToClipboard(randomMessage, 'message')}
                      className="p-1.5 md:p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      {copiedField === 'message' ? (
                        <Check className="w-3.5 h-3.5 md:w-4 md:h-4 text-green-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="relative">
                  <label className="block text-xs md:text-sm font-medium text-gray-600 mb-1">
                    Signature
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={signature}
                      readOnly
                      className="flex-1 px-2.5 py-1.5 md:px-3 md:py-2 bg-green-50 border border-green-300 rounded-lg text-green-900 text-xs md:text-sm font-mono"
                    />
                    <button
                      onClick={() => copyToClipboard(signature, 'signature')}
                      className="p-1.5 md:p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      {copiedField === 'signature' ? (
                        <Check className="w-3.5 h-3.5 md:w-4 md:h-4 text-green-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <button
                onClick={resetVerification}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors text-sm md:text-base"
              >
                Verify Again
              </button>
            </div>
          )}

          {isSupported && verificationStep === 'failed' && (
            <div className="space-y-3 md:space-y-4">
              <div className="text-center py-4 md:py-6">
                <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-red-100 rounded-full mb-3 md:mb-4">
                  <XCircle className="w-10 h-10 md:w-12 md:h-12 text-red-600" />
                </div>
                <h4 className="text-xl md:text-2xl font-bold text-red-600 mb-2">
                  Verification Failed
                </h4>
                <p className="text-gray-600 mb-4 text-sm md:text-base px-2">
                  {error || 'Could not verify the product authenticity.'}
                </p>
              </div>

              <button
                onClick={resetVerification}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-2.5 md:py-3 px-6 rounded-lg transition-all text-sm md:text-base"
              >
                Try Again
              </button>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-gray-500 py-4">
          Copyright © 2026 Fabian Bormann
        </p>
      </div>
    </div>
  );
}

export default ProductVerificationView;
