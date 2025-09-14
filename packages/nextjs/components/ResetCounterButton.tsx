"use client";

import { useMemo } from "react";
import {
  useScaffoldMultiWriteContract,
  createContractCall,
} from "~~/hooks/scaffold-stark/useScaffoldMultiWriteContract";
import { useDeployedContractInfo } from "~~/hooks/scaffold-stark";
import { uint256 } from "starknet";
import { COUNTER_CONTRACT_NAME } from "~~/utils/contracts";
import { useAccount } from "~~/hooks/useAccount";
import useScaffoldStrkBalance from "~~/hooks/scaffold-stark/useScaffoldStrkBalance";

type ResetCounterButtonProps = {
  value: unknown;
};

const DECIMALS = 18n;
const PAYMENT_AMOUNT = 18n; // 1 STRK
const PAYMENT_AMOUNT_WEI = PAYMENT_AMOUNT * 10n ** DECIMALS;

export const ResetCounterButton = ({ value }: ResetCounterButtonProps) => {
  const { data: counterContract } = useDeployedContractInfo(COUNTER_CONTRACT_NAME);
  const { address } = useAccount();
  const { value: strkBalance } = useScaffoldStrkBalance({ address });

  const calls = useMemo(() => {
    if (!counterContract?.address) return [] as any[];
    return [
      createContractCall(
        "Strk",
        "approve",
        [counterContract.address, uint256.bnToUint256(PAYMENT_AMOUNT_WEI)] as any,
      ),
      createContractCall(COUNTER_CONTRACT_NAME, "set_greeting", ["Reset", undefined] as any),
    ];
  }, [counterContract?.address]);

  const { sendAsync, status, error } = useScaffoldMultiWriteContract({ calls });

  const hasInsufficientBalance = (() => {
    try {
      if (strkBalance === undefined || strkBalance === null) return true;
      return (strkBalance as unknown as bigint) < PAYMENT_AMOUNT_WEI;
    } catch {
      return true;
    }
  })();

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
      // surfaced via hook
    }
  };

  return (
    <button
      className="btn btn-warning"
      onClick={onClick}
      disabled={!calls.length || status === "pending" || counterIsZero || hasInsufficientBalance}
    >
      {status === "pending" ? (
        <span className="loading loading-spinner loading-sm" />
      ) : (
        "Reset"
      )}
      {error ? <span className="ml-2 text-error">!</span> : null}
    </button>
  );
};