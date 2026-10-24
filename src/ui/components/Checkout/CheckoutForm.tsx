
"use client"
import React, {useState} from 'react';
import { Phone, ArrowLeft, ShieldCheck, CreditCard } from 'lucide-react';
import { is } from 'zod/locales';


interface CheckoutFormProps {
    subtotal: number;
    onBackToCart: () => void;
    onSubmitPayment: (provider: 'MTN_MOMO' | 'ORANGE_MOMO', phone: string) => Promise<void>
}

export const MobileMobileChecout: React.FC<CheckoutFormProps> = ({subtotal, onBackToCart, onSubmitPayment}) => {
    const [provider, setProvider] = useState<'MTN_MOMO' |'ORANGE_MOMO'>("MTN_MOMO")
    const [phone, setPhone] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const deliveryFee= 2000;
    const totalAmount = subtotal + deliveryFee;

    const handleSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault();
        setIsProcessing(true)
        try{
            await onSubmitPayment(provider, phone);
        }catch(error){
            console.error(error)
        }finally{
            setIsProcessing(false);
        }

    }

    return (
        <div className={` max-w-2xl mx-auto px-4 py-8 bg-[#FAFAFA] min-h-screen`}>
            {/* Upper Navigation Row */}
            <button onClick={onBackToCart} className={`flex item-center gap-2 text-xs uppercase font-bold tracking-wider text-green-200 hover:text-white-900 hover:bg-green-600`}>
                <ArrowLeft className={`w-4 h-4`} /> Back To Bag
            </button>

            <div className={`grid grid-cols-1 lg:grid-cols-12 gap-8`}>
                {/* Main: Selection Area */}
                <form onSubmit={handleSubmit} className={`lg:col-span-7 p-6 border-b border-[#EFECE6] rounded-md space-y-6`}>
                    <div>
                        <h2 className={`text-sm font-bold uppercase tracking-widest text-neutral-900 mb-1`}>
                            Mobile Money Payment
                        </h2>
                        <p className={`text-xs text-neutral-400`}>Select your local network provider to authorize the transaction</p>
                    </div>

                    {/* Provider Grid Selection Row */}
                    <div className={`grid grid:cols-2 gap-4`}>
                        <button type='button' onClick={() => setProvider("MTN_MOMO")} className={`p-4 border rounded-md flex flex-col items-center justify-center gap-2  transition-all ${provider === 'MTN_MOMO' ? "borderr-[#FFCC00] bg-[#FFCC00]/5 ring-2 ring-[#FFCC00]" : "border-gray-100 bg-neutral-50 hover:bg-neutral-100"}`}>
                            <div className={`w-12 h-8 bg-[#FFCC00] rounded font-[#003366 ] text-[#003366] text-xs flex items-center justify-center shadow-xs`}>
                                momo
                            </div>
                            <span className={`text-xs font-bold tracking-wide text-[#003366]`}>MTN Momo</span>
                        </button>

                        <button type='button' onClick={() => setProvider("ORANGE_MOMO")} className={`p-4 border rounded-md flex flex-col items-center justify-center gap-2 transition-all ${provider === "ORANGE_MOMO"? 'border-[#FF6600] bg-[#FF6600]/5 ring-2 ring-[#FF6600]' : 'border-gray-100 bg-neutral-50 hover:bg-neutral-100'}`}>
                            <div className={`w-12 h-8 bg-[#FF6600] rounded font-black text-white text-[10px] flex items-center justify-center shadow-xs uppercase tracking-tighter`}>
                                Orange
                            </div>
                            <span className={`text-xs font-bold tracking-wide text-neutral-800`}>Orange Momo</span>
                        </button>
                    </div>

                    {/* Payer Phone Input Field */}
                    <div>
                        <label className={`block font-bold text-sm uppercase tracking-wider text-neutral-700 mb-1.5`}>Account Number (No Country Code)</label>
                        <div className={`relative`}>
                            <span className={`absolute inset-y-0 left-0 flex items-center pl-3 text-sm font-semibold text-neutral-400 border-r border-gray-100 pr-2`}>+237</span>
                            <input 
                            type='tel'
                            placeholder='67XXXXXXX'
                            value={phone}
                            required
                            pattern="6[5-9]\d{7}"
                            className={`w-full text-sm pl-16 pr-3 py-2.5 bg-neutral-50 border border-gray-200 rounded focus:outline-none focus:border-black transition-colors `}
                            />
                        </div>
                        <p className={`mt-1.5 text-[10px] text-neutral-400`}>Ensure the phone is near by you to approve the incoming secure USSD PIN prompt.</p>
                    </div>
                    <button
                    type='submit'
                    disabled={isProcessing || !phone}
                    className={`w-full bg-green-600 text-white text-xs font-bold uppercase tracking-widest py-3.5 hover:bg-neutral-800 transition-colors disabled:bg-neutral-400 shadow-xs flex items-center justify-centeer gap-2`}>
                        <CreditCard className={`w-4 h-4`}/>
                        {isProcessing? "Awaiting Confirmation" : `Pay ${totalAmount.toLocaleString()} FRS`}
                    </button>
                </form>

                {/* Order Summary Panel */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-neutral-50 p-5 border border-gray-100 rounded-md">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-800 mb-4">Summary</h3>
            
            <div className="space-y-2 border-b border-neutral-200 pb-3 text-xs text-neutral-600">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-semibold text-neutral-900">{subtotal.toLocaleString()} frs</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Logistics</span>
                <span className="font-semibold text-neutral-900">{deliveryFee.toLocaleString()} frs</span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 text-sm font-bold text-neutral-900">
              <span>Total Amount</span>
              <span className="text-base">{totalAmount.toLocaleString()} frs</span>
            </div>
          </div>

          <div className="flex items-center gap-2 px-2 text-[11px] text-neutral-400">
            <ShieldCheck className="h-4 w-4 text-emerald-600 flex-shrink-0" />
            <span>Secure mobile checkout powered by local integration networks.</span>
          </div>
        </div>

            </div>

        </div>
    )
}




