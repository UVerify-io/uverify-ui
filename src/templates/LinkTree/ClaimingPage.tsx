function ClaimingPage() {
  return (
    <div className="w-4/5 flex flex-col items-center justify-center">
      <p className="text-cyan-400 text-md mt-1">
        Connect your wallet to claim your item and fill it with your linktree.
      </p>
      <div className="mt-4 text-sm text-cyan-200">
        Once you connected your item with your wallet, only the associated
        wallet will be able to update or transfer it.
      </div>
    </div>
  );
}

export default ClaimingPage;
