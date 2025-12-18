
import * as Print from 'expo-print';
import { shareAsync } from 'expo-sharing';
import { CheckInFormData } from '@/types/checkIn';
import * as FileSystem from 'expo-file-system/legacy';
import { Alert } from 'react-native';

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
};

/**
 * Escape HTML special characters to prevent HTML injection and parsing errors
 */
const escapeHtml = (text: string | null | undefined): string => {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

/**
 * Format date and time for PDF display
 */
const formatDateTime = (dateString: string | null): { date: string; time: string } => {
  if (!dateString) return { date: '', time: '' };
  
  try {
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
  } catch (error) {
    console.error('Error formatting date:', error);
    return { date: '', time: '' };
  }
};

/**
 * Format date for filename (MM-DD-YYYY)
 */
const formatDateForFilename = (dateString: string | null): string => {
  if (!dateString) {
    const now = new Date();
    return now.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
    }).replace(/\//g, '-');
  }
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
    }).replace(/\//g, '-');
  } catch (error) {
    console.error('Error formatting date for filename:', error);
    const now = new Date();
    return now.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
    }).replace(/\//g, '-');
  }
};

/**
 * Sanitize filename to remove invalid characters
 */
const sanitizeFilename = (filename: string): string => {
  return filename.replace(/[^a-z0-9\s\-_()]/gi, '').replace(/\s+/g, ' ').trim();
};

/**
 * Generate filename based on company name and date
 * Format: "(Company Name) Check-In Sheet (Date).pdf"
 */
const generateFilename = (checkIn: CheckInFormData): string => {
  const companyName = sanitizeFilename(checkIn.companyName || 'Unknown Company');
  const date = formatDateForFilename(checkIn.startedAt);
  return `(${companyName}) Check-In Sheet (${date}).pdf`;
};

/**
 * Calculate duration between two timestamps
 */
const calculateDuration = (startedAt: string | null, finishedAt: string | null): string => {
  if (!startedAt || !finishedAt) return '';
  
  try {
    const start = new Date(startedAt);
    const finish = new Date(finishedAt);
    const durationMs = finish.getTime() - start.getTime();
    const hours = Math.floor(durationMs / 3600000);
    const minutes = Math.floor((durationMs % 3600000) / 60000);
    return `${hours}h ${minutes}m`;
  } catch (error) {
    console.error('Error calculating duration:', error);
    return '';
  }
};

/**
 * Generate the main check-in sheet HTML (Page 1)
 * This matches the exact formatting of the handwritten template
 */
const generateMainSheetHTML = (
  checkIn: CheckInFormData,
  config: PDFTemplateConfig
): string => {
  const { date, time } = formatDateTime(checkIn.startedAt);
  const duration = calculateDuration(checkIn.startedAt, checkIn.finishedAt);
  
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
            font-family: 'Courier New', Courier, monospace;
            font-size: 10pt;
            padding: 0.5in;
            line-height: 1.4;
            color: #000;
          }
          
          .header {
            text-align: center;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 3px double #000;
          }
          
          .header h1 {
            font-size: 14pt;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          
          .form-section {
            margin-bottom: 15px;
            page-break-inside: avoid;
          }
          
          .form-row {
            display: flex;
            margin-bottom: 8px;
            align-items: baseline;
          }
          
          .form-field {
            display: flex;
            align-items: baseline;
            margin-right: 20px;
          }
          
          .form-field-full {
            display: flex;
            align-items: baseline;
            width: 100%;
            margin-bottom: 8px;
          }
          
          .field-label {
            font-weight: bold;
            margin-right: 8px;
            white-space: nowrap;
          }
          
          .field-value {
            border-bottom: 1px solid #000;
            min-width: 150px;
            padding: 0 5px 2px 5px;
            flex: 1;
          }
          
          .section-title {
            font-weight: bold;
            font-size: 11pt;
            margin-bottom: 10px;
            margin-top: 15px;
            text-decoration: underline;
            text-transform: uppercase;
          }
          
          .subsection-title {
            font-weight: bold;
            font-size: 10pt;
            margin-top: 12px;
            margin-bottom: 8px;
          }
          
          .category-table {
            width: 100%;
            border-collapse: collapse;
            margin: 10px 0;
            border: 2px solid #000;
          }
          
          .category-table th,
          .category-table td {
            border: 1px solid #000;
            padding: 6px 8px;
            text-align: left;
          }
          
          .category-table th {
            background-color: #e8e8e8;
            font-weight: bold;
            text-transform: uppercase;
            font-size: 9pt;
          }
          
          .category-table td {
            font-size: 10pt;
          }
          
          .category-table .total-row {
            font-weight: bold;
            background-color: #f5f5f5;
            border-top: 2px solid #000;
          }
          
          .material-list {
            margin: 10px 0;
          }
          
          .material-item {
            display: flex;
            justify-content: space-between;
            padding: 5px 10px;
            margin-bottom: 4px;
            border: 1px solid #000;
            background-color: #fafafa;
          }
          
          .material-name {
            font-weight: 500;
          }
          
          .material-quantity {
            font-weight: bold;
            margin-left: 20px;
          }
          
          .notes-section {
            margin-top: 15px;
            page-break-inside: avoid;
          }
          
          .notes-box {
            border: 2px solid #000;
            padding: 10px;
            min-height: 60px;
            margin-top: 8px;
            background-color: #fafafa;
          }
          
          .notes-label {
            font-weight: bold;
            margin-bottom: 5px;
            text-transform: uppercase;
          }
          
          .notes-content {
            font-size: 10pt;
            white-space: pre-wrap;
            line-height: 1.5;
          }
          
          .instruction-text {
            font-size: 9pt;
            font-style: italic;
            color: #555;
            margin-bottom: 8px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Circuitry Solutions Warehouse Receiving Receipt</h1>
        </div>
        
        <!-- Basic Information Section -->
        <div class="form-section">
          <div class="form-row">
            <div class="form-field" style="flex: 2;">
              <span class="field-label">Name:</span>
              <span class="field-value">${escapeHtml(checkIn.employeeName)}</span>
            </div>
            <div class="form-field" style="flex: 1;">
              <span class="field-label">Date:</span>
              <span class="field-value">${escapeHtml(date)}</span>
            </div>
            <div class="form-field" style="flex: 1;">
              <span class="field-label">Time:</span>
              <span class="field-value">${escapeHtml(time)}</span>
            </div>
          </div>
          
          <div class="form-field-full">
            <span class="field-label">Total Time Out and Back (Hrs.):</span>
            <span class="field-value">${escapeHtml(checkIn.totalTime || duration)}</span>
          </div>
        </div>
        
        <!-- Company Information Section -->
        <div class="form-section">
          <div class="form-field-full">
            <span class="field-label">Company of Origin:</span>
            <span class="field-value">${escapeHtml(checkIn.companyName)}</span>
          </div>
          
          <div class="form-field-full">
            <span class="field-label">Address:</span>
            <span class="field-value">${escapeHtml(checkIn.address)}</span>
          </div>
          
          <div class="form-field-full">
            <span class="field-label">Contact Person:</span>
            <span class="field-value">${escapeHtml(checkIn.contactPerson)}</span>
          </div>
          
          <div class="form-row">
            <div class="form-field" style="flex: 1;">
              <span class="field-label">EMAIL:</span>
              <span class="field-value">${escapeHtml(checkIn.email)}</span>
            </div>
            <div class="form-field" style="flex: 1;">
              <span class="field-label">PHONE:</span>
              <span class="field-value">${escapeHtml(checkIn.phone)}</span>
            </div>
          </div>
        </div>
        
        <!-- Material Received Section -->
        <div class="section-title">Material Received:</div>
        
        ${checkIn.categories.length > 0 ? `
          <div class="form-section">
            <div class="subsection-title">Total Quantity for Certificate of Destruction by Category:</div>
            <div class="instruction-text">(e.g # of Laptops, # of PCs, etc.)</div>
            
            <table class="category-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th style="width: 120px;">Quantity</th>
                </tr>
              </thead>
              <tbody>
                ${checkIn.categories.map(item => `
                  <tr>
                    <td>${escapeHtml(item.category)}</td>
                    <td>${escapeHtml(item.quantity)}</td>
                  </tr>
                `).join('')}
                <tr class="total-row">
                  <td>TOTAL</td>
                  <td>${totalCategoryQuantity}</td>
                </tr>
              </tbody>
            </table>
          </div>
        ` : ''}
        
        ${checkIn.valueScrap.length > 0 ? `
          <div class="form-section">
            <div class="subsection-title">Value Scrap Received:</div>
            <div class="material-list">
              ${checkIn.valueScrap.map(item => `
                <div class="material-item">
                  <span class="material-name">${escapeHtml(item.materialName)}</span>
                  <span class="material-quantity">${escapeHtml(item.quantity)} ${escapeHtml(item.measurement)}</span>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}
        
        ${checkIn.chargeMaterials.length > 0 ? `
          <div class="form-section">
            <div class="subsection-title">Charge Materials Received:</div>
            <div class="material-list">
              ${checkIn.chargeMaterials.map(item => `
                <div class="material-item">
                  <span class="material-name">${escapeHtml(item.materialName)}</span>
                  <span class="material-quantity">${escapeHtml(item.quantity)} ${escapeHtml(item.measurement)}</span>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}
        
        <!-- Notes Section -->
        ${checkIn.suspectedValueNote ? `
          <div class="notes-section">
            <div class="notes-label">Is there anything else of suspected value in this load?</div>
            <div class="notes-box">
              <div class="notes-content">${escapeHtml(checkIn.suspectedValueNote)}</div>
            </div>
          </div>
        ` : ''}
        
        ${checkIn.otherNotes ? `
          <div class="notes-section">
            <div class="notes-label">Other Notes / Damages / Customer Requests:</div>
            <div class="notes-box">
              <div class="notes-content">${escapeHtml(checkIn.otherNotes)}</div>
            </div>
          </div>
        ` : ''}
      </body>
    </html>
  `;
};

/**
 * Generate the i-Series sheet HTML (Page 2)
 * This matches the exact formatting of the handwritten template
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
            font-family: 'Courier New', Courier, monospace;
            font-size: 10pt;
            padding: 0.5in;
            line-height: 1.4;
            color: #000;
          }
          
          .header {
            text-align: center;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 3px double #000;
          }
          
          .header h1 {
            font-size: 14pt;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          
          .section-title {
            font-weight: bold;
            font-size: 11pt;
            margin-bottom: 10px;
            margin-top: 15px;
            text-decoration: underline;
            text-transform: uppercase;
          }
          
          .subsection-title {
            font-weight: bold;
            font-size: 10pt;
            margin-top: 15px;
            margin-bottom: 8px;
          }
          
          .instruction-text {
            font-size: 9pt;
            font-style: italic;
            color: #555;
            margin-bottom: 12px;
            text-transform: uppercase;
          }
          
          .iseries-table {
            width: 100%;
            border-collapse: collapse;
            margin: 10px 0 20px 0;
            border: 2px solid #000;
          }
          
          .iseries-table th,
          .iseries-table td {
            border: 1px solid #000;
            padding: 6px 8px;
            text-align: left;
          }
          
          .iseries-table th {
            background-color: #e8e8e8;
            font-weight: bold;
            text-transform: uppercase;
            font-size: 9pt;
          }
          
          .iseries-table td {
            font-size: 10pt;
          }
          
          .empty-message {
            padding: 20px;
            text-align: center;
            color: #999;
            font-style: italic;
            border: 2px dashed #ccc;
            margin-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>i-Series / Ryzen PCs and Laptops Breakdown</h1>
        </div>
        
        <div class="section-title">Material Received:</div>
        <div class="instruction-text">ANY I-SERIES OR RYZEN PCs OR LAPTOPS NEED TO BE ADDED HERE</div>
        
        ${hasISeriesData ? `
          ${checkIn.iSeriesPcs && checkIn.iSeriesPcs.length > 0 ? `
            <div class="subsection-title">PCs:</div>
            <table class="iseries-table">
              <thead>
                <tr>
                  <th>Processor Series</th>
                  <th>Generation</th>
                  <th style="width: 120px;">Quantity</th>
                </tr>
              </thead>
              <tbody>
                ${checkIn.iSeriesPcs.map(item => `
                  <tr>
                    <td>${escapeHtml(item.processorSeries)}</td>
                    <td>${escapeHtml(item.processorGeneration)}</td>
                    <td>${escapeHtml(item.quantity)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          ` : ''}
          
          ${checkIn.iSeriesLaptops && checkIn.iSeriesLaptops.length > 0 ? `
            <div class="subsection-title">Laptops:</div>
            <table class="iseries-table">
              <thead>
                <tr>
                  <th>Processor Series</th>
                  <th>Generation</th>
                  <th style="width: 120px;">Quantity</th>
                </tr>
              </thead>
              <tbody>
                ${checkIn.iSeriesLaptops.map(item => `
                  <tr>
                    <td>${escapeHtml(item.processorSeries)}</td>
                    <td>${escapeHtml(item.processorGeneration)}</td>
                    <td>${escapeHtml(item.quantity)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          ` : ''}
        ` : `
          <div class="empty-message">
            No i-Series or Ryzen PCs or Laptops recorded for this check-in
          </div>
        `}
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
    
    // Determine if we need to show the i-Series page
    const hasISeriesData = 
      (checkIn.iSeriesPcs && checkIn.iSeriesPcs.length > 0) ||
      (checkIn.iSeriesLaptops && checkIn.iSeriesLaptops.length > 0);
    
    // Combine both pages into a single HTML document
    const combinedHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
          <style>
            @page {
              size: letter;
              margin: 0;
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
          
          ${finalConfig.showISeries && hasISeriesData ? `
            <div>
              ${iSeriesSheetHTML.replace(/<!DOCTYPE html>|<html>|<\/html>|<head>.*?<\/head>|<body>|<\/body>/gs, '')}
            </div>
          ` : ''}
        </body>
      </html>
    `;
    
    // Generate PDF with error handling
    console.log('Calling Print.printToFileAsync...');
    const { uri } = await Print.printToFileAsync({
      html: combinedHTML,
    });
    
    console.log('PDF generated successfully:', uri);
    
    // Generate filename with proper format
    const fileName = generateFilename(checkIn);
    
    // Share the PDF with the proper filename
    console.log('Sharing PDF:', fileName);
    await shareAsync(uri, {
      mimeType: 'application/pdf',
      dialogTitle: `Share ${fileName}`,
      UTI: 'com.adobe.pdf',
    });
    
    console.log('PDF shared successfully:', fileName);
  } catch (error) {
    console.error('Error generating PDF:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
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
 * Generate individual PDFs for multiple check-ins
 * Each check-in will be exported as a separate PDF file
 */
export const generateMultipleCheckInsPDF = async (
  checkIns: CheckInFormData[],
  config: Partial<PDFTemplateConfig> = {}
): Promise<void> => {
  try {
    const finalConfig = { ...DEFAULT_CONFIG, ...config };
    
    console.log(`Generating ${checkIns.length} individual PDFs`);
    
    if (checkIns.length === 0) {
      Alert.alert('No Check-Ins', 'There are no check-ins to export.');
      return;
    }
    
    // Create a temporary directory to store all PDFs
    const tempDirPath = `${FileSystem.cacheDirectory}check-in-exports/`;
    
    try {
      // Create the directory if it doesn't exist
      const dirInfo = await FileSystem.getInfoAsync(tempDirPath);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(tempDirPath, { intermediates: true });
        console.log('Created temp directory:', tempDirPath);
      }
    } catch (error) {
      console.log('Error creating directory:', error);
    }
    
    // Generate individual PDFs
    const generatedFiles: string[] = [];
    let successCount = 0;
    let failCount = 0;
    
    for (let i = 0; i < checkIns.length; i++) {
      const checkIn = checkIns[i];
      
      try {
        console.log(`Generating PDF ${i + 1}/${checkIns.length}: ${checkIn.companyName}`);
        
        // Generate main sheet HTML
        const mainSheetHTML = generateMainSheetHTML(checkIn, finalConfig);
        
        // Generate i-Series sheet HTML
        const iSeriesSheetHTML = generateISeriesSheetHTML(checkIn, finalConfig);
        
        // Determine if we need to show the i-Series page
        const hasISeriesData = 
          (checkIn.iSeriesPcs && checkIn.iSeriesPcs.length > 0) ||
          (checkIn.iSeriesLaptops && checkIn.iSeriesLaptops.length > 0);
        
        // Combine both pages into a single HTML document
        const combinedHTML = `
          <!DOCTYPE html>
          <html>
            <head>
              <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
              <style>
                @page {
                  size: letter;
                  margin: 0;
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
              
              ${finalConfig.showISeries && hasISeriesData ? `
                <div>
                  ${iSeriesSheetHTML.replace(/<!DOCTYPE html>|<html>|<\/html>|<head>.*?<\/head>|<body>|<\/body>/gs, '')}
                </div>
              ` : ''}
            </body>
          </html>
        `;
        
        // Generate PDF
        console.log(`Calling Print.printToFileAsync for check-in ${i + 1}...`);
        const { uri } = await Print.printToFileAsync({
          html: combinedHTML,
        });
        
        console.log(`PDF ${i + 1} generated:`, uri);
        
        // Generate filename with proper format
        const fileName = generateFilename(checkIn);
        const destinationPath = `${tempDirPath}${fileName}`;
        
        try {
          // Copy the PDF to our temp directory with the proper filename
          await FileSystem.copyAsync({
            from: uri,
            to: destinationPath,
          });
          
          generatedFiles.push(destinationPath);
          successCount++;
          console.log(`Successfully generated: ${fileName}`);
        } catch (copyError) {
          console.error(`Error copying file ${fileName}:`, copyError);
          failCount++;
        }
        
      } catch (error) {
        console.error(`Error generating PDF for ${checkIn.companyName}:`, error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        failCount++;
      }
    }
    
    console.log(`PDF generation complete. Success: ${successCount}, Failed: ${failCount}`);
    
    if (generatedFiles.length === 0) {
      Alert.alert(
        'Export Failed',
        'Failed to generate any PDFs. Please try again.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    // Share the first file (this will open the share dialog)
    // Note: On mobile, we can only share one file at a time with expo-sharing
    // For multiple files, we would need to zip them or use a different approach
    if (generatedFiles.length === 1) {
      await shareAsync(generatedFiles[0], {
        mimeType: 'application/pdf',
        dialogTitle: 'Share Check-In PDF',
        UTI: 'com.adobe.pdf',
      });
      
      Alert.alert(
        'Export Complete',
        `Successfully exported 1 PDF file.`,
        [{ text: 'OK' }]
      );
    } else {
      // For multiple files, share the first one and inform the user
      await shareAsync(generatedFiles[0], {
        mimeType: 'application/pdf',
        dialogTitle: 'Share Check-In PDFs',
        UTI: 'com.adobe.pdf',
      });
      
      Alert.alert(
        'Export Complete',
        `Successfully exported ${successCount} PDF files.\n\n` +
        `Note: Due to platform limitations, files are being shared one at a time. ` +
        `The files are saved in:\n${tempDirPath}\n\n` +
        `You can find all exported PDFs in your device's file manager.`,
        [
          {
            text: 'Share Next',
            onPress: async () => {
              // Share remaining files one by one
              for (let i = 1; i < generatedFiles.length; i++) {
                try {
                  await shareAsync(generatedFiles[i], {
                    mimeType: 'application/pdf',
                    dialogTitle: `Share Check-In PDF (${i + 1}/${generatedFiles.length})`,
                    UTI: 'com.adobe.pdf',
                  });
                } catch (error) {
                  console.error(`Error sharing file ${i + 1}:`, error);
                }
              }
            }
          },
          { text: 'Done', style: 'cancel' }
        ]
      );
    }
    
    console.log('All PDFs shared successfully');
    
  } catch (error) {
    console.error('Error generating multiple PDFs:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    Alert.alert(
      'Export Error',
      'An error occurred while exporting PDFs. Please try again.',
      [{ text: 'OK' }]
      );
    throw error;
  }
};
