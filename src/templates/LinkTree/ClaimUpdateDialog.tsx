import Modal from '../../components/Modal';
import { LinktreeData, Social, socials } from './common';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

declare interface ClaimUpdateDialogProps {
  open: boolean;
  variant: 'claim' | 'update';
  onClose: Function;
  password: string;
  userAddress: string;
  batchId: string | null;
  linkTreeData?: LinktreeData;
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
  linkTreeData,
  background,
  enabledWallet,
}: ClaimUpdateDialogProps) {
  const [updatedLinktreeData, setUpdatedLinktreeData] =
    useState<LinktreeData>();

  useEffect(() => {
    setUpdatedLinktreeData(linkTreeData);
  }, [linkTreeData]);

  let title = 'Claim Item';
  let description = (
    <p className="text-white text-md mt-2 mb-4 w-2/4 text-center">
      When claiming you can add your linktree to your item. You can update it in
      the future. If someone scans the QR code, they will see your linktree.{' '}
      <b>Leaving a field blank</b> will remove it from your linktree.
    </p>
  );
  if (variant === 'update') {
    title = 'Update Item';
    description = (
      <p className="text-white text-md mt-2 mb-4 w-2/4 text-center">
        You can update your linktree. If someone scans the QR code, they will
        see your linktree. <b>Leaving a field blank</b> will remove it from your
        linktree.
      </p>
    );
  }

  const changeLinktree = async () => {
    let response;
    try {
      response = await axios.post(
        import.meta.env.VITE_BACKEND_URL +
          `/api/v1/extension/connected-goods/${variant}/item`,
        {
          link_tree: {
            owner: userAddress,
            item_name: updatedLinktreeData?.itemName,
            picture: '',
            ...updatedLinktreeData,
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
        return;
      }
    }
    if (response && response.status === 200) {
      const transaction = response.data;
      const api = await (window as any).cardano[enabledWallet!].enable();
      const witnessSet = await api.signTx(transaction, true);
      const result = await axios.post(
        import.meta.env.VITE_BACKEND_URL + '/api/v1/transaction/submit',
        {
          transaction: transaction,
          witnessSet: witnessSet,
        }
      );
      if (result.status === 200) {
        toast.success(
          'Your transaction has been submitted. We just need to wait for a few confirmations (no longer than 2 minutes) and you will see your updated linktree.'
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

  return (
    <Modal
      title={title}
      size="full"
      background={background}
      isOpen={open}
      onClose={onClose}
    >
      <div className="flex flex-col w-full items-center justify-center">
        {description}
        {[
          { name: 'Name', key: 'name', icon: <></> } as Social,
          { name: 'Subtitle', key: 'subtitle', icon: <></> } as Social,
          ...socials,
        ].map((social: Social) => (
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
                className={`placeholder-white/60 w-full h-10 text-xs px-2 outline-hidden rounded bg-white/25 border border-[#FFFFFF40] text-white focus:bg-white/30 focus:shadow-center focus:shadow-white/50`}
                value={social.name}
              />
            </div>
            <div className="flex w-4/5 flex-col ml-1">
              <input
                autoFocus={false}
                type="text"
                className={`placeholder-white/60 w-full h-10 text-xs px-2 outline-hidden rounded bg-white/25 border border-[#FFFFFF40] text-white focus:bg-white/30 focus:shadow-center focus:shadow-white/50`}
                value={updatedLinktreeData?.[social.key] || ''}
                onChange={(event) => {
                  let update: string | null = event.target.value;
                  if (update === '') {
                    update = null;
                  }

                  const updatedData = {
                    ...updatedLinktreeData,
                    [social.key]: update,
                  };
                  setUpdatedLinktreeData(updatedData as LinktreeData);
                }}
              />
            </div>
          </div>
        ))}

        <div
          onClick={changeLinktree}
          className="m-2 mt-4 text-blue-400 flex items-center justify-center w-full max-w-[200px] h-10 rounded-lg cursor-pointer hover:bg-blue-200/10 border border-white/80 transition duration-200 hover:shadow-center hover:shadow-white/20"
        >
          <p className="ml-2 text-xs font-bold">{title}</p>
        </div>
      </div>
    </Modal>
  );
}

export default ClaimUpdateDialog;
