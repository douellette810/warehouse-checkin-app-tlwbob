
import * as Print from 'expo-print';
import { shareAsync } from 'expo-sharing';
import { CheckInFormData } from '@/types/checkIn';

/**
 * PDF Template Configuration
 * This allows for modular customization of the PDF layout
 */
export interface PDFTemplateConfig {
  companyName?: string;
  showTimestamps?: boolean;
  showBasicInfo?: boolean;
  showCategories?: boolean;
  showScrap?: boolean;
  showValueScrap?: boolean;
  showChargeMaterials?: boolean;
  showISeries?: boolean;
  showNotes?: boolean;
  scrapFields?: number; // Number of scrap fields to show (default 3)
  valueScrapFields?: number; // Number of value scrap fields to show (default 3)
}

/**
 * Default PDF template configuration
 */
const DEFAULT_CONFIG: PDFTemplateConfig = {
  companyName: 'Circuitry Solutions Warehouse Receiving Receipt',
  showTimestamps: true,
  showBasicInfo: true,
  showCategories: true,
  showScrap: true,
  showValueScrap: true,
  showChargeMaterials: true,
  showISeries: true,
  showNotes: true,
  scrapFields: 3,
  valueScrapFields: 3,
};

/**
 * Format date and time for PDF display
 */
const formatDateTime = (dateString: string | null): { date: string; time: string } => {
  if (!dateString) return { date: '', time: '' };
  const date = new Date(dateString);
  
  const dateStr = date.toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
  });
  
  const timeStr = date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
  
  return { date: dateStr, time: timeStr };
};

/**
 * Calculate duration between two timestamps
 */
const calculateDuration = (startedAt: string | null, finishedAt: string | null): string => {
  if (!startedAt || !finishedAt) return '';
  const start = new Date(startedAt);
  const finish = new Date(finishedAt);
  const durationMs = finish.getTime() - start.getTime();
  const hours = Math.floor(durationMs / 3600000);
  const minutes = Math.floor((durationMs % 3600000) / 60000);
  return `${hours}h ${minutes}m`;
};

/**
 * Generate the main check-in sheet HTML (Page 1)
 */
const generateMainSheetHTML = (
  checkIn: CheckInFormData,
  config: PDFTemplateConfig
): string => {
  const { date, time } = formatDateTime(checkIn.startedAt);
  const duration = calculateDuration(checkIn.startedAt, checkIn.finishedAt);
  
  // Get scrap data (normal scrap from categories)
  const scrapData = checkIn.categories.slice(0, config.scrapFields || 3);
  
  // Get value scrap data
  const valueScrapData = checkIn.valueScrap.slice(0, config.valueScrapFields || 3);
  
  // Calculate total for certificate of destruction
  const totalCategoryQuantity = checkIn.categories.reduce((total, item) => {
    const qty = parseFloat(item.quantity) || 0;
    return total + qty;
  }, 0);

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: Arial, sans-serif;
            font-size: 12px;
            padding: 20px;
            line-height: 1.4;
          }
          
          .header {
            text-align: center;
            margin-bottom: 20px;
            border-bottom: 2px solid #000;
            padding-bottom: 10px;
          }
          
          .header h1 {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 5px;
          }
          
          .section {
            margin-bottom: 15px;
          }
          
          .section-title {
            font-weight: bold;
            font-size: 13px;
            margin-bottom: 8px;
            text-decoration: underline;
          }
          
          .field-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            align-items: center;
          }
          
          .field {
            display: flex;
            align-items: center;
            flex: 1;
            margin-right: 15px;
          }
          
          .field:last-child {
            margin-right: 0;
          }
          
          .field-label {
            font-weight: normal;
            margin-right: 5px;
            white-space: nowrap;
          }
          
          .field-value {
            border-bottom: 1px solid #000;
            flex: 1;
            min-width: 100px;
            padding: 2px 5px;
          }
          
          .full-width-field {
            display: flex;
            align-items: center;
            margin-bottom: 8px;
          }
          
          .full-width-field .field-label {
            margin-right: 10px;
            min-width: 120px;
          }
          
          .full-width-field .field-value {
            flex: 1;
          }
          
          .table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
          }
          
          .table th,
          .table td {
            border: 1px solid #000;
            padding: 6px;
            text-align: left;
          }
          
          .table th {
            background-color: #f0f0f0;
            font-weight: bold;
          }
          
          .scrap-section {
            margin-top: 15px;
          }
          
          .scrap-fields {
            display: flex;
            justify-content: space-between;
            margin-top: 10px;
          }
          
          .scrap-field {
            flex: 1;
            margin-right: 15px;
          }
          
          .scrap-field:last-child {
            margin-right: 0;
          }
          
          .scrap-field-label {
            font-weight: normal;
            margin-bottom: 5px;
          }
          
          .scrap-field-input {
            border: 1px solid #000;
            padding: 8px;
            width: 100%;
            min-height: 30px;
          }
          
          .value-scrap-title {
            font-weight: bold;
            font-size: 13px;
            margin-top: 20px;
            margin-bottom: 10px;
          }
          
          .note {
            font-style: italic;
            font-size: 11px;
            color: #666;
            margin-top: 5px;
          }
        </style>
      </head>
      <body>
        ${config.companyName ? `
          <div class="header">
            <h1>${config.companyName}</h1>
          </div>
        ` : ''}
        
        ${config.showBasicInfo ? `
          <div class="section">
            <div class="field-row">
              <div class="field">
                <span class="field-label">Name</span>
                <span class="field-value">${checkIn.employeeName || ''}</span>
              </div>
              <div class="field">
                <span class="field-label">Date</span>
                <span class="field-value">${date}</span>
              </div>
              <div class="field">
                <span class="field-label">Time</span>
                <span class="field-value">${time}</span>
              </div>
            </div>
            
            <div class="full-width-field">
              <span class="field-label">Total Time Out and Back</span>
              <span class="field-value">${checkIn.totalTime || duration} Hours</span>
            </div>
          </div>
        ` : ''}
        
        <div class="section">
          <div class="full-width-field">
            <span class="field-label">Company of Origin</span>
            <span class="field-value">${checkIn.companyName || ''}</span>
          </div>
          
          <div class="full-width-field">
            <span class="field-label">Address</span>
            <span class="field-value">${checkIn.address || ''}</span>
          </div>
          
          <div class="field-row">
            <div class="field">
              <span class="field-label">Contact Person</span>
              <span class="field-value">${checkIn.contactPerson || ''}</span>
            </div>
          </div>
          
          <div class="field-row">
            <div class="field">
              <span class="field-label">EMAIL</span>
              <span class="field-value">${checkIn.email || ''}</span>
            </div>
            <div class="field">
              <span class="field-label">PHONE</span>
              <span class="field-value">${checkIn.phone || ''}</span>
            </div>
          </div>
        </div>
        
        <div class="section">
          <div class="section-title">Material Received:</div>
          
          ${config.showCategories ? `
            <div>
              <strong>Total Quantity for Certificate of Destruction by Category:</strong>
              <span style="margin-left: 10px;">(e.g # of Laptops, # of PCs, etc.)</span>
            </div>
            
            ${checkIn.categories.length > 0 ? `
              <table class="table">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Quantity</th>
                  </tr>
                </thead>
                <tbody>
                  ${checkIn.categories.map(item => `
                    <tr>
                      <td>${item.category}</td>
                      <td>${item.quantity}</td>
                    </tr>
                  `).join('')}
                  <tr style="font-weight: bold;">
                    <td>TOTAL</td>
                    <td>${totalCategoryQuantity}</td>
                  </tr>
                </tbody>
              </table>
            ` : '<p class="note">No categories recorded</p>'}
          ` : ''}
          
          ${config.showScrap ? `
            <div class="scrap-section">
              <div class="note">
                ANY I-SERIES PCs OR LAPTOPS NEED TO BE ADDED ON I-SERIES BREAKDOWN SHEET (SEE REVERSE)
              </div>
              
              <div class="scrap-fields">
                ${Array.from({ length: config.scrapFields || 3 }).map((_, index) => {
                  const scrapItem = scrapData[index];
                  return `
                    <div class="scrap-field">
                      <div class="scrap-field-label">Scrap ${index + 1}</div>
                      <div class="scrap-field-input">
                        ${scrapItem ? `${scrapItem.quantity} Lbs.` : '_____ Lbs.'}
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          ` : ''}
          
          ${config.showValueScrap ? `
            <div class="value-scrap-title">Value Scrap Below</div>
            
            <div class="scrap-fields">
              ${Array.from({ length: config.valueScrapFields || 3 }).map((_, index) => {
                const valueItem = valueScrapData[index];
                return `
                  <div class="scrap-field">
                    <div class="scrap-field-label">Value Scrap ${index + 1}</div>
                    <div class="scrap-field-input">
                      ${valueItem ? `${valueItem.materialName}: ${valueItem.quantity} ${valueItem.measurement}` : '_____ Lbs.'}
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          ` : ''}
        </div>
        
        ${config.showNotes && (checkIn.suspectedValueNote || checkIn.otherNotes) ? `
          <div class="section">
            ${checkIn.suspectedValueNote ? `
              <div>
                <strong>Suspected Value:</strong>
                <div style="border: 1px solid #000; padding: 8px; margin-top: 5px;">
                  ${checkIn.suspectedValueNote}
                </div>
              </div>
            ` : ''}
            
            ${checkIn.otherNotes ? `
              <div style="margin-top: 10px;">
                <strong>Other Notes / Damages / Customer Requests:</strong>
                <div style="border: 1px solid #000; padding: 8px; margin-top: 5px;">
                  ${checkIn.otherNotes}
                </div>
              </div>
            ` : ''}
          </div>
        ` : ''}
      </body>
    </html>
  `;
};

/**
 * Generate the i-Series sheet HTML (Page 2)
 */
const generateISeriesSheetHTML = (
  checkIn: CheckInFormData,
  config: PDFTemplateConfig
): string => {
  const hasISeriesData = 
    (checkIn.iSeriesPcs && checkIn.iSeriesPcs.length > 0) ||
    (checkIn.iSeriesLaptops && checkIn.iSeriesLaptops.length > 0);

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: Arial, sans-serif;
            font-size: 12px;
            padding: 20px;
            line-height: 1.4;
          }
          
          .header {
            text-align: center;
            margin-bottom: 20px;
            border-bottom: 2px solid #000;
            padding-bottom: 10px;
          }
          
          .header h1 {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 5px;
          }
          
          .section {
            margin-bottom: 15px;
          }
          
          .section-title {
            font-weight: bold;
            font-size: 13px;
            margin-bottom: 8px;
            text-decoration: underline;
          }
          
          .subsection-title {
            font-weight: bold;
            font-size: 12px;
            margin-top: 15px;
            margin-bottom: 8px;
          }
          
          .table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
          }
          
          .table th,
          .table td {
            border: 1px solid #000;
            padding: 6px;
            text-align: left;
          }
          
          .table th {
            background-color: #f0f0f0;
            font-weight: bold;
          }
          
          .note {
            font-style: italic;
            font-size: 11px;
            color: #666;
            margin-top: 5px;
          }
          
          .empty-message {
            padding: 20px;
            text-align: center;
            color: #666;
            font-style: italic;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>i-Series PCs and Laptops</h1>
        </div>
        
        <div class="section">
          <div class="section-title">Material Received:</div>
          <p class="note">Put i-Series PCs here (Same format as above)</p>
          
          ${hasISeriesData ? `
            <div class="subsection-title">PCs:</div>
            ${checkIn.iSeriesPcs && checkIn.iSeriesPcs.length > 0 ? `
              <table class="table">
                <thead>
                  <tr>
                    <th>Processor Series</th>
                    <th>Generation</th>
                    <th>Quantity</th>
                  </tr>
                </thead>
                <tbody>
                  ${checkIn.iSeriesPcs.map(item => `
                    <tr>
                      <td>${item.processorSeries}</td>
                      <td>${item.processorGeneration}</td>
                      <td>${item.quantity}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            ` : '<p class="empty-message">No i-Series PCs recorded</p>'}
            
            <div class="subsection-title">Laptops:</div>
            ${checkIn.iSeriesLaptops && checkIn.iSeriesLaptops.length > 0 ? `
              <table class="table">
                <thead>
                  <tr>
                    <th>Processor Series</th>
                    <th>Generation</th>
                    <th>Quantity</th>
                  </tr>
                </thead>
                <tbody>
                  ${checkIn.iSeriesLaptops.map(item => `
                    <tr>
                      <td>${item.processorSeries}</td>
                      <td>${item.processorGeneration}</td>
                      <td>${item.quantity}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            ` : '<p class="empty-message">No i-Series Laptops recorded</p>'}
          ` : `
            <div class="empty-message">
              No i-Series PCs or Laptops recorded for this check-in
            </div>
          `}
        </div>
      </body>
    </html>
  `;
};

/**
 * Generate a complete PDF with both pages
 */
export const generateCheckInPDF = async (
  checkIn: CheckInFormData,
  config: Partial<PDFTemplateConfig> = {}
): Promise<void> => {
  try {
    const finalConfig = { ...DEFAULT_CONFIG, ...config };
    
    console.log('Generating PDF for check-in:', checkIn.companyName);
    
    // Generate main sheet HTML
    const mainSheetHTML = generateMainSheetHTML(checkIn, finalConfig);
    
    // Generate i-Series sheet HTML
    const iSeriesSheetHTML = generateISeriesSheetHTML(checkIn, finalConfig);
    
    // Combine both pages into a single HTML document
    const combinedHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
          <style>
            @page {
              size: letter;
              margin: 0.5in;
            }
            
            .page-break {
              page-break-after: always;
            }
          </style>
        </head>
        <body>
          <div class="page-break">
            ${mainSheetHTML.replace(/<!DOCTYPE html>|<html>|<\/html>|<head>.*?<\/head>|<body>|<\/body>/gs, '')}
          </div>
          
          ${finalConfig.showISeries ? `
            <div>
              ${iSeriesSheetHTML.replace(/<!DOCTYPE html>|<html>|<\/html>|<head>.*?<\/head>|<body>|<\/body>/gs, '')}
            </div>
          ` : ''}
        </body>
      </html>
    `;
    
    // Generate PDF
    const { uri } = await Print.printToFileAsync({
      html: combinedHTML,
    });
    
    console.log('PDF generated successfully:', uri);
    
    // Share the PDF
    const fileName = `check-in-${checkIn.companyName.replace(/[^a-z0-9]/gi, '_')}-${new Date().getTime()}.pdf`;
    
    await shareAsync(uri, {
      mimeType: 'application/pdf',
      dialogTitle: 'Share Check-In PDF',
      UTI: 'com.adobe.pdf',
    });
    
    console.log('PDF shared successfully');
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};

/**
 * Generate a PDF for a single check-in with custom configuration
 */
export const generateCustomCheckInPDF = async (
  checkIn: CheckInFormData,
  customConfig: Partial<PDFTemplateConfig>
): Promise<void> => {
  return generateCheckInPDF(checkIn, customConfig);
};

/**
 * Generate a combined PDF for multiple check-ins
 */
export const generateMultipleCheckInsPDF = async (
  checkIns: CheckInFormData[],
  config: Partial<PDFTemplateConfig> = {}
): Promise<void> => {
  try {
    const finalConfig = { ...DEFAULT_CONFIG, ...config };
    
    console.log(`Generating PDF for ${checkIns.length} check-ins`);
    
    // Generate HTML for each check-in
    const checkInPages = checkIns.map((checkIn, index) => {
      const mainSheet = generateMainSheetHTML(checkIn, finalConfig);
      const iSeriesSheet = generateISeriesSheetHTML(checkIn, finalConfig);
      
      return `
        <div class="page-break">
          ${mainSheet.replace(/<!DOCTYPE html>|<html>|<\/html>|<head>.*?<\/head>|<body>|<\/body>/gs, '')}
        </div>
        
        ${finalConfig.showISeries ? `
          <div class="page-break">
            ${iSeriesSheet.replace(/<!DOCTYPE html>|<html>|<\/html>|<head>.*?<\/head>|<body>|<\/body>/gs, '')}
          </div>
        ` : ''}
      `;
    }).join('');
    
    // Combine all pages
    const combinedHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
          <style>
            @page {
              size: letter;
              margin: 0.5in;
            }
            
            .page-break {
              page-break-after: always;
            }
          </style>
        </head>
        <body>
          ${checkInPages}
        </body>
      </html>
    `;
    
    // Generate PDF
    const { uri } = await Print.printToFileAsync({
      html: combinedHTML,
    });
    
    console.log('Combined PDF generated successfully:', uri);
    
    // Share the PDF
    const fileName = `all-check-ins-${new Date().getTime()}.pdf`;
    
    await shareAsync(uri, {
      mimeType: 'application/pdf',
      dialogTitle: 'Share All Check-Ins PDF',
      UTI: 'com.adobe.pdf',
    });
    
    console.log('Combined PDF shared successfully');
  } catch (error) {
    console.error('Error generating combined PDF:', error);
    throw error;
  }
};
