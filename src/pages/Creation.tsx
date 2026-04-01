import { useEffect, useMemo, useRef, useState } from 'react';
import Card from '../components/Card';
import Dropzone from '../components/Dropzone';
import Header from '../components/Header';
import { IconType } from '../components/Icons';
import Tabs from '../components/Tabs';
import TextArea from '../components/TextArea';
import Button from '../components/Button';
import { sha256 } from 'js-sha256';
import { useCardano } from '@cardano-foundation/cardano-connect-with-wallet';
import { NetworkType } from '@cardano-foundation/cardano-connect-with-wallet-core';
import { toast } from 'react-toastify';
import SelectedFileArea from '../components/SelectedFileArea';
import Fingerprint from '../components/Fingerprint';
import MetadataEditor, { MetadataHandle } from '../components/MetadataEditor';
import TemplateSelector from '../components/TemplateSelector';
import IconButton from '../components/IconButton';
import Preview from '../components/Preview';
import UpdatePolicySelector from '../components/UpdatePolicySelector';
import { timestampToDateTime } from '../utils/tools';
import { getTemplates, Templates } from '../templates';
import { useUVerifyTheme } from '../utils/hooks';
import { useUVerifyConfig } from '../utils/UVerifyConfigProvider';
import { ConnectWalletDialog } from '../components/ConnectWalletDialog';
import { DemoWalletDialog } from '../components/DemoWalletDialog';
import { UpdatePolicy } from '../utils/updatePolicy';
import { BuildTransactionParams } from '@uverify/core';
import {
  UVerifyClient,
  InsufficientFundsError,
  RateLimitError,
} from '@uverify/sdk';
import {
  DemoWallet,
  createDemoWallet,
  loadDemoWallet,
  clearDemoWallet,
  hasDemoWallet,
} from '../utils/demoWallet';

declare interface TransactionResult {
  successful: boolean;
  hash: string;
  transactionHash: string;
}

const Creation = () => {
  const [text, setText] = useState('');
  const config = useUVerifyConfig();
  const client = useMemo(
    () => new UVerifyClient({ baseUrl: config.backendUrl }),
    [config.backendUrl],
  );
  const pageRef = useRef<HTMLDivElement>(null);
  const [isWalletDialogOpen, setIsWalletDialogOpen] = useState(false);
  const [isDemoWalletDialogOpen, setIsDemoWalletDialogOpen] = useState(false);
  const [isCreatingDemoWallet, setIsCreatingDemoWallet] = useState(false);
  const [demoWallet, setDemoWallet] = useState<DemoWallet | null>(null);
  const [isFueling, setIsFueling] = useState(false);
  const pendingMetadataRef = useRef<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewMetadata, setPreviewMetadata] = useState('{}');
  const metadataEditorRef = useRef<MetadataHandle>(null);
  const [layoutMetadata, setLayoutMetadata] = useState<{
    [key: string]: string;
  }>({});
  const [selectedLayout, setSelectedLayout] = useState('default');
  const [requiredBootstrapToken, setRequiredBootstrapToken] = useState<
    string | undefined
  >(undefined);
  const [selectedUpdatePolicy, setSelectedUpdatePolicy] =
    useState<UpdatePolicy>('append');
  const [updateWhitelist, setUpdateWhitelist] = useState('');
  const [buttonState, setButtonState] = useState<
    'enabled' | 'loading' | 'disabled'
  >('enabled');
  const networkType =
    config.cardanoNetwork === 'mainnet'
      ? NetworkType.MAINNET
      : NetworkType.TESTNET;
  const {
    usedAddresses,
    unusedAddresses,
    isConnected,
    disconnect,
    enabledWallet,
  } = useCardano({
    limitNetwork: networkType,
  });
  const [fileHash, setFileHash] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | undefined>(undefined);
  const [transactionResult, setTransactionResult] =
    useState<TransactionResult>();
  // Captures uv_url_* plain values before the editor is reset so they can be
  // appended to the deep link after on-chain confirmation.
  const capturedUrlParamsRef = useRef('');
  const [activeTab, setActiveTab] = useState(0);
  const { applyTheme, restoreDefaults } = useUVerifyTheme();

  const [templates, setTemplates] = useState<Templates>({});

  useEffect(() => {
    async function loadTemplates() {
      const loadedTemplates = await getTemplates({
        backendUrl: config.backendUrl,
        networkType: config.cardanoNetwork,
        searchParams: new URLSearchParams(window.location.search),
      });
      setTemplates(loadedTemplates);
    }
    loadTemplates();
  }, [config]);

  useEffect(() => {
    if (config.cardanoNetwork === 'mainnet') {
      setDemoWallet(null);
      return;
    }
    if (hasDemoWallet()) {
      const w = loadDemoWallet();
      if (w) setDemoWallet(w);
    }
  }, [config.cardanoNetwork]);

  const showFingerprint =
    (activeTab === 0 && fileHash !== '') ||
    (activeTab === 1 && text.length > 0);
  const hash = showFingerprint && (activeTab === 0 ? fileHash : sha256(text));
  const userAddress =
    demoWallet?.address || usedAddresses[0] || unusedAddresses[0];
  const isWalletActive = isConnected || demoWallet !== null;

  const dropArea =
    typeof selectedFile === 'undefined' ? (
      <Dropzone
        className="min-h-[140px]"
        onDrop={(files: File[]) => {
          if (files.length === 0) return;
          if (files.length > 1) {
            toast.error('Please upload only one file.');
            return;
          }
          const file = files[0];
          const reader = new FileReader();
          reader.onload = (event) => {
            const result = event.target?.result;
            if (result instanceof ArrayBuffer) {
              setFileHash(sha256(new Uint8Array(result)));
              setSelectedFile(file);
            }
          };
          reader.onerror = (event) => {
            toast.error(
              'There was an error reading the file. Please try again.',
            );
            console.error(event);
          };
          reader.readAsArrayBuffer(file);
        }}
      />
    ) : (
      <SelectedFileArea
        selectedFile={selectedFile}
        onRemove={() => {
          setSelectedFile(undefined);
          setFileHash('');
        }}
      />
    );

  useEffect(() => {
    if (pageRef.current) {
      if (previewOpen) {
        pageRef.current.style.overflow = 'hidden';
      } else {
        pageRef.current.style.overflow = 'auto';
      }
    }
  }, [previewOpen]);

  useEffect(() => {
    if (transactionResult) {
      if (transactionResult.successful) {
        // Capture uv_url_* plain values BEFORE the editor resets them.
        capturedUrlParamsRef.current =
          metadataEditorRef.current?.urlParams().toString() ?? '';

        setText('');
        setFileHash('');
        metadataEditorRef.current?.reset();

        const toastId = toast.loading(
          'Your certificate has been submitted and is being secured on the blockchain. This usually takes about 20 seconds, though it can take up to 2 minutes to become a permanent, tamper-proof record.',
          { type: 'info' },
        );

        let cancelled = false;
        const { hash: dataHash, transactionHash } = transactionResult;
        client
          .waitFor(transactionHash)
          .then(() => {
            if (cancelled) return;
            const paramStr = capturedUrlParamsRef.current;
            const deepLink = `/verify/${dataHash}/${transactionHash}${paramStr ? '?' + paramStr : ''}`;
            toast.update(toastId, {
              render: (
                <a
                  href={deepLink}
                  target="_blank"
                  onClick={() => toast.dismiss()}
                >
                  Your data is now permanently secured and verifiable! Click
                  here to view your certificate.
                </a>
              ),
              type: 'success',
              closeButton: true,
              autoClose: 5000,
              isLoading: false,
            });
          })
          .catch(() => {
            if (cancelled) return;
            toast.update(toastId, {
              render:
                'Confirmation is taking longer than expected. Your certificate should appear shortly.',
              type: 'warning',
              isLoading: false,
              autoClose: 8000,
            });
          });
        return () => {
          cancelled = true;
        };
      } else {
        setTransactionResult(undefined);
        toast.error(
          'Transaction submission failed. Please try again or contact our support if the issue persists.',
        );
      }
    }
  }, [transactionResult, client]);

  const freezeData = async () => {
    if (!isWalletActive) return;

    const rawMetadata = metadataEditorRef.current?.metadata(selectedLayout);

    if (rawMetadata === undefined) {
      toast.error(
        'Please fill in all required metadata fields and remove any unnecessary ones from the form.',
      );
      return;
    }

    // Inject update policy metadata before submission.
    // Only stored when non-default so on-chain metadata stays minimal.
    let metadata = rawMetadata;
    if (selectedUpdatePolicy !== 'append') {
      const metaObj = JSON.parse(rawMetadata);
      metaObj.uverify_update_policy = selectedUpdatePolicy;
      if (selectedUpdatePolicy === 'whitelist' && updateWhitelist.trim()) {
        metaObj.uverify_update_whitelist = updateWhitelist
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
          .join(',');
      }
      metadata = JSON.stringify(metaObj);
    }

    await freezeDataWithWallet(metadata);
  };

  const freezeDataWithWallet = async (metadata: string, skipFaucet = false) => {
    if (!isWalletActive) return;
    if (!isConnected && !demoWallet) return;

    if (activeTab === 0 && fileHash === '') {
      toast.info('Please upload a file');
      return;
    }

    if (activeTab === 1 && text.length === 0) {
      toast.info('Please enter some text');
      return;
    }

    setButtonState('loading');
    const hash = activeTab === 0 ? fileHash : sha256(text);
    let faucetFlowStarted = false;
    try {
      const buildParams: BuildTransactionParams = {
        address: userAddress,
        hash,
        metadata: JSON.parse(metadata),
        bootstrapTokenName: requiredBootstrapToken,
        backendUrl: config.backendUrl,
        searchParams: new URLSearchParams(window.location.search),
      };

      const transaction = await (templates[selectedLayout].buildTransaction?.(
        buildParams,
      ) ??
        client.core
          .buildTransaction({
            type: requiredBootstrapToken ? 'custom' : 'default',
            address: userAddress,
            certificates: [
              { hash, metadata: JSON.parse(metadata), algorithm: 'SHA-256' },
            ],
            ...(requiredBootstrapToken
              ? { bootstrapDatum: { name: requiredBootstrapToken } }
              : {}),
          })
          .then((r) => r.unsignedTransaction));

      let witnessSet: string;
      if (demoWallet) {
        witnessSet = await demoWallet.signTx(transaction);
      } else if (enabledWallet) {
        const api = await (window as any).cardano[enabledWallet].enable();
        witnessSet = await api.signTx(transaction, true);
      } else {
        throw new Error('No wallet available for signing.');
      }

      const transactionHash = await client.core.submitTransaction(
        transaction,
        witnessSet,
      );
      setTransactionResult({ successful: true, hash, transactionHash });
    } catch (error: any) {
      // If the demo wallet has no funds, automatically top it up via the faucet.
      if (
        demoWallet &&
        !skipFaucet &&
        error instanceof InsufficientFundsError
      ) {
        faucetFlowStarted = true;
        pendingMetadataRef.current = metadata;
        setButtonState('disabled');
        setIsFueling(true);

        const fuelToastId = toast.loading(
          'Your demo wallet has no test Ada (tAda) yet. UVerify is getting some test funds for you, this should take no longer than a minute. Please keep this page open and do not refresh.',
          { type: 'info' },
        );

        const client = new UVerifyClient({ baseUrl: config.backendUrl });
        try {
          const faucetTxHash = await client.fundWallet(
            demoWallet.address,
            demoWallet.signMessage,
          );

          await client.waitFor(faucetTxHash, 3 * 60 * 1000);

          if (pendingMetadataRef.current) {
            const retryMeta = pendingMetadataRef.current;
            pendingMetadataRef.current = null;

            // Keep the loading toast alive and retry until UTXOs propagate.
            let propagated = false;
            while (!propagated) {
              try {
                await freezeDataWithWallet(retryMeta, true);
                propagated = true;
              } catch (retryError: unknown) {
                if (retryError instanceof InsufficientFundsError) {
                  await new Promise<void>((resolve) =>
                    setTimeout(resolve, 5_000),
                  );
                } else {
                  throw retryError;
                }
              }
            }

            toast.update(fuelToastId, {
              render: 'Wallet funded! Certificate created successfully.',
              type: 'success',
              isLoading: false,
              autoClose: 3000,
            });
          }
          return;
        } catch (faucetError: unknown) {
          let render: string;
          if (faucetError instanceof RateLimitError) {
            render =
              'This address already received test funds recently. Please wait a few minutes and try again.';
          } else if (
            faucetError instanceof Error &&
            faucetError.name === 'WaitForTimeoutError'
          ) {
            render =
              'Funding timed out. Try clicking "Create Trust Certificate" again in a moment.';
          } else {
            const msg =
              faucetError instanceof Error
                ? faucetError.message
                : 'Unknown error';
            render = `Faucet request failed: ${msg}`;
          }
          toast.update(fuelToastId, {
            render,
            type: 'error',
            isLoading: false,
            autoClose: 10000,
          });
          return;
        } finally {
          setIsFueling(false);
          setButtonState('enabled');
        }
      }

      // Re-throw InsufficientFundsError when called from the retry loop so the
      // while loop can catch it and keep retrying until UTXOs propagate.
      if (skipFaucet && error instanceof InsufficientFundsError) {
        throw error;
      }

      toast.error(
        'Transaction building failed or has been aborted. Please try again.',
      );
      console.error(error);
    } finally {
      if (!faucetFlowStarted) {
        setButtonState('enabled');
      }
    }
  };

  return (
    <div
      ref={pageRef}
      className={`${
        previewOpen && 'hidden'
      } flex flex-col text-center text-white max-w-(--breakpoint-sm) w-full pt-2 sm:pt-12 lg:max-w-(--breakpoint-md)`}
    >
      <Header title="Create Verifiable Data" />
      <Card className="mt-2 grow sm:mx-2 sm:mt-12 sm:grow-0 sm:mb-4">
        <h2 className="text-xl font-extrabold uppercase">
          Create a Verifiable Trust Certificate
        </h2>
        <h3 className="text-sm font-extrabold uppercase mb-4">
          Let's put it in the data fridge
        </h3>
        <p>
          Drop a file or write some plain text that you want to freeze in time.
        </p>

        <Tabs
          onChange={(index) => {
            setActiveTab(index);
          }}
          items={[
            {
              label: 'Upload File',
              icon: IconType.Upload,
              content: (
                <div className="flex items-center">
                  {dropArea}
                  {typeof hash === 'string' && <Fingerprint hash={hash} />}
                </div>
              ),
            },
            {
              label: 'Write Text',
              icon: IconType.Pen,
              content: (
                <div className="flex items-center">
                  <TextArea
                    rows={6}
                    className="min-h-[140px]"
                    value={text}
                    onChange={(event) => setText(event.target.value)}
                  ></TextArea>
                  {typeof hash === 'string' && <Fingerprint hash={hash} />}
                </div>
              ),
            },
          ]}
        />
        {hash && (
          <>
            <div className="flex flex-col items-start w-full mt-4 mb-2">
              <h3 className="text-sm mr-4">Certificate Template</h3>
              <div className="flex flex-row w-full items-center my-2">
                <TemplateSelector
                  userAddress={userAddress}
                  onChange={(
                    layout: string,
                    metadata: { [key: string]: string },
                    bootstrapTokenName?: string,
                  ) => {
                    setSelectedLayout(layout);
                    setLayoutMetadata(metadata);
                    setRequiredBootstrapToken(bootstrapTokenName);
                    // Apply the template's declared default update policy, or
                    // fall back to 'append' when the template has no preference.
                    const defaultPolicy = (templates[layout] as any)
                      ?.defaultUpdatePolicy as UpdatePolicy | undefined;
                    setSelectedUpdatePolicy(defaultPolicy ?? 'append');
                    setUpdateWhitelist('');
                  }}
                />
                <IconButton
                  onClick={() => {
                    const metadata =
                      metadataEditorRef.current?.metadata(selectedLayout);
                    if (metadata === undefined) {
                      toast.error(
                        'Please fill in all required metadata fields and remove any unnecessary ones from the form.',
                      );
                      return;
                    }
                    applyTheme(templates[selectedLayout].theme);
                    setPreviewMetadata(metadata);
                    setPreviewOpen(true);
                  }}
                  iconType={IconType.Eye}
                  className="mx-2"
                />
                <Preview
                  isOpen={previewOpen}
                  close={() => {
                    restoreDefaults();
                    setPreviewOpen(false);
                    setPreviewMetadata('{}');
                  }}
                  templateId={selectedLayout}
                  hash={hash}
                  metadata={previewMetadata}
                  certificate={{
                    hash: hash,
                    address: userAddress,
                    blockHash:
                      '71fdd15d024cced315d1a247d158227404936fdbddb2b9b632293032c956051a',
                    blockNumber: 11571661,
                    transactionHash:
                      '7151f82b8efc78d56f63a19ddaed1ca36e61533d8b0bddbb19fe5483009a684f',
                    slot: 149768853,
                    creationTime: Date.now(),
                    metadata: previewMetadata,
                    issuer: userAddress,
                  }}
                  pagination={<></>}
                  extra={{
                    hashedMultipleTimes: false,
                    firstDateTime: timestampToDateTime(Date.now()),
                    issuer: userAddress,
                    serverError: false,
                    isLoading: false,
                  }}
                />
              </div>
            </div>

            <UpdatePolicySelector
              className="mt-4 mb-2"
              value={selectedUpdatePolicy}
              whitelist={updateWhitelist}
              onChange={(policy, whitelist) => {
                setSelectedUpdatePolicy(policy);
                setUpdateWhitelist(whitelist);
              }}
            />

            <MetadataEditor
              className={activeTab === 0 ? 'mt-1' : 'mt-2'}
              ref={metadataEditorRef}
              layoutMetadata={layoutMetadata}
            />
          </>
        )}

        <ConnectWalletDialog
          isWalletDialogOpen={isWalletDialogOpen}
          setIsWalletDialogOpen={setIsWalletDialogOpen}
          networkType={networkType}
        />
        <DemoWalletDialog
          isOpen={isDemoWalletDialogOpen}
          isCreating={isCreatingDemoWallet}
          onConfirm={async () => {
            setIsCreatingDemoWallet(true);
            try {
              const w = createDemoWallet();
              setDemoWallet(w);
              setIsDemoWalletDialogOpen(false);
            } catch (err) {
              toast.error('Failed to create demo wallet. Please try again.');
              console.error(err);
            } finally {
              setIsCreatingDemoWallet(false);
            }
          }}
          onClose={() => setIsDemoWalletDialogOpen(false)}
        />
        {isWalletActive ? (
          <div className="flex flex-col items-center">
            {isFueling ? (
              <Button
                className="mt-4 min-w-[236px]"
                state="loading"
                label="Funding wallet…"
                variant="default"
                color="cyan"
                disabled
              />
            ) : (
              <Button
                className="mt-4 min-w-[236px]"
                state={buttonState}
                disabled={!hash || buttonState === 'disabled'}
                label="Create Trust Certificate"
                variant="default"
                onClick={freezeData}
                color="green"
              />
            )}
            <Button
              color="pink"
              variant="default"
              className="mt-4 min-w-[236px]"
              label={
                demoWallet ? 'Disconnect Demo Wallet' : 'Disconnect Wallet'
              }
              onClick={() => {
                if (demoWallet) {
                  clearDemoWallet();
                  setDemoWallet(null);
                } else {
                  disconnect();
                }
              }}
            />
            {demoWallet && (
              <p className="mt-3 text-xs text-white/45 max-w-xs text-center leading-relaxed">
                Using a disposable demo wallet on preprod. Your key is stored in
                local storage only.
              </p>
            )}
            {!demoWallet && (
              <p className="mt-4 text-xs text-white/45 max-w-xs text-center leading-relaxed">
                Need to issue many certificates?{' '}
                <a
                  href="https://docs.uverify.io/sdk"
                  target="_blank"
                  rel="noreferrer"
                  className="underline underline-offset-2 hover:text-white/75 transition-colors duration-200"
                >
                  Use our SDK
                </a>{' '}
                or{' '}
                <a
                  href="mailto:hello@uverify.io"
                  className="underline underline-offset-2 hover:text-white/75 transition-colors duration-200"
                >
                  contact us
                </a>{' '}
                for bulk batching.
              </p>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center">
            <Button
              className="mt-4 min-w-[236px]"
              state={buttonState}
              label="Connect Wallet"
              variant="default"
              onClick={() => setIsWalletDialogOpen(true)}
              color="cyan"
            />
            {config.cardanoNetwork !== 'mainnet' && (
              <Button
                className="mt-4 min-w-[236px]"
                onClick={() => setIsDemoWalletDialogOpen(true)}
                color="purple"
                variant="default"
                label="Use Demo Wallet"
              />
            )}
            {config.cardanoNetwork === 'mainnet' && (
              <p className="mt-4 text-xs text-white/45 max-w-xs text-center leading-relaxed">
                Want to try it first?{' '}
                <a
                  href="https://app.preprod.uverify.io/create"
                  target="_blank"
                  rel="noreferrer"
                  className="underline underline-offset-2 hover:text-white/75 transition-colors duration-200"
                >
                  The preprod deployment
                </a>{' '}
                lets you create certificates without a wallet or any funds.
              </p>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};

export default Creation;
