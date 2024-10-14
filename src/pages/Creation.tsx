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
import { useSearchParams } from 'react-router-dom';
import SelectedFileArea from '../components/SelectedFileArea';
import Fingerprint from '../components/Fingerprint';
import PaypalConnectButton from '../components/PaypalConnectButton';
import PaypalCheckoutButton from '../components/PaypalCheckoutButton';
import { useLocalStorage } from '../utils/hooks';
import { jwtDecode } from 'jwt-decode';
import MetadataEditor, { MetadataHandle } from '../components/MetadataEditor';
import { BearerTokenResponse } from '../common/types';

declare interface TransactionResult {
  successful: boolean;
  hash: string;
  transactionHash: string;
}

const Creation = () => {
  const [text, setText] = useState('');
  const [isWalletDialogOpen, setIsWalletDialogOpen] = useState(false);
  const [buyCreditsDialogOpen, setBuyCreditsDialogOpen] = useState(false);
  const metadataEditorRef = useRef<MetadataHandle>(null);
  const [buttonState, setButtonState] = useState<
    'enabled' | 'loading' | 'disabled'
  >('enabled');
  const { usedAddresses, isConnected, disconnect, enabledWallet } = useCardano({
    limitNetwork: NetworkType.TESTNET,
  });
  const [paypalBearerToken, setPaypalBearerToken] = useLocalStorage<string>(
    'uverify-paypal-bearer-token',
    ''
  );

  let decodedBearerToken: BearerTokenResponse | undefined;
  if (paypalBearerToken !== '') {
    decodedBearerToken = jwtDecode(paypalBearerToken);
  }

  const [fileHash, setFileHash] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | undefined>(undefined);
  const [transactionResult, setTransactionResult] =
    useState<TransactionResult>();
  const [activeTab, setActiveTab] = useState(0);

  const showFingerprint =
    (activeTab === 0 && fileHash !== '') ||
    (activeTab === 1 && text.length > 0);
  const hash = showFingerprint && (activeTab === 0 ? fileHash : sha256(text));

  const [searchParams, setSearchParams] = useSearchParams();

  const creditsSpan = (text: string) => (
    <span className="bg-white/10 border border-white/30 text-white text-xs font-medium px-2 py-0.5 rounded">
      {text}
    </span>
  );

  useEffect(() => {
    if (searchParams.has('code')) {
      const authorizationCode = searchParams.get('code');
      searchParams.delete('code');

      if (searchParams.has('scope')) {
        searchParams.delete('scope');
      }
      setSearchParams(searchParams);

      axios
        .post(import.meta.env.VITE_BACKEND_URL + '/api/v1/web2/login/paypal', {
          authorizationCode: authorizationCode,
        })
        .then((response) => {
          setPaypalBearerToken(response.data.bearerToken);
        })
        .catch((error) => {
          toast.error('Paypal login failed. Please try again.');
          console.error('Error:', error.response.data);
        });
    }
  }, [searchParams]);

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
                  Your data is now on-chain and verifiable! 🥶 Click on this
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
    const metadata = metadataEditorRef.current?.metadata();

    if (metadata === undefined) {
      toast.error(
        'Please fill in all required metadata fields and remove any unnecessary ones from the form.'
      );
      return;
    }

    if (paypalBearerToken === '') {
      await freezeDataWithWallet(metadata);
    } else {
      await freezeDataWithCredits(metadata);
    }
  };

  const freezeDataWithCredits = async (metadata: string) => {
    if (paypalBearerToken === '' || decodedBearerToken?.credits === 0) {
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
    const hash = activeTab === 0 ? fileHash : sha256(text);
    setButtonState('loading');
    try {
      const response = await axios.post(
        apiUrl + '/api/v1/paypal/transaction/submit',
        {
          hash: hash,
          metadata: metadata,
        },
        {
          headers: {
            Authorization: `Bearer ${paypalBearerToken}`,
          },
        }
      );

      if (response.status === 200 && response.data.successful) {
        const result = {
          successful: true,
          hash: hash,
          transactionHash: response.data.value,
        };
        setPaypalBearerToken(response.data.bearerToken);
        setTransactionResult(result);
      } else {
        toast.error(
          'Transaction building failed or has been aborted. Please try again.'
        );
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
    const address = usedAddresses[0];

    setButtonState('loading');
    try {
      const hash = activeTab === 0 ? fileHash : sha256(text);
      const response = await axios.post(apiUrl + '/api/v1/transaction/build', {
        address: address,
        hash: hash,
        metadata: metadata,
      });

      if (response.status === 200) {
        const transaction = response.data.unsignedTransaction;
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
    <div className="flex flex-col text-center text-white max-w-screen-sm w-full pt-2 sm:pt-12 lg:max-w-screen-md">
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
        <MetadataEditor
          className={activeTab === 0 ? 'mt-1' : 'mt-2'}
          ref={metadataEditorRef}
        />
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
            limitNetwork={NetworkType.TESTNET}
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
        {!(isConnected || paypalBearerToken !== '') ? (
          <div className="flex flex-col items-center justify-center">
            <Button
              className="mt-4 min-w-[236px]"
              state={buttonState}
              label="Connect Wallet"
              variant="glass"
              onClick={() => setIsWalletDialogOpen(true)}
              color="blue"
            />
            <div className="relative flex py-2 items-center w-1/2">
              <div className="flex-grow border-t border-white/80"></div>
              <span className="flex-shrink mx-2 text-white/80 uppercase">
                or
              </span>
              <div className="flex-grow border-t border-white/80"></div>
            </div>

            <PaypalConnectButton />
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <Button
              className="mt-4 min-w-[236px]"
              state={buttonState}
              label="Create Trust Certificate"
              variant="glass"
              onClick={() => freezeData()}
              color="blue"
              disabled={
                paypalBearerToken !== '' && decodedBearerToken?.credits === 0
              }
            />
            {paypalBearerToken !== '' && (
              <p className="my-4 text-xs">
                Creating a trust certificate will use 1 {creditsSpan('Credit')}.
                You have {decodedBearerToken?.credits || 0}{' '}
                {creditsSpan(
                  (decodedBearerToken?.credits || 0) === 1
                    ? 'Credit'
                    : 'Credits'
                )}
                .
              </p>
            )}
            {paypalBearerToken !== '' && (
              <Button
                label="Buy Credits"
                variant="glass"
                className="mt-2 min-w-[236px]"
                onClick={() => setBuyCreditsDialogOpen(true)}
                color="blue"
              />
            )}
            <Button
              color="pink"
              variant="contained"
              className="mt-4 min-w-[236px]"
              label={
                isConnected ? 'Disconnect Wallet' : 'Disconnect Paypal Account'
              }
              onClick={() => {
                if (isConnected) {
                  disconnect();
                } else {
                  setPaypalBearerToken('');
                }
              }}
            />
            {paypalBearerToken !== '' && (
              <Modal
                title="Buy Credits"
                size="lg"
                isOpen={buyCreditsDialogOpen}
                onClose={() => setBuyCreditsDialogOpen(false)}
              >
                <PaypalCheckoutButton
                  paypalUserId={decodedBearerToken?.sub}
                  bearerToken={paypalBearerToken}
                  onPaymentComplete={(amount) => {
                    setBuyCreditsDialogOpen(false);
                    toast.success(
                      `Successfully purchased ${amount} ${
                        amount === 1 ? 'credit' : 'credits'
                      }!`
                    );
                  }}
                  updateBearerToken={(bearerToken) =>
                    setPaypalBearerToken(bearerToken)
                  }
                />
              </Modal>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};

export default Creation;
