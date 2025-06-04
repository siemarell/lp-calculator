import { observer } from "mobx-react-lite";
import { FuturePosition, FutureType } from "src/strategy/futures";
import { H4 } from "src/components/H4";
import { Button } from "src/components/Button";

interface FuturePositionControlProps {
  position: FuturePosition;
}

export const FuturePositionControl = observer(({ position }: FuturePositionControlProps) => {
  return (
    <div className="flex flex-col gap-2 p-4 border rounded">
      <div className="flex items-center justify-between">
        <H4>Future Position</H4>
        <Button
          onClick={() => position.enabled = !position.enabled}
          className={position.enabled ? "bg-green-500" : "bg-red-500"}
        >
          {position.enabled ? "Enabled" : "Disabled"}
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Type</label>
          <select
            value={position.futureType}
            onChange={(e) => position.futureType = e.target.value as FutureType}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value={FutureType.LONG}>Long</option>
            <option value={FutureType.SHORT}>Short</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Amount</label>
          <input
            type="number"
            value={position.amount}
            onChange={(e) => position.amount = Number(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Margin (%)</label>
          <input
            type="number"
            min="0"
            max="100"
            value={position.margin}
            onChange={(e) => position.margin = Number(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );
}); 