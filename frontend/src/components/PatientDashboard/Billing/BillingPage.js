// BillingPage.js

import React, { useEffect, useState } from 'react';
import axios from 'axios';

import '../../../styles/BillingPage.css';

const BillingPage = ({ patientId }) => {
  const [bills, setBills] = useState([]);
  const [selectedBill, setSelectedBill] = useState(null);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('');
  const [paymentId, setPaymentId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [paymentReceipts, setPaymentReceipts] = useState({});
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  
  // Credit card form details
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardType, setCardType] = useState(''); // New state for card type
  
  // Step in payment process (1: method selection, 2: details, 3: confirmation)
  const [paymentStep, setPaymentStep] = useState(1);

  useEffect(() => {
    fetchBills();
  }, [patientId]);

  const fetchBills = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/billing/patient/${patientId}`);
      setBills(res.data);
      setLoading(false);
    } catch (err) {
      console.error("❌ Failed to fetch bills", err);
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    try {
      // In a real app, you would validate card details here before processing
      setPaymentStep(3); // Move to processing/confirmation step
      
      const res = await axios.post('http://localhost:5000/api/payments/pay', {
        billing_id: selectedBill.billing_id,
        amount_paid: parseFloat(amount),
        payment_method: method,
        card_type: cardType, // Include card type if applicable
        // You might include more payment details in a real app
        // card details would typically be handled by a payment processor
      });

      const receiptPaymentId = res.data.payment_id;
      setPaymentReceipts(prev => ({ ...prev, [selectedBill.billing_id]: receiptPaymentId }));
      setPaymentId(receiptPaymentId);
      setPaymentSuccess(true);
      
      // Give user time to see the success message
      setTimeout(async () => {
        await fetchBills();
        resetPaymentForm();
      }, 2000);
      
    } catch (err) {
      console.error("❌ Payment failed", err);
      alert("Payment failed: " + (err.response?.data?.message || "Unknown error"));
      setPaymentStep(2); // Return to payment details if there's an error
    }
  };
  
  const resetPaymentForm = () => {
    setSelectedBill(null);
    setAmount('');
    setMethod('');
    setPaymentId(null);
    setCardName('');
    setCardNumber('');
    setExpiryDate('');
    setCvv('');
    setCardType('');
    setPaymentStep(1);
    setPaymentSuccess(false);
  };

  const renderInvoiceLabel = (bill) => {
    const isLateFee = Number(bill.total_amount) === 25 && bill.appointment_status === 'Canceled';
    const isFinishedAppointment = bill.appointment_id && bill.appointment_status === 'Finished';
    
    if (isLateFee) {
      return <span className="late-fee">Late Cancellation Fee (Invoice #{bill.billing_id})</span>;
    }
    
    if (isFinishedAppointment) {
      return (
        <a
          href={`http://localhost:5000/api/billing/invoice/${bill.billing_id}/pdf`}
          target="_blank"
          rel="noopener noreferrer"
          className="invoice-link"
        >
          📄 Invoice #{bill.billing_id}
        </a>
      );
      
    }
    
    return null;
  };

  const downloadReceipt = (billingId) => {
    const pid = paymentReceipts[billingId];
    if (pid) {
      window.open(`http://localhost:5000/api/payments/receipt/${pid}/pdf`, '_blank');
    }
  };
  
  const formatCardNumber = (value) => {
    // Remove non-digits
    const digits = value.replace(/\D/g, '');
    
    // Split in groups of 4 digits
    const groups = [];
    for (let i = 0; i < digits.length && i < 16; i += 4) {
      groups.push(digits.substring(i, i + 4));
    }
    
    return groups.join(' ');
  };
  
  const handleCardNumberChange = (e) => {
    const formattedValue = formatCardNumber(e.target.value);
    setCardNumber(formattedValue);
    
    // Basic card type detection
    const cardNum = e.target.value.replace(/\D/g, '');
    if (cardNum.startsWith('4')) {
      setCardType('Visa');
    } else if (/^5[1-5]/.test(cardNum)) {
      setCardType('MasterCard');
    } else if (/^3[47]/.test(cardNum)) {
      setCardType('American Express');
    } else {
      setCardType('');
    }
  };
  
  const handleExpiryChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    
    if (value.length > 2) {
      value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    
    setExpiryDate(value);
  };
  
  const isLateCancellation = selectedBill && 
    Number(selectedBill.total_amount) === 25 && 
    selectedBill.appointment_status === 'Canceled';

  return (
    <div className="billing-container">
      <h2>Billing Information</h2>
      
      {loading ? (
        <p>Loading billing information...</p>
      ) : bills.length === 0 ? (
        <p>No billing records found.</p>
      ) : (
        <table className="billing-table">
          <thead>
            <tr>
              <th>Invoice</th>
              <th>Status</th>
              <th>Due</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bills.filter(bill => {
              const isLate = Number(bill.total_amount) === 25 && bill.appointment_status === 'Canceled';
              const isFinished = bill.appointment_id && bill.appointment_status === 'Finished';
              return isLate || isFinished || bill.payment_status === 'Paid';
            }).map(bill => (
              <tr key={bill.billing_id} className={bill.amount_due > 0 ? 'unpaid-row' : 'paid-row'}>
                <td>{renderInvoiceLabel(bill)}</td>
                <td>
                  <span className={`status-${bill.payment_status.toLowerCase()}`}>
                    {bill.payment_status.replace('_', ' ')}
                  </span>
                </td>
                <td>${Number(bill.amount_due || 0).toFixed(2)}</td>
                <td>
                  {bill.amount_due > 0 && (
                    <button 
                      className="pay-btn" 
                      onClick={() => {
                        setSelectedBill(bill);
                        setAmount(Number(bill.amount_due).toFixed(2));
                        setMethod('');
                        setPaymentId(null);
                        setPaymentStep(1);
                      }}
                    >
                      Pay Now
                    </button>
                  )}
                  
                  {bill.payment_status === 'Paid' && paymentReceipts[bill.billing_id] && (
                    <button 
                      className="receipt-btn" 
                      onClick={() => downloadReceipt(bill.billing_id)}
                    >
                      Receipt
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {selectedBill && (
        <div className="payment-modal">
          <div className="payment-form">
            <h3>Pay Invoice #{selectedBill.billing_id}</h3>
            
            <div className="payment-form-content">
              {paymentStep === 1 && (
                <>
                  <div className="form-group">
                    <label>Amount to Pay:</label>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => {
                        if (!isLateCancellation) setAmount(e.target.value);
                      }}
                      disabled={isLateCancellation}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Select Payment Method:</label>
                    
                    <div className="payment-methods">
                      <div 
                        className={`payment-method-option ${method === 'Card' ? 'selected' : ''}`}
                        onClick={() => setMethod('Card')}
                      >
                        <div className="card-icons">
                          <img src="https://cdn-icons-png.flaticon.com/512/196/196578.png" alt="Visa" />
                          <img src="https://cdn-icons-png.flaticon.com/512/196/196561.png" alt="MasterCard" />
                          <img src="https://cdn-icons-png.flaticon.com/512/196/196539.png" alt="American Express" />
                        </div>
                        <span>Credit/Debit Card</span>
                      </div>
                      
                      <div 
                        className={`payment-method-option ${method === 'PayPal' ? 'selected' : ''}`}
                        onClick={() => setMethod('PayPal')}
                      >
                        <img src="https://cdn-icons-png.flaticon.com/512/174/174861.png" alt="PayPal" className="paypal-icon" />
                        <span>PayPal</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
              
              {paymentStep === 2 && method === 'Card' && (
                <>
                  <div className="card-details">
                    <div className="form-group">
                      <label>Cardholder Name:</label>
                      <input
                        type="text"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        placeholder="As it appears on your card"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Card Number:</label>
                      <div className="card-input-wrapper">
                        <input
                          type="text"
                          value={cardNumber}
                          onChange={handleCardNumberChange}
                          placeholder="1234 5678 9012 3456"
                          maxLength={19} // 16 digits + 3 spaces
                        />
                        {cardType && (
                          <div className="card-type-indicator">
                            {cardType === 'Visa' && 
                              <img src="https://cdn-icons-png.flaticon.com/512/196/196578.png" alt="Visa" className="card-type-icon" />}
                            {cardType === 'MasterCard' && 
                              <img src="https://cdn-icons-png.flaticon.com/512/196/196561.png" alt="MasterCard" className="card-type-icon" />}
                            {cardType === 'American Express' && 
                              <img src="https://cdn-icons-png.flaticon.com/512/196/196539.png" alt="AmEx" className="card-type-icon" />}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="card-row">
                      <div className="form-group">
                        <label>Expiry Date:</label>
                        <input
                          type="text"
                          value={expiryDate}
                          onChange={handleExpiryChange}
                          placeholder="MM/YY"
                          maxLength={5}
                        />
                      </div>
                      
                      <div className="form-group">
                        <label>CVV:</label>
                        <input
                          type="text"
                          value={cvv}
                          onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').substring(0, 3))}
                          placeholder="123"
                          maxLength={3}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="payment-summary">
                    <div className="summary-row">
                      <span>Invoice #:</span>
                      <span>{selectedBill.billing_id}</span>
                    </div>
                    <div className="summary-row">
                      <span>Payment Method:</span>
                      <span>{cardType ? `${cardType} Card` : 'Credit/Debit Card'}</span>
                    </div>
                    <div className="summary-row">
                      <span>Total Amount:</span>
                      <span>${Number(amount).toFixed(2)}</span>
                    </div>
                  </div>
                </>
              )}
              
              {paymentStep === 2 && method === 'PayPal' && (
                <div className="payment-summary">
                  <p>You'll be redirected to PayPal to complete your payment of ${Number(amount).toFixed(2)} for invoice #{selectedBill.billing_id}.</p>
                </div>
              )}
              
              {paymentStep === 3 && paymentSuccess && (
                <div className="payment-success">
                  <div className="success-icon">✓</div>
                  <h4>Payment Successful!</h4>
                  <p>Your payment of ${Number(amount).toFixed(2)} has been processed successfully.</p>
                  <p>A receipt has been generated and can be downloaded from the billing page.</p>
                  <button className="download-button" onClick={() => downloadReceipt(selectedBill.billing_id)}>
                    Download Receipt
                  </button>
                </div>
              )}
              
              {paymentStep === 3 && !paymentSuccess && (
                <div className="payment-processing">
                  <p>Processing your payment...</p>
                  {/* You could add a spinner here */}
                </div>
              )}
            </div>
            
            <div className="payment-actions">
              <button onClick={resetPaymentForm}>
                {paymentSuccess ? 'Close' : 'Cancel'}
              </button>
              
              {!paymentSuccess && paymentStep === 1 && (
                <button 
                  onClick={() => setPaymentStep(2)} 
                  disabled={!amount || !method}
                >
                  Continue
                </button>
              )}
              
              {!paymentSuccess && paymentStep === 2 && (
                <button 
                  onClick={handlePayment}
                  disabled={
                    (method === 'Card' && (!cardName || !cardNumber || !expiryDate || !cvv)) ||
                    !amount || !method
                  }
                >
                  Confirm Payment
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillingPage;