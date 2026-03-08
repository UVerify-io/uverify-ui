import { UpdatePolicy, POLICY_OPTIONS } from '../utils/updatePolicy';

interface UpdatePolicySelectorProps {
  value: UpdatePolicy;
  whitelist: string;
  onChange: (policy: UpdatePolicy, whitelist: string) => void;
  className?: string;
}

const UpdatePolicySelector = ({
  value,
  whitelist,
  onChange,
  className = '',
}: UpdatePolicySelectorProps) => {
  return (
    <div className={`flex flex-col items-start w-full ${className}`} data-testid="update-policy-selector">
      <h3 className="text-sm mr-4 mb-2">Update Policy</h3>
      <p className="text-xs text-white/55 mb-3 text-left">
        Controls how future re-submissions of the same hash are displayed.
        You become the policy owner once the certificate is on-chain.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 w-full">
        {POLICY_OPTIONS.map(({ mode, label, description }) => {
          const active = value === mode;
          return (
            <button
              key={mode}
              type="button"
              data-testid={`policy-option-${mode}`}
              aria-pressed={active}
              onClick={() => onChange(mode, whitelist)}
              className={[
                'flex flex-col items-start text-left rounded-xl px-3 py-3 border transition-all duration-150 cursor-pointer',
                active
                  ? 'border-cyan-400/70 bg-cyan-400/10 shadow-[0_0_0_1px_rgba(34,211,238,0.3)]'
                  : 'border-white/15 bg-white/5 hover:border-white/30 hover:bg-white/10',
              ].join(' ')}
            >
              <span
                className={`text-xs font-bold uppercase tracking-wider mb-1 ${
                  active ? 'text-cyan-300' : 'text-white/80'
                }`}
              >
                {label}
              </span>
              <span className="text-[10px] text-white/50 leading-tight">
                {description}
              </span>
            </button>
          );
        })}
      </div>

      {/* Whitelist input — only shown when whitelist mode is active */}
      {value === 'whitelist' && (
        <div className="w-full mt-3">
          <label className="text-xs text-white/60 mb-1 block text-left">
            Approved wallet addresses (comma-separated Bech32)
          </label>
          <textarea
            data-testid="policy-whitelist-input"
            className="w-full rounded-xl border border-white/20 bg-white/10 text-white text-xs font-mono px-3 py-2 placeholder-white/30 focus:outline-none focus:border-cyan-400/60 focus:bg-white/15 resize-none"
            rows={3}
            placeholder="addr1..., addr1..."
            value={whitelist}
            onChange={(e) => onChange(value, e.target.value)}
          />
        </div>
      )}

      {/* Accumulate clarification */}
      {value === 'accumulate' && (
        <p className="text-[10px] text-white/40 mt-2 text-left">
          With <span className="text-white/60 font-semibold">Additive only</span>, restrict who can add entries using{' '}
          <span className="font-mono text-white/55">uverify_update_whitelist</span> in your metadata.
          Without a whitelist, only you (the owner) can add new fields.
        </p>
      )}
    </div>
  );
};

export default UpdatePolicySelector;
