import React from 'react';
import './Invoice.css';

// Helper to convert number to English words (for invoice Grand Total)
function numberToWords(num) {
  if (num === 0) return 'Zero';
  
  const a = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  
  const makeGroup = (n) => {
    let word = '';
    const h = Math.floor(n / 100);
    const t = n % 100;
    
    if (h > 0) {
      word += a[h] + ' Hundred ';
    }
    
    if (t > 0) {
      if (t < 20) {
        word += a[t];
      } else {
        const tens = Math.floor(t / 10);
        const ones = t % 10;
        word += b[tens] + (ones > 0 ? ' ' + a[ones] : '');
      }
    }
    return word.trim();
  };

  const integerPart = Math.floor(num);
  const decimalPart = Math.round((num - integerPart) * 100);
  
  let temp = integerPart;
  let groupIdx = 0;
  let wordsArr = [];
  
  const g = ['', 'Thousand', 'Lakh', 'Crore']; // Indian system scale
  
  // Custom grouping for Indian numbering system (first group of 3, then groups of 2)
  let groups = [];
  if (temp > 0) {
    groups.push(temp % 1000);
    temp = Math.floor(temp / 1000);
  }
  while (temp > 0) {
    groups.push(temp % 100);
    temp = Math.floor(temp / 100);
  }

  for (let i = 0; i < groups.length; i++) {
    const groupVal = groups[i];
    if (groupVal > 0) {
      const groupWord = makeGroup(groupVal) + (g[i] ? ' ' + g[i] : '');
      wordsArr.unshift(groupWord.trim());
    }
  }
  
  let result = wordsArr.join(' ');
  if (decimalPart > 0) {
    result += ' and Paise ' + makeGroup(decimalPart);
  }
  return result.trim();
}

export default function Invoice({ order }) {
  if (!order) return null;

  // Format order date
  const orderDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric'
  });

  // Calculate items sum
  const itemsSum = order.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;
  const shippingCharge = Math.max(0, order.total - itemsSum);

  // Math variables for GST calculations (assuming 18% inclusive GST)
  // GST split: 9% CGST + 9% SGST
  let taxableSubtotal = 0;
  let totalTaxAmt = 0;

  // Compile list of invoice rows
  const invoiceRows = [];

  // 1. Add order items
  order.items?.forEach((item, index) => {
    const totalInclusive = item.price * item.quantity;
    
    // Tax calculations (inclusive)
    const baseRate = parseFloat((item.price / 1.18).toFixed(2));
    const taxableVal = parseFloat((baseRate * item.quantity).toFixed(2));
    const taxAmt = parseFloat((taxableVal * 0.18).toFixed(2));

    taxableSubtotal += taxableVal;
    totalTaxAmt += taxAmt;

    invoiceRows.push({
      sNo: index + 1,
      description: item.name,
      hsn: item.hsnCode || '39239090', // fallback HSN
      qty: item.quantity,
      baseRate: baseRate,
      taxPercent: '18%',
      taxAmt: taxAmt,
      total: totalInclusive
    });
  });

  // 2. Add shipping/delivery charge if applicable
  if (shippingCharge > 0) {
    const shippingBaseRate = parseFloat((shippingCharge / 1.18).toFixed(2));
    const shippingTaxAmt = parseFloat((shippingBaseRate * 0.18).toFixed(2));
    
    taxableSubtotal += shippingBaseRate;
    totalTaxAmt += shippingTaxAmt;

    invoiceRows.push({
      sNo: invoiceRows.length + 1,
      description: 'Freight & Packaging Services (Shipping)',
      hsn: '996813',
      qty: 1,
      baseRate: shippingBaseRate,
      taxPercent: '18%',
      taxAmt: shippingTaxAmt,
      total: shippingCharge
    });
  }

  // Final totals rounded to 2 decimal places
  taxableSubtotal = parseFloat(taxableSubtotal.toFixed(2));
  const cgstAmount = parseFloat((totalTaxAmt / 2).toFixed(2));
  const sgstAmount = parseFloat((totalTaxAmt / 2).toFixed(2));
  const finalGrandTotal = order.total;

  const amountInWordsStr = `Rupees ${numberToWords(finalGrandTotal)} Only`;

  // Determine terms and details
  const isPaid = order.paymentMethod === 'razorpay' || order.status === 'Delivered';
  const statusLabel = isPaid ? 'PAID' : 'UNPAID';
  const paymentTerms = order.paymentMethod === 'razorpay' ? 'PREPAID' : 'CASH ON DELIVERY';
  const settlementInfo = order.paymentMethod === 'razorpay' ? 'Razorpay Gateway Secure' : 'Cash on Delivery';

  return (
    <div className="printable-invoice">
      {/* Invoice Header */}
      <div className="invoice-header-row">
        <div className="invoice-logo-block">
          <div className="invoice-logo-circle">
            <span className="logo-text">S</span>
          </div>
          <div className="logo-brand">SOVELY</div>
        </div>
        <div className="invoice-title-block">
          <h1>TAX INVOICE</h1>
          <span className="invoice-subtitle">(Original for Recipient)</span>
        </div>
      </div>

      <div className="invoice-divider"></div>

      {/* Corporate details and Invoice Metadata */}
      <div className="invoice-meta-row">
        <div className="meta-col issued-by">
          <span className="section-label">Issued By:</span>
          <h2>Infinity Enterprises</h2>
          <p>123 Commerce St., Indiranagar</p>
          <p>Bengaluru, Karnataka, 560038</p>
          <p>State Code: 29</p>
          <p className="gstin-highlight"><strong>GSTIN:</strong> 29DTGPS4598H2ZR</p>
        </div>

        <div className="meta-col invoice-details-box">
          <div className="detail-line">
            <span>Invoice No:</span>
            <strong>INV/25-26/{order._id ? order._id.slice(-5).toUpperCase() : '00000'}</strong>
          </div>
          <div className="detail-line">
            <span>Date:</span>
            <strong>{orderDate}</strong>
          </div>
          <div className="detail-line">
            <span>Order Ref:</span>
            <strong>Sov-{order._id ? order._id.slice(-8) : '00000000'}</strong>
          </div>
          <div className="detail-line">
            <span>Status:</span>
            <strong className={`status-text ${statusLabel.toLowerCase()}`}>{statusLabel}</strong>
          </div>
        </div>
      </div>

      <div className="invoice-divider mt-2"></div>

      {/* Bill To vs Ship To */}
      <div className="invoice-addresses-row">
        <div className="address-col">
          <span className="section-label">Billed To:</span>
          <h3>{order.customerName}</h3>
          <p>{order.address}</p>
          <p>{order.city} - {order.postalCode}</p>
          <p>State Code: 29</p>
          <p><strong>GSTIN:</strong> N/A</p>
        </div>
        <div className="address-col">
          <span className="section-label">Shipped To:</span>
          <h3>{order.customerName}</h3>
          <p>{order.address}</p>
          <p>{order.city} - {order.postalCode}</p>
        </div>
      </div>

      {/* Table of items */}
      <table className="invoice-items-table">
        <thead>
          <tr>
            <th>S.No</th>
            <th>Description</th>
            <th>HSN</th>
            <th>Qty</th>
            <th>Base Rate</th>
            <th>Tax %</th>
            <th>Tax Amt</th>
            <th>Total (INR)</th>
          </tr>
        </thead>
        <tbody>
          {invoiceRows.map((row) => (
            <tr key={row.sNo}>
              <td>{row.sNo}</td>
              <td className="text-left font-semibold">{row.description}</td>
              <td>{row.hsn}</td>
              <td>{row.qty}</td>
              <td>Rs. {row.baseRate.toFixed(2)}</td>
              <td>{row.taxPercent}</td>
              <td>Rs. {row.taxAmt.toFixed(2)}</td>
              <td>Rs. {row.total.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Bottom Summary Section */}
      <div className="invoice-summary-row">
        {/* Left Side: Transaction Details */}
        <div className="summary-left-box">
          <h3>Transaction Details:</h3>
          <div className="transaction-line">
            <span>Payment Terms:</span>
            <span>{paymentTerms}</span>
          </div>
          <div className="transaction-line">
            <span>Status:</span>
            <span className={`status-pill-small ${statusLabel.toLowerCase()}`}>{statusLabel}</span>
          </div>
          <div className="transaction-line">
            <span>Settlement:</span>
            <span>{settlementInfo}</span>
          </div>
        </div>

        {/* Right Side: Totals Block */}
        <div className="summary-right-box">
          <div className="total-detail-line">
            <span>Subtotal (Taxable):</span>
            <strong>Rs. {taxableSubtotal.toFixed(2)}</strong>
          </div>
          <div className="total-detail-line">
            <span>CGST Amount:</span>
            <span>Rs. {cgstAmount.toFixed(2)}</span>
          </div>
          <div className="total-detail-line">
            <span>SGST Amount:</span>
            <span>Rs. {sgstAmount.toFixed(2)}</span>
          </div>
          <div className="grand-total-highlight">
            <span>Grand Total:</span>
            <strong>Rs. {finalGrandTotal.toFixed(2)}</strong>
          </div>
          
          <div className="amt-in-words">
            <span>Amount in Words:</span>
            <p>{amountInWordsStr}</p>
          </div>
        </div>
      </div>

      <div className="invoice-footer-note">
        <p>This is a computer-generated tax invoice and does not require a physical signature.</p>
        <p>Thank you for shopping with <strong>SOVELY</strong>!</p>
      </div>
    </div>
  );
}
