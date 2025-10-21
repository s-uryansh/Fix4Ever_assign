'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  price: number;
  total: number;
}

interface InvoiceData {
  invoiceNumber: string;
  date: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  notes: string;
}

const GenerateInvoiceTab: React.FC = () => {
  const [bookingId, setBookingId] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);

  const handleGenerateInvoice = async () => {
    if (!bookingId.trim()) return;
    
    setIsGenerating(true);
    
    // Simulate API call
    setTimeout(() => {
      setInvoice({
        invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
        date: new Date().toLocaleDateString(),
        customerName: 'John Doe',
        customerEmail: 'john.doe@example.com',
        customerPhone: '+91 9876543210',
        items: [
          { id: '1', description: 'Screen Replacement Service', quantity: 1, price: 2500, total: 2500 },
          { id: '2', description: 'New OLED Screen', quantity: 1, price: 1800, total: 1800 },
          { id: '3', description: 'Service Charge', quantity: 1, price: 300, total: 300 },
        ],
        subtotal: 4600,
        tax: 828,
        total: 5428,
        notes: 'Thank you for choosing Fix4Ever! 90-day warranty included on all repairs.'
      });
      setIsGenerating(false);
    }, 1500);
  };

  const handleDownloadInvoice = () => {
    // Implement download functionality
    alert('Invoice download functionality would be implemented here');
  };

  const handlePrintInvoice = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Generate Invoice</h2>
      
      <div className="grid md:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Booking ID *
            </label>
            <input
              type="text"
              value={bookingId}
              onChange={(e) => setBookingId(e.target.value)}
              placeholder="Enter your booking reference number..."
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all duration-300 bg-white/90 backdrop-blur-sm"
              required
            />
          </div>

          <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
            <h4 className="font-semibold text-blue-800 mb-2">💡 How to find your Booking ID</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Check your booking confirmation email</li>
              <li>• Look in your account dashboard under "My Bookings"</li>
              <li>• Contact customer support if you can't find it</li>
            </ul>
          </div>

          <button
            onClick={handleGenerateInvoice}
            disabled={isGenerating || !bookingId.trim()}
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isGenerating ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Generating Invoice...
              </div>
            ) : (
              'Generate Invoice'
            )}
          </button>
        </div>

        {/* Invoice Preview Section */}
        <div className="space-y-6">
          {invoice ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-800">Invoice Preview</h3>
                <div className="flex gap-2">
                  <button
                    onClick={handleDownloadInvoice}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                  >
                    Download
                  </button>
                  <button
                    onClick={handlePrintInvoice}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors"
                  >
                    Print
                  </button>
                </div>
              </div>

              {/* Invoice Template */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                {/* Header */}
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">FIX4EVER</h2>
                    <p className="text-gray-600">We Fix Everything</p>
                  </div>
                  <div className="text-right">
                    <h3 className="text-lg font-semibold">INVOICE</h3>
                    <p className="text-gray-600">{invoice.invoiceNumber}</p>
                    <p className="text-gray-600">{invoice.date}</p>
                  </div>
                </div>

                {/* Customer Info */}
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Bill To:</h4>
                    <p className="text-gray-800">{invoice.customerName}</p>
                    <p className="text-gray-600">{invoice.customerEmail}</p>
                    <p className="text-gray-600">{invoice.customerPhone}</p>
                  </div>
                </div>

                {/* Items Table */}
                <div className="mb-6">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-gray-200">
                        <th className="text-left py-2 font-semibold text-gray-700">Description</th>
                        <th className="text-right py-2 font-semibold text-gray-700">Qty</th>
                        <th className="text-right py-2 font-semibold text-gray-700">Price</th>
                        <th className="text-right py-2 font-semibold text-gray-700">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoice.items.map((item) => (
                        <tr key={item.id} className="border-b border-gray-100">
                          <td className="py-3 text-gray-800">{item.description}</td>
                          <td className="py-3 text-right text-gray-600">{item.quantity}</td>
                          <td className="py-3 text-right text-gray-600">₹{item.price}</td>
                          <td className="py-3 text-right text-gray-800 font-medium">₹{item.total}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Totals */}
                <div className="flex justify-end mb-6">
                  <div className="w-64 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="font-medium">₹{invoice.subtotal}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tax (18%):</span>
                      <span className="font-medium">₹{invoice.tax}</span>
                    </div>
                    <div className="flex justify-between border-t border-gray-200 pt-2">
                      <span className="font-semibold text-gray-800">Total:</span>
                      <span className="font-semibold text-blue-600 text-lg">₹{invoice.total}</span>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div className="border-t border-gray-200 pt-4">
                  <p className="text-sm text-gray-600">{invoice.notes}</p>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="text-center text-gray-500 py-12">
              <div className="text-6xl mb-4">🧾</div>
              <h3 className="text-lg font-medium mb-2">Professional Invoices</h3>
              <p>Enter your booking ID to generate a detailed, professional invoice for your repair services</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GenerateInvoiceTab;