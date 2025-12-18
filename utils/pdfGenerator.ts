
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
  return `${companyName} Check-In Sheet ${date}.pdf`;
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
            font-family: Arial, sans-serif;
            font-size: 11px;
            padding: 20px;
            line-height: 1.3;
          }
          
          .header {
            text-align: center;
            margin-bottom: 15px;
            border-bottom: 2px solid #000;
            padding-bottom: 8px;
          }
          
          .header h1 {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 3px;
          }
          
          .section {
            margin-bottom: 12px;
          }
          
          .section-title {
            font-weight: bold;
            font-size: 12px;
            margin-bottom: 6px;
            text-decoration: underline;
          }
          
          .field-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 6px;
            align-items: center;
          }
          
          .field {
            display: flex;
            align-items: center;
            flex: 1;
            margin-right: 12px;
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
            min-width: 80px;
            padding: 1px 4px;
          }
          
          .full-width-field {
            display: flex;
            align-items: center;
            margin-bottom: 6px;
          }
          
          .full-width-field .field-label {
            margin-right: 8px;
            min-width: 100px;
          }
          
          .full-width-field .field-value {
            flex: 1;
          }
          
          .table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 8px;
            margin-bottom: 8px;
          }
          
          .table th,
          .table td {
            border: 1px solid #000;
            padding: 4px 6px;
            text-align: left;
          }
          
          .table th {
            background-color: #f0f0f0;
            font-weight: bold;
            font-size: 11px;
          }
          
          .table td {
            font-size: 10px;
          }
          
          .table-total {
            font-weight: bold;
            background-color: #f8f8f8;
          }
          
          .materials-section {
            margin-top: 12px;
          }
          
          .materials-title {
            font-weight: bold;
            font-size: 12px;
            margin-bottom: 8px;
          }
          
          .materials-subtitle {
            font-size: 10px;
            color: #666;
            margin-bottom: 6px;
            font-style: italic;
          }
          
          .material-item {
            display: flex;
            justify-content: space-between;
            padding: 4px 8px;
            margin-bottom: 3px;
            border: 1px solid #ddd;
            background-color: #fafafa;
          }
          
          .material-name {
            font-weight: 500;
            flex: 1;
          }
          
          .material-quantity {
            font-weight: bold;
            margin-left: 10px;
          }
          
          .note-box {
            border: 1px solid #000;
            padding: 8px;
            margin-top: 6px;
            min-height: 40px;
            background-color: #fafafa;
          }
          
          .note-title {
            font-weight: bold;
            margin-bottom: 4px;
          }
          
          .note-content {
            font-size: 10px;
            white-space: pre-wrap;
          }
          
          .empty-message {
            font-style: italic;
            color: #999;
            font-size: 10px;
          }
        </style>
      </head>
      <body>
        ${config.companyName ? `
          <div class="header">
            <h1>${escapeHtml(config.companyName)}</h1>
          </div>
        ` : ''}
        
        ${config.showBasicInfo ? `
          <div class="section">
            <div class="field-row">
              <div class="field">
                <span class="field-label">Name:</span>
                <span class="field-value">${escapeHtml(checkIn.employeeName)}</span>
              </div>
              <div class="field">
                <span class="field-label">Date:</span>
                <span class="field-value">${escapeHtml(date)}</span>
              </div>
              <div class="field">
                <span class="field-label">Time:</span>
                <span class="field-value">${escapeHtml(time)}</span>
              </div>
            </div>
            
            <div class="full-width-field">
              <span class="field-label">Total Time Out and Back:</span>
              <span class="field-value">${escapeHtml(checkIn.totalTime || duration)} Hours</span>
            </div>
          </div>
        ` : ''}
        
        <div class="section">
          <div class="full-width-field">
            <span class="field-label">Company of Origin:</span>
            <span class="field-value">${escapeHtml(checkIn.companyName)}</span>
          </div>
          
          <div class="full-width-field">
            <span class="field-label">Address:</span>
            <span class="field-value">${escapeHtml(checkIn.address)}</span>
          </div>
          
          <div class="field-row">
            <div class="field">
              <span class="field-label">Contact Person:</span>
              <span class="field-value">${escapeHtml(checkIn.contactPerson)}</span>
            </div>
          </div>
          
          <div class="field-row">
            <div class="field">
              <span class="field-label">EMAIL:</span>
              <span class="field-value">${escapeHtml(checkIn.email)}</span>
            </div>
            <div class="field">
              <span class="field-label">PHONE:</span>
              <span class="field-value">${escapeHtml(checkIn.phone)}</span>
            </div>
          </div>
        </div>
        
        <div class="section">
          <div class="section-title">Material Received:</div>
          
          ${config.showCategories && checkIn.categories.length > 0 ? `
            <div>
              <div class="materials-title">Total Quantity for Certificate of Destruction by Category:</div>
              <div class="materials-subtitle">(e.g # of Laptops, # of PCs, etc.)</div>
              
              <table class="table">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th style="width: 100px;">Quantity</th>
                  </tr>
                </thead>
                <tbody>
                  ${checkIn.categories.map(item => `
                    <tr>
                      <td>${escapeHtml(item.category)}</td>
                      <td>${escapeHtml(item.quantity)}</td>
                    </tr>
                  `).join('')}
                  <tr class="table-total">
                    <td>TOTAL</td>
                    <td>${totalCategoryQuantity}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          ` : ''}
          
          ${config.showValueScrap && checkIn.valueScrap.length > 0 ? `
            <div class="materials-section">
              <div class="materials-title">Value Scrap Received:</div>
              ${checkIn.valueScrap.map(item => `
                <div class="material-item">
                  <span class="material-name">${escapeHtml(item.materialName)}</span>
                  <span class="material-quantity">${escapeHtml(item.quantity)} ${escapeHtml(item.measurement)}</span>
                </div>
              `).join('')}
            </div>
          ` : ''}
          
          ${config.showChargeMaterials && checkIn.chargeMaterials.length > 0 ? `
            <div class="materials-section">
              <div class="materials-title">Charge Materials Received:</div>
              ${checkIn.chargeMaterials.map(item => `
                <div class="material-item">
                  <span class="material-name">${escapeHtml(item.materialName)}</span>
                  <span class="material-quantity">${escapeHtml(item.quantity)} ${escapeHtml(item.measurement)}</span>
                </div>
              `).join('')}
            </div>
          ` : ''}
        </div>
        
        ${config.showNotes && (checkIn.suspectedValueNote || checkIn.otherNotes) ? `
          <div class="section">
            ${checkIn.suspectedValueNote ? `
              <div>
                <div class="note-title">Suspected Value:</div>
                <div class="note-box">
                  <div class="note-content">${escapeHtml(checkIn.suspectedValueNote)}</div>
                </div>
              </div>
            ` : ''}
            
            ${checkIn.otherNotes ? `
              <div style="margin-top: ${checkIn.suspectedValueNote ? '10px' : '0'};">
                <div class="note-title">Other Notes / Damages / Customer Requests:</div>
                <div class="note-box">
                  <div class="note-content">${escapeHtml(checkIn.otherNotes)}</div>
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
            font-size: 11px;
            padding: 20px;
            line-height: 1.3;
          }
          
          .header {
            text-align: center;
            margin-bottom: 15px;
            border-bottom: 2px solid #000;
            padding-bottom: 8px;
          }
          
          .header h1 {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 3px;
          }
          
          .section {
            margin-bottom: 12px;
          }
          
          .section-title {
            font-weight: bold;
            font-size: 12px;
            margin-bottom: 8px;
            text-decoration: underline;
          }
          
          .subsection-title {
            font-weight: bold;
            font-size: 11px;
            margin-top: 12px;
            margin-bottom: 6px;
          }
          
          .table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 6px;
            margin-bottom: 10px;
          }
          
          .table th,
          .table td {
            border: 1px solid #000;
            padding: 4px 6px;
            text-align: left;
          }
          
          .table th {
            background-color: #f0f0f0;
            font-weight: bold;
            font-size: 11px;
          }
          
          .table td {
            font-size: 10px;
          }
          
          .empty-message {
            padding: 15px;
            text-align: center;
            color: #999;
            font-style: italic;
            font-size: 10px;
          }
          
          .note {
            font-style: italic;
            font-size: 10px;
            color: #666;
            margin-bottom: 8px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>i-Series / Ryzen PCs and Laptops Breakdown</h1>
        </div>
        
        <div class="section">
          <div class="section-title">Material Received:</div>
          <div class="note">ANY I-SERIES OR RYZEN PCs OR LAPTOPS NEED TO BE ADDED HERE</div>
          
          ${hasISeriesData ? `
            ${checkIn.iSeriesPcs && checkIn.iSeriesPcs.length > 0 ? `
              <div class="subsection-title">PCs:</div>
              <table class="table">
                <thead>
                  <tr>
                    <th>Processor Series</th>
                    <th>Generation</th>
                    <th style="width: 100px;">Quantity</th>
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
              <table class="table">
                <thead>
                  <tr>
                    <th>Processor Series</th>
                    <th>Generation</th>
                    <th style="width: 100px;">Quantity</th>
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
