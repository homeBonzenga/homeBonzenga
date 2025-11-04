import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { 
  CreditCard, 
  Smartphone, 
  Wallet, 
  CheckCircle,
  Loader2,
  Shield,
  Lock
} from 'lucide-react';

interface MockPaymentProps {
  amount: number;
  onSuccess: (paymentData: PaymentData) => void;
  onCancel: () => void;
  loading?: boolean;
}

interface PaymentData {
  method: string;
  transactionId: string;
  amount: number;
  timestamp: string;
}

const MockPayment: React.FC<MockPaymentProps> = ({ 
  amount, 
  onSuccess, 
  onCancel, 
  loading = false 
}) => {
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [walletPin, setWalletPin] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const paymentMethods = [
    {
      id: 'card',
      name: 'Credit/Debit Card',
      icon: CreditCard,
      description: 'Visa, Mastercard, American Express',
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 'mobile',
      name: 'Mobile Money',
      icon: Smartphone,
      description: 'Airtel Money, Orange Money',
      color: 'from-green-500 to-green-600'
    },
    {
      id: 'wallet',
      name: 'Digital Wallet',
      icon: Wallet,
      description: 'PayPal, Apple Pay, Google Pay',
      color: 'from-purple-500 to-purple-600'
    }
  ];

  const handlePayment = async () => {
    if (!selectedMethod) return;

    setIsProcessing(true);

    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    const paymentData: PaymentData = {
      method: selectedMethod,
      transactionId: `TXN${Date.now()}`,
      amount,
      timestamp: new Date().toISOString()
    };

    setIsProcessing(false);
    onSuccess(paymentData);
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3 }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="max-w-2xl mx-auto"
    >
      <Card className="border-0 shadow-xl rounded-2xl overflow-hidden">
        <CardContent className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#4e342e] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-[#4e342e] mb-2">
              Secure Payment
            </h2>
            <p className="text-[#6d4c41]">
              Complete your booking with a secure payment
            </p>
          </div>

          {/* Amount Display */}
          <div className="bg-[#f8d7da]/20 rounded-xl p-6 mb-8 text-center">
            <div className="text-3xl font-bold text-[#4e342e] mb-2">
              {amount.toLocaleString()} CDF
            </div>
            <div className="text-[#6d4c41]">Total Amount</div>
          </div>

          {/* Payment Methods */}
          <div className="mb-8">
            <Label className="text-lg font-semibold text-[#4e342e] mb-4 block">
              Select Payment Method
            </Label>
            <RadioGroup value={selectedMethod} onValueChange={setSelectedMethod}>
              <div className="space-y-4">
                {paymentMethods.map((method) => (
                  <motion.div
                    key={method.id}
                    variants={fadeInUp}
                    initial="initial"
                    animate="animate"
                    transition={{ delay: 0.1 }}
                  >
                    <label className="flex items-center space-x-4 p-4 border-2 border-[#f8d7da]/30 rounded-xl cursor-pointer hover:border-[#4e342e]/50 transition-all duration-200">
                      <RadioGroupItem value={method.id} className="text-[#4e342e]" />
                      <div className={`w-12 h-12 bg-gradient-to-r ${method.color} rounded-xl flex items-center justify-center`}>
                        <method.icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-[#4e342e]">{method.name}</div>
                        <div className="text-sm text-[#6d4c41]">{method.description}</div>
                      </div>
                    </label>
                  </motion.div>
                ))}
              </div>
            </RadioGroup>
          </div>

          {/* Payment Form */}
          {selectedMethod && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.3 }}
              className="mb-8"
            >
              {selectedMethod === 'card' && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <Input
                      id="cardNumber"
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="expiry">Expiry Date</Label>
                      <Input
                        id="expiry"
                        type="text"
                        placeholder="MM/YY"
                        value={expiryDate}
                        onChange={(e) => setExpiryDate(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="cvv">CVV</Label>
                      <Input
                        id="cvv"
                        type="text"
                        placeholder="123"
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>
              )}

              {selectedMethod === 'mobile' && (
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+243 123 456 789"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="mt-1"
                  />
                </div>
              )}

              {selectedMethod === 'wallet' && (
                <div>
                  <Label htmlFor="pin">Wallet PIN</Label>
                  <Input
                    id="pin"
                    type="password"
                    placeholder="Enter your wallet PIN"
                    value={walletPin}
                    onChange={(e) => setWalletPin(e.target.value)}
                    className="mt-1"
                  />
                </div>
              )}
            </motion.div>
          )}

          {/* Security Notice */}
          <div className="flex items-center justify-center mb-8 text-sm text-[#6d4c41]">
            <Shield className="w-4 h-4 mr-2" />
            <span>Your payment is secured with 256-bit SSL encryption</span>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              variant="outline"
              className="flex-1 border-2 border-[#6d4c41] text-[#6d4c41] hover:bg-[#6d4c41] hover:text-white"
              onClick={onCancel}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 bg-[#4e342e] hover:bg-[#3b2c26] text-white"
              onClick={handlePayment}
              disabled={!selectedMethod || isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Pay {amount.toLocaleString()} CDF
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default MockPayment;
