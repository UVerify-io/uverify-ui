import Modal from './Modal';
import Button from './Button';

interface DemoWalletDialogProps {
  isOpen: boolean;
  isCreating: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function DemoWalletDialog({
  isOpen,
  isCreating,
  onConfirm,
  onClose,
}: DemoWalletDialogProps) {
  return (
    <Modal title="No wallet? No problem." isOpen={isOpen} onClose={onClose}>
      <div className="flex flex-col gap-4 max-w-sm">
        <p className="text-white/80 leading-relaxed">
          A wallet sounds sophisticated, but it's actually just a pair of
          cryptographic keys. We can create a disposable one for you right here
          in your browser: <br />
          No extensions, no sign-ups.
        </p>
        <p className="text-white/80 leading-relaxed">
          Want to play around with a demo wallet?
        </p>
        <div className="mt-2 p-3 bg-yellow-500/20 border border-yellow-400/40 rounded-xl text-xs text-white leading-relaxed">
          The wallet key will be stored in your browser's local storage. This is
          a disposable wallet for testing on the preprod network only. It's not
          suitable for real funds and will be deleted if you clear your browser
          data or if you disconnect.
        </div>
        <Button
          className="w-full mt-2"
          label={isCreating ? 'Creating wallet…' : 'Yes, create a demo wallet!'}
          state={isCreating ? 'loading' : 'enabled'}
          color="cyan"
          variant="default"
          onClick={onConfirm}
        />
        <Button
          className="w-full mt-2"
          onClick={onClose}
          label="No thanks, I'll connect a real wallet"
          color="blue"
          variant="default"
        />
      </div>
    </Modal>
  );
}
