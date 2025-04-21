function ClaimingPage() {
  return (
    <div className="w-4/5 mt-4 flex flex-col items-center justify-center">
      <p className="text-cyan-400 text-md text-center mt-1">
        Connect your wallet to claim your item and fill it with your social hub.
      </p>
      <div className="mt-4 text-sm text-cyan-200 text-center">
        Once you connected your item with your wallet, only the associated
        wallet will be able to update or transfer it.
      </div>
    </div>
  );
}

export default ClaimingPage;
