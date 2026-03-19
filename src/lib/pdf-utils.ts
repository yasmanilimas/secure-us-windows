// PDF Generation utilities for estimates

interface EstimateProduct {
  type: string;
  model: string;
  quantity: number;
  width: number;
  height: number;
  frameColor: string;
  glassTint: string;
  lowE: string;
  privacy: boolean;
  screen: boolean;
  unitPrice: number;
  totalPrice: number;
}

interface EstimateData {
  id: string;
  created_at: string;
  wind_zone: string | null;
  products: EstimateProduct[];
  subtotal: number;
  taxes: number;
  total: number;
  lead: {
    email: string;
    full_name: string | null;
    phone: string | null;
  } | null;
}

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const generateEstimatePDF = (estimate: EstimateData): void => {
  const companyName = 'Powerful Impact Windows';
  const companyPhone = '+1 786 779 7140';
  const companyOwner = 'Abelardo Soler';
  
  // Create printable HTML content
  const printContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Estimate - ${estimate.lead?.full_name || 'Customer'}</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
          padding: 40px;
          color: #1a3a5c;
          line-height: 1.6;
        }
        .header { 
          display: flex; 
          justify-content: space-between; 
          align-items: flex-start;
          border-bottom: 3px solid #1a3a5c; 
          padding-bottom: 20px; 
          margin-bottom: 30px;
        }
        .logo-section h1 { 
          font-size: 28px; 
          color: #1a3a5c;
          font-weight: bold;
        }
        .logo-section p { 
          color: #666; 
          font-size: 14px;
        }
        .company-info { 
          text-align: right; 
          font-size: 14px;
        }
        .company-info p { margin: 4px 0; }
        .estimate-info {
          display: flex;
          justify-content: space-between;
          margin-bottom: 30px;
          background: #f5f7fa;
          padding: 20px;
          border-radius: 8px;
        }
        .customer-info h3, .estimate-details h3 {
          font-size: 14px;
          text-transform: uppercase;
          color: #666;
          margin-bottom: 8px;
        }
        .customer-info p, .estimate-details p {
          font-size: 15px;
          margin: 4px 0;
        }
        table { 
          width: 100%; 
          border-collapse: collapse; 
          margin: 20px 0;
        }
        th { 
          background: #1a3a5c; 
          color: white; 
          padding: 12px 8px; 
          text-align: left;
          font-size: 13px;
          text-transform: uppercase;
        }
        td { 
          padding: 12px 8px; 
          border-bottom: 1px solid #e0e0e0;
          font-size: 14px;
        }
        tr:nth-child(even) { background: #f9fafb; }
        .options-cell { font-size: 12px; color: #666; }
        .option-tag {
          display: inline-block;
          background: #e8f4fd;
          color: #1a3a5c;
          padding: 2px 8px;
          border-radius: 4px;
          margin: 2px;
          font-size: 11px;
        }
        .totals { 
          margin-top: 30px; 
          text-align: right; 
        }
        .totals-box {
          display: inline-block;
          background: #f5f7fa;
          padding: 20px 30px;
          border-radius: 8px;
        }
        .total-row { 
          display: flex; 
          justify-content: space-between; 
          gap: 40px;
          margin: 8px 0;
          font-size: 15px;
        }
        .total-row.grand-total { 
          font-size: 20px; 
          font-weight: bold; 
          color: #1a3a5c;
          border-top: 2px solid #1a3a5c;
          padding-top: 12px;
          margin-top: 12px;
        }
        .footer { 
          margin-top: 50px; 
          padding-top: 20px; 
          border-top: 1px solid #e0e0e0; 
          text-align: center;
          color: #666;
          font-size: 13px;
        }
        .disclaimer {
          background: #fff3cd;
          border: 1px solid #ffc107;
          padding: 15px;
          border-radius: 8px;
          margin-top: 30px;
          font-size: 13px;
          color: #856404;
        }
        @media print {
          body { padding: 20px; }
          .header { page-break-after: avoid; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo-section">
          <h1>${companyName}</h1>
          <p>Hurricane Protection Windows & Doors</p>
        </div>
        <div class="company-info">
          <p><strong>${companyOwner}</strong></p>
          <p>${companyPhone}</p>
          <p>Nationwide Service</p>
        </div>
      </div>
      
      <div class="estimate-info">
        <div class="customer-info">
          <h3>Customer</h3>
          <p><strong>${estimate.lead?.full_name || 'N/A'}</strong></p>
          <p>${estimate.lead?.email || 'N/A'}</p>
          ${estimate.lead?.phone ? `<p>${estimate.lead.phone}</p>` : ''}
        </div>
        <div class="estimate-details">
          <h3>Estimate Details</h3>
          <p><strong>Date:</strong> ${formatDate(estimate.created_at)}</p>
          <p><strong>ID:</strong> ${estimate.id.slice(0, 8).toUpperCase()}</p>
          ${estimate.wind_zone ? `<p><strong>Wind Zone:</strong> ${estimate.wind_zone}</p>` : ''}
        </div>
      </div>
      
      <table>
        <thead>
          <tr>
            <th>Product</th>
            <th>Qty</th>
            <th>Dimensions</th>
            <th>Options</th>
            <th style="text-align: right;">Price</th>
          </tr>
        </thead>
        <tbody>
          ${estimate.products.map(product => `
            <tr>
              <td>
                <strong>${product.model}</strong><br>
                <span style="color: #666; font-size: 12px;">${product.type}</span>
              </td>
              <td>${product.quantity}</td>
              <td>${product.width}" x ${product.height}"</td>
              <td class="options-cell">
                <span class="option-tag">${product.frameColor}</span>
                <span class="option-tag">${product.glassTint}</span>
                ${product.lowE !== 'none' ? '<span class="option-tag">Low-E</span>' : ''}
                ${product.privacy ? '<span class="option-tag">Privacy</span>' : ''}
                ${product.screen ? '<span class="option-tag">Screen</span>' : ''}
              </td>
              <td style="text-align: right; font-weight: 500;">${formatCurrency(product.totalPrice)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      
      <div class="totals">
        <div class="totals-box">
          <div class="total-row">
            <span>Subtotal:</span>
            <span>${formatCurrency(estimate.subtotal)}</span>
          </div>
          <div class="total-row">
            <span>Taxes (7%):</span>
            <span>${formatCurrency(estimate.taxes)}</span>
          </div>
          <div class="total-row grand-total">
            <span>Total:</span>
            <span>${formatCurrency(estimate.total)}</span>
          </div>
        </div>
      </div>
      
      <div class="disclaimer">
        <strong>Note:</strong> This is an estimate based on standard configurations. 
        Final pricing may vary depending on site conditions, current promotions, and exact specifications. 
        Please contact us for an official quote.
      </div>
      
      <div class="footer">
        <p>${companyName} | ${companyPhone}</p>
        <p>Thank you for choosing us for your hurricane protection needs!</p>
      </div>
    </body>
    </html>
  `;

  // Open print dialog
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  }
};
