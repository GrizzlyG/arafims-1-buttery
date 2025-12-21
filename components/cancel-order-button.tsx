"use client";

import { useState, useTransition } from "react";
import { Ban, Loader2, XCircle } from "lucide-react";
import { cancelOrder } from "@/app/actions";

export default function CancelOrderButton({ orderId, currentStatus }: { orderId: string, currentStatus: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = () => {
    if (!reason.trim()) {
      alert("Please provide a reason for cancellation.");
      return;
    }
    startTransition(async () => {
      await cancelOrder(orderId, reason);
      setIsOpen(false);
    });
  };

  if (currentStatus === 'cancelled' || currentStatus === 'complete') {
    return null; // Don't show cancel button for already completed or cancelled orders
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="text-orange-500 hover:text-orange-700 transition-colors p-2"
        title="Cancel Order"
      >
        <Ban className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">Cancel Order: <span className="font-mono">{orderId}</span></h2>
            <p className="text-sm text-gray-600 mb-4">
              Items will be returned to stock. The customer will see the reason you provide.
            </p>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Reason for cancellation..."
              className="w-full border rounded-lg p-2 h-24 mb-4"
              required
            />
            <div className="flex justify-end gap-4">
              <button onClick={() => setIsOpen(false)} className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300">Close</button>
              <button
                onClick={handleSubmit}
                disabled={isPending || !reason.trim()}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
              >
                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}