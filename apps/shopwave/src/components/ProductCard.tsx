"use client";

import React, { useState } from "react";

interface ProductCardProps {
  name: string;
  price: string;
  priceNum: number;
  icon: React.ReactNode;
  onBuy: (name: string, price: number) => Promise<void>;
}

export default function ProductCard({ name, price, priceNum, icon, onBuy }: ProductCardProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleBuy = async () => {
    setLoading(true);
    setSuccess(false);
    try {
      await onBuy(name, priceNum);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-border rounded-xl p-5 flex flex-col justify-between items-center text-center space-y-4 shadow-sm hover:shadow-md transition-shadow">
      {/* SVG Icon Illustration */}
      <div className="w-16 h-16 flex items-center justify-center bg-background rounded-full">
        {icon}
      </div>

      {/* Details */}
      <div className="space-y-1">
        <h3 className="font-bold text-sm text-primary">{name}</h3>
        <p className="text-xs text-muted font-mono">{price}</p>
      </div>

      {/* Purchase Action Button */}
      <button
        onClick={handleBuy}
        disabled={loading || success}
        className={`w-full min-h-[38px] rounded-lg text-xs font-semibold px-4 py-2 transition-all flex items-center justify-center ${
          success
            ? "bg-emerald-600 text-white cursor-default"
            : "bg-primary hover:bg-gray-800 text-white disabled:opacity-50"
        }`}
      >
        {loading ? (
          <span className="flex items-center space-x-2">
            <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span>Processing...</span>
          </span>
        ) : success ? (
          "✓ Order Placed!"
        ) : (
          "Buy Now"
        )}
      </button>
    </div>
  );
}
