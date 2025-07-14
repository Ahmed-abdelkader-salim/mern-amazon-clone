import { useState } from "react";
import CheckoutSteps from "../components/CheckoutSteps";
import { CreditCard } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import {useSavePaymentMethodMutation} from '../app/api';
import toast from "react-hot-toast";
const PaymentMethod = () => {
  const [paymentMethod, setPaymentMethod] = useState('PayPal');
  const [savePaymentMethod, {isLoading}] = useSavePaymentMethodMutation();
  const navigate = useNavigate();

  const handleSubmit = async(e) => {
    e.preventDefault();
    try {
      const res = await savePaymentMethod({paymentMethod}).unwrap();
      console.log('payment saved', res)
    } catch (error) {
      console.error("Failed to save payment method:", error);
      toast.error(error)
    }
    navigate('/place-order');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <CheckoutSteps step1 step2 step3 />
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Payment Method</h1>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* PayPal Option */}
            <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
              <div className="flex items-center">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="PayPal"
                  checked={paymentMethod === 'PayPal'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-4 h-4 text-yellow-600 focus:ring-yellow-500 border-gray-300"
                />
                <div className="ml-3 flex items-center">
                  <CreditCard className="w-5 h-5 text-blue-600 mr-2" />
                  <span className="text-sm font-medium text-gray-900">PayPal</span>
                </div>
              </div>
              <img
                src="https://www.paypalobjects.com/webstatic/mktg/logo/pp_cc_mark_111x69.jpg"
                alt="PayPal"
                className="h-10"
              />
            </label>

            {/* Paymob Option */}
            <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
              <div className="flex items-center">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="Paymob"
                  checked={paymentMethod === 'Paymob'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-4 h-4 text-yellow-600 focus:ring-yellow-500 border-gray-300"
                />
                <div className="ml-3 flex items-center">
                  <CreditCard className="w-5 h-5 text-purple-600 mr-2" />
                  <span className="text-sm font-medium text-gray-900">Paymob (Visa, MasterCard, Meeza)</span>
                </div>
              </div>
              <div className="flex space-x-2">
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg"
                  alt="Visa"
                  className="h-6"
                />
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/0/04/Mastercard-logo.png"
                  alt="MasterCard"
                  className="h-6"
                />
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Meeza.svg/1200px-Meeza.svg.png"
                  alt="Meeza"
                  className="h-6"
                />
              </div>
            </label>

            <div className="flex justify-end pt-6">
            <button
                type="submit"
                className="bg-yellow-400 hover:bg-yellow-500 text-black font-medium py-3 px-8 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
                disabled={isLoading}
              >
                {isLoading ? "Saving..." : "Continue"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PaymentMethod;
