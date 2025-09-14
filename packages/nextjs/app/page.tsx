"use client";

import { CounterValue } from "~~/components/CounterValue";
import { IncreaseCounterButton } from "~~/components/IncreaseCounterButton";
import { DecreaseCounterButton } from "~~/components/DecreaseCounterButton";
import { useScaffoldReadContract } from "~~/hooks/scaffold-stark/useScaffoldReadContract";
import { SetCounterForm } from "~~/components/SetCounterForm";
import { CounterEventHistory } from "~~/components/CounterEventHistory";
import { ResetCounterButton } from "~~/components/ResetCounterButton";
import { COUNTER_CONTRACT_NAME } from "~~/utils/contracts";

const Home = () => {
  const { data, isLoading, error } = useScaffoldReadContract({
    contractName: COUNTER_CONTRACT_NAME,
    functionName: "greeting",
  });

  return (
    <div className="flex items-center flex-col grow pt-10">
      <CounterValue value={data} isLoading={isLoading} error={error as any} />
      <div className="mt-4 flex gap-3">
        <IncreaseCounterButton />
        <DecreaseCounterButton value={data} />
        <ResetCounterButton value={data} />
      </div>
      <SetCounterForm current={data} />
      <CounterEventHistory />
    </div>
  );
};

export default Home;