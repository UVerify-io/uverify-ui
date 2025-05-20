import Modal from '../../components/Modal';
import { SocialHubData, Social, socials } from './common';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useUVerifyConfig } from '../../utils/UVerifyConfigProvider';

declare interface ClaimUpdateDialogProps {
  open: boolean;
  variant: 'claim' | 'update';
  onClose: Function;
  password: string;
  userAddress: string;
  batchId: string | null;
  socialHubData?: SocialHubData;
  background: string;
  enabledWallet: string | null;
}

function ClaimUpdateDialog({
  open,
  variant,
  onClose,
  password,
  userAddress,
  batchId,
  socialHubData,
  background,
  enabledWallet,
}: ClaimUpdateDialogProps) {
  const [updatedSocialHubData, setUpdatedSocialHubData] =
    useState<SocialHubData>();
  const config = useUVerifyConfig();

  useEffect(() => {
    setUpdatedSocialHubData(socialHubData);
  }, [socialHubData]);

  let title = 'Claim Item';
  let description = (
    <p className="text-white text-md mt-2 mb-4 sm:w-3/4 max-w-[600px] text-center">
      When claiming, you can link your social hub to your item and update it
      anytime in the future. If someone scans the QR code, they'll see the
      links, making it easy to connect with your social accounts.{' '}
      <b>Leaving a field blank</b> will remove it from the list.
    </p>
  );
  if (variant === 'update') {
    title = 'Update Item';
    description = (
      <p className="text-white text-md mt-2 mb-4 sm:w-3/4 max-w-[600px] text-center">
        You can update your social hub at any time. When someone scans your QR
        code, they'll see the links listed, making it easy to connect with your
        social accounts. <b>Leaving a field blank</b> will remove it from the
        list.
      </p>
    );
  }

  let disclaimer = (
    <div className="sm:w-3/4 max-w-[600px] my-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-md shadow-md">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg
            className="h-6 w-6 text-yellow-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z"
            />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-lg font-medium">Important Disclaimer</h3>
          <p className="mt-2 text-sm">
            Your social hub will be <b>stored on-chain in encrypted form</b>. To
            encrypt and decrypt your data without UVerify, you would need both
            the dynamic item password from the physical item and a static
            password. While this application lets you update your information,
            previous versions will still be preserved in earlier transactions.
            This means that{' '}
            <b>
              if someone manages to break the encryption, your data could be
              exposed
            </b>
            . Please be cautious when sharing combinations of social media
            usernames or ADA handles, as this information could potentially link
            your transactions to your real identity.
          </p>
        </div>
      </div>
    </div>
  );

  const changeSocialHub = async () => {
    let response;

    if (
      updatedSocialHubData?.website &&
      !(
        updatedSocialHubData?.website.startsWith('https://') ||
        updatedSocialHubData?.website.startsWith('http://') ||
        updatedSocialHubData?.website.startsWith('ipfs://')
      )
    ) {
      toast.warning(
        'Please make sure to use a valid URL format for the website field that starts with "https://" or "http://" or "ipfs://".'
      );
      return;
    }

    try {
      response = await axios.post(
        config.backendUrl + `/api/v1/extension/connected-goods/${variant}/item`,
        {
          social_hub: {
            owner: userAddress,
            item_name: updatedSocialHubData?.itemName,
            ...updatedSocialHubData,
          },
          password: password,
          batch_id: batchId,
          user_address: userAddress,
        }
      );
    } catch (error) {
      console.error('Error claiming item:', error);
      if (variant == 'claim') {
        toast.error('Failed to claim item. Please try again.');
      } else {
        toast.error(
          'Failed to update item. Make sure you connected the correct wallet and try again.'
        );
      }
      return;
    }
    if (response && response.status === 200) {
      const transaction = response.data;
      const api = await (window as any).cardano[enabledWallet!].enable();
      const witnessSet = await api.signTx(transaction, true);
      const result = await axios.post(
        config.backendUrl + '/api/v1/transaction/submit',
        {
          transaction: transaction,
          witnessSet: witnessSet,
        }
      );
      if (result.status === 200) {
        toast.success(
          'Your transaction has been submitted. We just need to wait for a few confirmations (no longer than 2 minutes) and you will see your updated socialHub.'
        );
      } else {
        toast.error(
          'Transaction submission failed. Please try again or contact our support if the issue persists.'
        );
        return;
      }
    } else {
      console.error(
        'Error claiming item:',
        response?.status || 'Request failed'
      );
      if (variant == 'claim') {
        toast.error('Failed to claim item. Please try again.');
      } else {
        toast.error('Failed to update item. Please try again.');
      }
      return;
    }
    onClose();
  };

  // TODO: Remove filter for website and fix validator or encryption logic instead
  return (
    <Modal
      title={title}
      size="full"
      background={background}
      isOpen={open}
      onClose={onClose}
    >
      {description}
      <div className="flex flex-col w-full items-center justify-center">
        {[
          {
            name: 'Name',
            key: 'name',
            icon: <></>,
            description: 'John Doe',
          } as Social,
          {
            name: 'Subtitle',
            key: 'subtitle',
            icon: <></>,
            description: 'Software Engineer | Global Solutions Inc.',
          } as Social,
          ...socials,
        ]
          .filter((social: Social) => social.key != 'website')
          .map((social: Social) => (
            <div
              key={social.key}
              className="flex w-full max-w-[600px] items-start my-1"
            >
              <div className="flex w-1/5 flex-col mr-1">
                <input
                  autoFocus={false}
                  type="text"
                  disabled={true}
                  onBlur={(event) => {
                    if (event.target.value === '') {
                      event.target.placeholder = 'Key';
                    }
                  }}
                  readOnly={true}
                  className={`w-full h-10 text-xs px-2 outline-hidden rounded bg-white/25 border border-[#FFFFFF40] text-white focus:bg-white/30 focus:shadow-center focus:shadow-white/50`}
                  value={social.name}
                />
              </div>
              <div className="flex w-4/5 flex-col ml-1">
                <input
                  autoFocus={false}
                  type="text"
                  placeholder={social.description}
                  className={`focus:placeholder-transparent placeholder-white/60 w-full h-10 text-xs px-2 outline-hidden rounded bg-white/25 border border-[#FFFFFF40] text-white focus:bg-white/30 focus:shadow-center focus:shadow-white/50`}
                  value={updatedSocialHubData?.[social.key] || ''}
                  onChange={(event) => {
                    let update: string | null = event.target.value;
                    if (update === '') {
                      update = null;
                    }

                    const updatedData = {
                      ...updatedSocialHubData,
                      [social.key]: update,
                    };
                    setUpdatedSocialHubData(updatedData as SocialHubData);
                  }}
                />
              </div>
            </div>
          ))}

        <div
          onClick={changeSocialHub}
          className="m-2 mt-4 text-blue-400 flex items-center justify-center w-full max-w-[200px] h-10 rounded-lg cursor-pointer hover:bg-blue-200/10 border border-white/80 transition duration-200 hover:shadow-center hover:shadow-white/20"
        >
          <p className="ml-2 text-xs font-bold">{title}</p>
        </div>
        {disclaimer}
      </div>
    </Modal>
  );
}

export default ClaimUpdateDialog;
