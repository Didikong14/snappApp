"use client";

import { useScaffoldWriteContract } from "~~/hooks/scaffold-stark/useScaffoldWriteContract";
import { COUNTER_CONTRACT_NAME } from "~~/utils/contracts";

type DecreaseCounterButtonProps = {
  value: unknown;
};

export const DecreaseCounterButton = ({ value }: DecreaseCounterButtonProps) => {
  const { sendAsync, status, error } = useScaffoldWriteContract({
    contractName: COUNTER_CONTRACT_NAME,
    functionName: "set_greeting",
    args: ["Decreased Greeting", undefined],
  });

  const counterIsZero = (() => {
    try {
      if (value === undefined || value === null) return true;
      const n = BigInt((value as any)?.toString?.() ?? value);
      return n === 0n;
    } catch {
      return true;
    }
  })();

  const onClick = async () => {
    try {
      await sendAsync();
    } catch (e) {
      // error is surfaced via hook; no-op
    }
  };

  return (
    <button
      className="btn btn-secondary"
      onClick={onClick}
      disabled={status === "pending" || counterIsZero}
    >
      {status === "pending" ? (
        <span className="loading loading-spinner loading-sm" />
      ) : (
        "Decrease"
      )}
      {error ? <span className="ml-2 text-error">!</span> : null}
    </button>
  );
};