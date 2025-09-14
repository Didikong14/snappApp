"use client";

import { useMemo } from "react";
import { useScaffoldEventHistory } from "~~/hooks/scaffold-stark/useScaffoldEventHistory";
import { COUNTER_CONTRACT_NAME } from "~~/utils/contracts";

export const CounterEventHistory = () => {
    const { data, isLoading, error } = useScaffoldEventHistory({
      contractName: COUNTER_CONTRACT_NAME,
      eventName: "GreetingChanged",
      fromBlock: 2014756n,
      watch: true,
      blockData: false,
      transactionData: false,
      receiptData: false,
      format: true,
    });
  
    const items = useMemo(() => {
      return (data || []).map((ev, idx) => {
        const parsed = ev.parsedArgs || {};
        const oldValue = parsed?.old_value;
        const newValue = parsed?.new_value;
        const reason = parsed?.reason;
        const caller = parsed?.caller;
  
        const reasonText = (() => {
          if (typeof reason === "string") return reason;
          if (reason && typeof reason === "object") {
            const variant = (reason as any).variant;
            if (variant && typeof variant === "object") {
              const vKeys = Object.keys(variant);
              const k = vKeys.find((key) => variant[key] !== undefined) || vKeys[0];
              return k || "Changed";
            }
            const keys = Object.keys(reason);
            const k = keys.find((key) => (reason as any)[key] !== undefined) || keys[0];
            return k || "Changed";
          }
          return "Changed";
        })();
  
        return (
          <li key={idx} className="py-1">
            <div className="text-sm">
              <span className="font-semibold">{reasonText}</span>
              {" from "}
              <span className="badge badge-ghost">{String(oldValue)}</span>
              {" to "}
              <span className="badge badge-ghost">{String(newValue)}</span>
            </div>
            {caller ? (
              <div className="text-xs opacity-70">by {String(caller)}</div>
            ) : null}
          </li>
        );
      });
    }, [data]);
  
    return (
      <div className="mt-8 w-full max-w-xl">
        <div className="text-lg font-semibold mb-2">Counter Changed Events:</div>
        {isLoading ? (
          <div className="flex items-center gap-2 text-sm">
            <span className="loading loading-spinner loading-sm" /> Loading...
          </div>
        ) : error ? (
          <div className="text-error text-sm">Failed to load events</div>
        ) : (items.length ? <ul className="list-disc pl-5">{items}</ul> : <div className="text-sm opacity-70">No events</div>)}
      </div>
    );
  };