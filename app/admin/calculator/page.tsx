"use client";

import { useState } from "react";
import { Calculator, RefreshCw } from "lucide-react";

export default function CalculatorPage() {
  const [packCost, setPackCost] = useState<string>("");
  const [packQuantity, setPackQuantity] = useState<string>("");
  const [unitSellingPrice, setUnitSellingPrice] = useState<string>("");

  const cost = parseFloat(packCost) || 0;
  const quantity = parseFloat(packQuantity) || 0;
  const sellingPrice = parseFloat(unitSellingPrice) || 0;

  const unitCost = quantity > 0 ? cost / quantity : 0;
  const unitProfit = sellingPrice - unitCost;
  const totalProfit = unitProfit * quantity;
  const margin = sellingPrice > 0 ? (unitProfit / sellingPrice) * 100 : 0;

  const reset = () => {
    setPackCost("");
    setPackQuantity("");
    setUnitSellingPrice("");
  };

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Calculator className="w-8 h-8 text-purple-600" />
          Profit Calculator
        </h1>
        <button
          onClick={reset}
          className="flex items-center gap-2 text-gray-500 hover:text-purple-600 transition-colors"
        >
          <RefreshCw className="w-4 h-4" /> Reset
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Input Details</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cost of Pack (₦)
            </label>
            <input
              type="number"
              value={packCost}
              onChange={(e) => setPackCost(e.target.value)}
              className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
              placeholder="e.g. 5000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Items in Pack (Quantity)
            </label>
            <input
              type="number"
              value={packQuantity}
              onChange={(e) => setPackQuantity(e.target.value)}
              className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
              placeholder="e.g. 12"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Selling Price per Unit (₦)
            </label>
            <input
              type="number"
              value={unitSellingPrice}
              onChange={(e) => setUnitSellingPrice(e.target.value)}
              className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
              placeholder="e.g. 500"
            />
          </div>
        </div>

        {/* Results Section */}
        <div className="bg-purple-50 p-6 rounded-xl border border-purple-100 space-y-6">
          <h2 className="text-lg font-semibold text-purple-900 mb-4">Results</h2>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <p className="text-sm text-gray-500 mb-1">Unit Cost</p>
              <p className="text-xl font-bold text-gray-900">₦{unitCost.toFixed(2)}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <p className="text-sm text-gray-500 mb-1">Unit Profit</p>
              <p className={`text-xl font-bold ${unitProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ₦{unitProfit.toFixed(2)}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <p className="text-sm text-gray-500 mb-1">Total Pack Profit</p>
              <p className={`text-xl font-bold ${totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ₦{totalProfit.toFixed(2)}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <p className="text-sm text-gray-500 mb-1">Profit Margin</p>
              <p className={`text-xl font-bold ${margin >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                {margin.toFixed(1)}%
              </p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-white rounded-lg border border-purple-100">
            <h3 className="font-medium text-purple-900 mb-2">Summary</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              If you buy a pack for <span className="font-semibold">₦{cost.toFixed(2)}</span> containing <span className="font-semibold">{quantity}</span> items, 
              each item costs you <span className="font-semibold">₦{unitCost.toFixed(2)}</span>.
              <br /><br />
              Selling at <span className="font-semibold">₦{sellingPrice.toFixed(2)}</span> gives you a profit of <span className="font-bold text-green-600">₦{unitProfit.toFixed(2)}</span> per bottle.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
