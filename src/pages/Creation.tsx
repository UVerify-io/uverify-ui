import { useEffect, useRef, useState } from 'react';
import Card from '../components/Card';
import Dropzone from '../components/Dropzone';
import Header from '../components/Header';
import { IconType, InfoIcon } from '../components/Icons';
import Tabs from '../components/Tabs';
import TextArea from '../components/TextArea';
import Button from '../components/Button';
import { sha256 } from 'js-sha256';
import axios from 'axios';
import {
  ConnectWalletList,
  useCardano,
} from '@cardano-foundation/cardano-connect-with-wallet';
import {
  NetworkType,
  UnavailableWalletVisibility,
} from '@cardano-foundation/cardano-connect-with-wallet-core';
import Modal from '../components/Modal';
import { toast } from 'react-toastify';
import SelectedFileArea from '../components/SelectedFileArea';
import Fingerprint from '../components/Fingerprint';
import MetadataEditor, { MetadataHandle } from '../components/MetadataEditor';
import TemplateSelector from '../components/TemplateSelector';
import IconButton from '../components/IconButton';
import Preview from '../components/Preview';
import { timestampToDateTime } from '../utils/tools';
import { templates } from '../templates';
import { useUVerifyTheme } from '../utils/hooks';

declare interface TransactionResult {
  successful: boolean;
  hash: string;
  transactionHash: string;
}

const Creation = () => {
  const networkType =
    import.meta.env.VITE_CARDANO_NETWORK === 'mainnet'
      ? NetworkType.MAINNET
      : NetworkType.TESTNET;
  const [text, setText] = useState('');
  const pageRef = useRef<HTMLDivElement>(null);
  const [isWalletDialogOpen, setIsWalletDialogOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewMetadata, setPreviewMetadata] = useState('{}');
  const metadataEditorRef = useRef<MetadataHandle>(null);
  const [layoutMetadata, setLayoutMetadata] = useState<{
    [key: string]: string;
  }>({});
  const [selectedLayout, setSelectedLayout] = useState('default');
  const [buttonState, setButtonState] = useState<
    'enabled' | 'loading' | 'disabled'
  >('enabled');
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
  const [activeTab, setActiveTab] = useState(0);
  const { applyTheme, restoreDefaults } = useUVerifyTheme();

  const showFingerprint =
    (activeTab === 0 && fileHash !== '') ||
    (activeTab === 1 && text.length > 0);
  const hash = showFingerprint && (activeTab === 0 ? fileHash : sha256(text));
  const userAddress = usedAddresses[0] || unusedAddresses[0];

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
            if (typeof result === 'string') {
              setFileHash(sha256(result));
              setSelectedFile(file);
            }
          };
          reader.onerror = (event) => {
            toast.error(
              'There was an error reading the file. Please try again.'
            );
            console.error(event);
          };
          reader.readAsText(file);
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
        setText('');
        setFileHash('');
        metadataEditorRef.current?.reset();

        const toastId = toast.loading(
          'Your transaction has been submitted, and your data will now be distributed worldwide. We just need to wait for a few confirmations (no longer than 2 minutes) until it is verified.',
          {
            type: 'info',
          }
        );
        const interval = setInterval(async () => {
          const response = await axios.get(
            import.meta.env.VITE_BACKEND_URL +
              `/api/v1/verify/by-transaction-hash/${transactionResult.transactionHash}/${transactionResult.hash}`
          );
          if (response.status === 200) {
            clearInterval(interval);
            toast.update(toastId, {
              render: (
                <a
                  href={`/verify/${transactionResult.hash}/${transactionResult.transactionHash}`}
                  target="_blank"
                  onClick={() => {
                    toast.dismiss();
                  }}
                >
                  Your data is now on-chain and verifiable! Click on this
                  message to access your certificate.
                </a>
              ),
              type: 'success',
              closeButton: true,
              autoClose: 5000,
              isLoading: false,
            });
          }
        }, 5000);
        return () => {
          clearInterval(interval);
        };
      } else {
        setTransactionResult(undefined);
        toast.error(
          'Transaction submission failed. Please try again or contact our support if the issue persists.'
        );
      }
    }
  }, [transactionResult]);

  const freezeData = async () => {
    const metadata = metadataEditorRef.current?.metadata(selectedLayout);

    if (metadata === undefined) {
      toast.error(
        'Please fill in all required metadata fields and remove any unnecessary ones from the form.'
      );
      return;
    }

    await freezeDataWithWallet(metadata);
  };

  const freezeDataWithWallet = async (metadata: string) => {
    if (!isConnected || !enabledWallet) {
      return;
    }

    if (activeTab === 0 && fileHash === '') {
      toast.info('Please upload a file');
      return;
    }

    if (activeTab === 1 && text.length === 0) {
      toast.info('Please enter some text');
      return;
    }

    const apiUrl = import.meta.env.VITE_BACKEND_URL;

    setButtonState('loading');
    const hash = activeTab === 0 ? fileHash : sha256(text);
    try {
      const response = await axios.post(apiUrl + '/api/v1/transaction/build', {
        type: 'DEFAULT',
        address: userAddress,
        certificates: [
          {
            hash: hash,
            metadata: metadata,
            algorithm: 'SHA-256',
          },
        ],
      });

      if (response.status === 200 && response.data.status?.code === 'SUCCESS') {
        const transaction = response.data.unsigned_transaction;
        const api = await (window as any).cardano[enabledWallet].enable();
        const witnessSet = await api.signTx(transaction, true);
        const result = await axios.post(apiUrl + '/api/v1/transaction/submit', {
          transaction: transaction,
          witnessSet: witnessSet,
        });
        setTransactionResult({
          successful: result.data.successful,
          hash: hash,
          transactionHash: result.data.value,
        });
      } else {
        toast.error(
          'Transaction building failed or has been aborted. Please try again.'
        );
        if (response.data.status?.code === 'ERROR') {
          console.error(response.data.status.message);
        }
        setButtonState('enabled');
      }
    } catch (error) {
      toast.error(
        'Transaction building failed or has been aborted. Please try again.'
      );
      console.error(error);
    } finally {
      setButtonState('enabled');
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
                    metadata: { [key: string]: string }
                  ) => {
                    setSelectedLayout(layout);
                    setLayoutMetadata(metadata);
                  }}
                />
                <IconButton
                  onClick={() => {
                    const metadata =
                      metadataEditorRef.current?.metadata(selectedLayout);
                    if (metadata === undefined) {
                      toast.error(
                        'Please fill in all required metadata fields and remove any unnecessary ones from the form.'
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
                    block_hash:
                      '71fdd15d024cced315d1a247d158227404936fdbddb2b9b632293032c956051a',
                    block_number: 11571661,
                    transaction_hash:
                      '7151f82b8efc78d56f63a19ddaed1ca36e61533d8b0bddbb19fe5483009a684f',
                    slot: 149768853,
                    creation_time: Date.now(),
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

            <MetadataEditor
              className={activeTab === 0 ? 'mt-1' : 'mt-2'}
              ref={metadataEditorRef}
              layoutMetadata={layoutMetadata}
            />
          </>
        )}

        <Modal
          title="Connect Wallet"
          isOpen={isWalletDialogOpen}
          onClose={() => setIsWalletDialogOpen(false)}
        >
          <ConnectWalletList
            borderRadius={5}
            showUnavailableWallets={
              UnavailableWalletVisibility.SHOW_UNAVAILABLE
            }
            supportedWallets={['yoroi', 'lace', 'nami', 'eternl', 'vespr']}
            onConnect={() => setIsWalletDialogOpen(false)}
            gap={6}
            customCSS={`
              width: 100%;
              & > span {
                color: #FFFFFFAA;
                background-color: rgb(255 255 255 / 0.2);
                border: 1px solid #FFFFFF40;
                transition-duration: 200ms;
              }
              & > span:hover {
                  background-color: rgb(255 255 255 / 0.3);
                  color: white;
                  box-shadow: 0 0 12px 0 rgb(255 255 255 / 0.1);
                }
              }
            `}
            limitNetwork={networkType}
          />
          <div className="mt-4">
            <a
              href="#"
              className="inline-flex items-center text-xs font-normal hover:underline"
            >
              <InfoIcon className="w-3 h-3 me-2" />
              Why do I need to connect with my wallet?
            </a>
          </div>
        </Modal>
        {isConnected ? (
          <div className="flex flex-col items-center">
            <Button
              className="mt-4 min-w-[236px]"
              state={buttonState}
              label="Create Trust Certificate"
              variant="glass"
              onClick={freezeData}
              color="blue"
            />
            <Button
              color="pink"
              variant="contained"
              className="mt-4 min-w-[236px]"
              label="Disconnect Wallet"
              onClick={disconnect}
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center">
            <Button
              className="mt-4 min-w-[236px]"
              state={buttonState}
              label="Connect Wallet"
              variant="glass"
              onClick={() => setIsWalletDialogOpen(true)}
              color="blue"
            />
          </div>
        )}
      </Card>
    </div>
  );
};

export default Creation;
