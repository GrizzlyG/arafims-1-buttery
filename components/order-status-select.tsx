"use client";

import { useState, useTransition } from "react";
import { updateOrderStatus } from "@/app/actions";

export default function OrderStatusSelect({
  orderId,
  initialStatus,
}: {
  orderId: string;
  initialStatus: string;
}) {
  const [status, setStatus] = useState(initialStatus);
  const [isPending, startTransition] = useTransition();

  return (
    <select
      value={status}
      className={`text-sm rounded-full px-3 py-1 font-semibold border-0 cursor-pointer ${
        status === "complete"
          ? "bg-green-100 text-green-800"
          : status === "processing"
          ? "bg-blue-100 text-blue-800"
          : "bg-yellow-100 text-yellow-800"
      }`}
      onChange={(e) => {
        const newStatus = e.target.value;
        setStatus(newStatus);
        startTransition(() => {
          updateOrderStatus(orderId, newStatus);
        });
      }}
      disabled={isPending}
    >
      <option value="awaiting payment confirmation">Awaiting Payment</option>
      <option value="processing">Processing</option>
      <option value="complete">Complete</option>
    </select>
  );
}