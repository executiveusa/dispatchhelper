
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Check } from "lucide-react";

const TriplePricingCards = () => {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");

  return (
    <div className="sm:flex sm:flex-col sm:align-center p-10">
      <div className="relative self-center bg-purple-100 rounded-lg p-0.5 flex">
        <button
          type="button"
          className={`relative w-1/2 rounded-md py-2 text-sm font-medium whitespace-nowrap focus:outline-none sm:w-auto sm:px-8 ${
            billingPeriod === "monthly" 
              ? "bg-white text-purple-600 shadow-sm" 
              : "text-gray-700"
          }`}
          onClick={() => setBillingPeriod("monthly")}
        >
          Monthly billing
        </button>
        <button
          type="button"
          className={`ml-0.5 relative w-1/2 border rounded-md py-2 text-sm font-medium whitespace-nowrap focus:outline-none sm:w-auto sm:px-8 border-transparent ${
            billingPeriod === "yearly" 
              ? "bg-white text-purple-600 shadow-sm" 
              : "text-gray-700"
          }`}
          onClick={() => setBillingPeriod("yearly")}
        >
          Yearly billing
        </button>
      </div>
      <div className="mt-12 space-y-3 sm:mt-16 sm:space-y-0 sm:grid sm:grid-cols-3 sm:gap-6 md:max-w-5xl md:mx-auto xl:grid-cols-3">
        {/* Starter Plan */}
        <div className="border border-purple-100 rounded-lg shadow-sm divide-y divide-purple-100">
          <div className="p-6">
            <h2 className="text-xl leading-6 font-bold text-gray-900">
              Starter
            </h2>
            <p className="mt-2 text-base text-gray-700 leading-tight">
              For new businesses that want to optimize their operations.
            </p>
            <p className="mt-8">
              <span className="text-4xl font-bold text-gray-900 tracking-tighter">
                ${billingPeriod === "monthly" ? "10" : "8"}
              </span>
              <span className="text-base font-medium text-gray-500">/mo</span>
              {billingPeriod === "yearly" && (
                <span className="text-sm text-purple-600 ml-2">(2 months free)</span>
              )}
            </p>
            <Link
              to="/auth"
              className="mt-8 block w-full bg-purple-600 hover:bg-purple-700 rounded-md py-2 text-sm font-semibold text-white text-center transition duration-200"
            >
              Choose Starter
            </Link>
          </div>
          <div className="pt-6 pb-8 px-6">
            <h3 className="text-sm font-bold text-gray-900 tracking-wide uppercase">
              What's included
            </h3>
            <ul role="list" className="mt-4 space-y-3">
              <li className="flex space-x-3">
                <Check className="flex-shrink-0 h-5 w-5 text-green-500" />
                <span className="text-base text-gray-700">
                  Everything in Free
                </span>
              </li>
              <li className="flex space-x-3">
                <Check className="flex-shrink-0 h-5 w-5 text-green-500" />
                <span className="text-base text-gray-700">
                  5,000 events / month
                </span>
              </li>
              <li className="flex space-x-3">
                <Check className="flex-shrink-0 h-5 w-5 text-green-500" />
                <span className="text-base text-gray-700">
                  Unlimited seats
                </span>
              </li>
              <li className="flex space-x-3">
                <Check className="flex-shrink-0 h-5 w-5 text-green-500" />
                <span className="text-base text-gray-700">
                  AI-powered automation
                </span>
              </li>
              <li className="flex space-x-3">
                <Check className="flex-shrink-0 h-5 w-5 text-green-500" />
                <span className="text-base text-gray-700">
                  Workflow optimization
                </span>
              </li>
              <li className="flex space-x-3">
                <Check className="flex-shrink-0 h-5 w-5 text-green-500" />
                <span className="text-base text-gray-700">
                  Email support
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Startup Plan - Featured */}
        <div className="border border-purple-200 rounded-lg shadow-lg divide-y divide-purple-100 relative">
          <div className="absolute -top-4 left-0 right-0 flex justify-center">
            <span className="bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full">
              POPULAR
            </span>
          </div>
          <div className="p-6">
            <h2 className="text-xl leading-6 font-bold text-gray-900">
              Startup
            </h2>
            <p className="mt-2 text-base text-gray-700 leading-tight">
              For growing companies wanting to scale their operations.
            </p>
            <p className="mt-8">
              <span className="text-4xl font-bold text-gray-900 tracking-tighter">
                ${billingPeriod === "monthly" ? "16" : "13"}
              </span>
              <span className="text-base font-medium text-gray-500">/mo</span>
              {billingPeriod === "yearly" && (
                <span className="text-sm text-purple-600 ml-2">(2 months free)</span>
              )}
            </p>
            <Link
              to="/auth"
              className="mt-8 block w-full bg-purple-600 hover:bg-purple-700 rounded-md py-2 text-sm font-semibold text-white text-center transition duration-200"
            >
              Choose Startup
            </Link>
          </div>
          <div className="pt-6 pb-8 px-6">
            <h3 className="text-sm font-bold text-gray-900 tracking-wide uppercase">
              What's included
            </h3>
            <ul role="list" className="mt-4 space-y-3">
              <li className="flex space-x-3">
                <Check className="flex-shrink-0 h-5 w-5 text-green-500" />
                <span className="text-base text-gray-700">
                  Everything in Starter
                </span>
              </li>
              <li className="flex space-x-3">
                <Check className="flex-shrink-0 h-5 w-5 text-green-500" />
                <span className="text-base text-gray-700">
                  20,000 events / month
                </span>
              </li>
              <li className="flex space-x-3">
                <Check className="flex-shrink-0 h-5 w-5 text-green-500" />
                <span className="text-base text-gray-700">
                  Custom workflow templates
                </span>
              </li>
              <li className="flex space-x-3">
                <Check className="flex-shrink-0 h-5 w-5 text-green-500" />
                <span className="text-base text-gray-700">
                  Advanced analytics dashboard
                </span>
              </li>
              <li className="flex space-x-3">
                <Check className="flex-shrink-0 h-5 w-5 text-green-500" />
                <span className="text-base text-gray-700">
                  Priority email support
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Professional Plan */}
        <div className="border border-purple-100 rounded-lg shadow-sm divide-y divide-purple-100">
          <div className="p-6">
            <h2 className="text-xl leading-6 font-bold text-gray-900">
              Professional
            </h2>
            <p className="mt-2 text-base text-gray-700 leading-tight">
              For businesses requiring enterprise-grade capabilities.
            </p>
            <p className="mt-8">
              <span className="text-4xl font-bold text-gray-900 tracking-tighter">
                ${billingPeriod === "monthly" ? "49" : "41"}
              </span>
              <span className="text-base font-medium text-gray-500">/mo</span>
              {billingPeriod === "yearly" && (
                <span className="text-sm text-purple-600 ml-2">(2 months free)</span>
              )}
            </p>
            <Link
              to="/auth"
              className="mt-8 block w-full bg-purple-600 hover:bg-purple-700 rounded-md py-2 text-sm font-semibold text-white text-center transition duration-200"
            >
              Choose Professional
            </Link>
          </div>
          <div className="pt-6 pb-8 px-6">
            <h3 className="text-sm font-bold text-gray-900 tracking-wide uppercase">
              What's included
            </h3>
            <ul role="list" className="mt-4 space-y-3">
              <li className="flex space-x-3">
                <Check className="flex-shrink-0 h-5 w-5 text-green-500" />
                <span className="text-base text-gray-700">
                  Everything in Startup
                </span>
              </li>
              <li className="flex space-x-3">
                <Check className="flex-shrink-0 h-5 w-5 text-green-500" />
                <span className="text-base text-gray-700">
                  80,000 events / month
                </span>
              </li>
              <li className="flex space-x-3">
                <Check className="flex-shrink-0 h-5 w-5 text-green-500" />
                <span className="text-base text-gray-700">
                  Custom AI model training
                </span>
              </li>
              <li className="flex space-x-3">
                <Check className="flex-shrink-0 h-5 w-5 text-green-500" />
                <span className="text-base text-gray-700">
                  Advanced integrations
                </span>
              </li>
              <li className="flex space-x-3">
                <Check className="flex-shrink-0 h-5 w-5 text-green-500" />
                <span className="text-base text-gray-700">
                  24/7 priority support
                </span>
              </li>
              <li className="flex space-x-3">
                <Check className="flex-shrink-0 h-5 w-5 text-green-500" />
                <span className="text-base text-gray-700">
                  Dedicated account manager
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TriplePricingCards;
