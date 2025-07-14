import { ChevronRight, Check } from 'lucide-react';

// CheckoutSteps Component
const CheckoutSteps = ({ step1, step2, step3, step4 }) => {
  const steps = [
    { name: 'Sign-In', active: step1, completed: step2 || step3 || step4 },
    { name: 'Shipping', active: step2, completed: step3 || step4 },
    { name: 'Payment', active: step3, completed: step4 },
    { name: 'Place Order', active: step4, completed: false }
  ];

  return (
    <div className="bg-white border-b border-gray-200 py-4 mb-6">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.name} className="flex items-center">
              <div className="flex items-center">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                  ${step.completed 
                    ? 'bg-orange-500 text-white' 
                    : step.active 
                      ? 'bg-orange-100 text-orange-600 border-2 border-orange-500' 
                      : 'bg-gray-100 text-gray-400'
                  }
                `}>
                  {step.completed ? <Check size={16} /> : index + 1}
                </div>
                <span className={`ml-2 text-sm font-medium ${
                  step.active ? 'text-orange-600' : step.completed ? 'text-gray-900' : 'text-gray-400'
                }`}>
                  {step.name}
                </span>
              </div>
              {index < steps.length - 1 && (
                <ChevronRight className="w-5 h-5 text-gray-300 mx-4" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};



export default CheckoutSteps;