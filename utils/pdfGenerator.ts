
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
  return filename.replace(/[^a-z0-9\s\-_]/gi, '').replace(/\s+/g, ' ').trim();
};

/**
 * Generate filename based on company name and date
 * Format: "Company Name Check-In Sheet Date.pdf"
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
    return `${hours}.${minutes} Hours`;
  } catch (error) {
    console.error('Error calculating duration:', error);
    return '';
  }
};

/**
 * Read the HTML template from the templates folder
 */
const readHTMLTemplate = async (): Promise<string> => {
  try {
    // Try to read from the file system first
    const templatePath = `${FileSystem.documentDirectory}../templates/checkin-template.html`;
    const fileInfo = await FileSystem.getInfoAsync(templatePath);
    
    if (fileInfo.exists) {
      const content = await FileSystem.readAsStringAsync(templatePath);
      return content;
    }
    
    // If not found, return the default template
    console.log('Template file not found, using default template');
    return getDefaultTemplate();
  } catch (error) {
    console.error('Error reading HTML template:', error);
    return getDefaultTemplate();
  }
};

/**
 * Get the default HTML template (fallback)
 */
const getDefaultTemplate = (): string => {
  return `<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
<html>
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
  <meta http-equiv="Content-Style-Type" content="text/css">
  <title></title>
  <meta name="Generator" content="Cocoa HTML Writer">
  <meta name="CocoaVersion" content="2575.7">
  <style type="text/css">
    p.p1 {margin: 0.0px 0.0px 0.0px 0.0px; text-align: center; font: 21.3px Helvetica; -webkit-text-stroke: #000000}
    p.p2 {margin: 0.0px 0.0px 0.0px 0.0px; text-align: center; font: 16.0px Helvetica; -webkit-text-stroke: #000000}
    p.p3 {margin: 0.0px 0.0px 0.0px 0.0px; text-align: center; font: 16.0px Helvetica; -webkit-text-stroke: #000000; min-height: 19.0px}
    p.p4 {margin: 0.0px 0.0px 0.0px 0.0px; font: 16.0px Helvetica; -webkit-text-stroke: #000000}
    p.p5 {margin: 0.0px 0.0px 0.0px 0.0px; font: 16.0px Helvetica; -webkit-text-stroke: #000000; min-height: 19.0px}
    p.p6 {margin: 0.0px 0.0px 0.0px 0.0px; text-align: justify; font: 16.0px Helvetica; -webkit-text-stroke: #000000}
    p.p7 {margin: 0.0px 0.0px 0.0px 0.0px; text-align: justify; font: 16.0px Helvetica; -webkit-text-stroke: #000000; min-height: 19.0px}
    p.p8 {margin: 0.0px 0.0px 0.0px 0.0px; text-align: justify; font: 21.3px Helvetica; -webkit-text-stroke: #000000}
    span.s1 {font-kerning: none}
    span.Apple-tab-span {white-space:pre}
  </style>
</head>
<body>
<p class="p1"><span class="s1"><b>Circuitry Solutions Warehouse Receiving Receipt</b><b></b></span></p>
<p class="p2"><span class="s1"> </span></p>
<p class="p2"><span class="s1">Name_____________________        <span class="Apple-converted-space">  </span>Date _________          Time________ <span class="Apple-converted-space">          </span>Total Time Out and Back ______________Hours</span></p>
<p class="p2"><span class="s1"> </span></p>
<p class="p2"><span class="s1">Company of Origin: ________________________________________________________</span></p>
<p class="p3"><span class="s1"></span><br></p>
<p class="p2"><span class="s1">Address: _________________________________________________________________</span></p>
<p class="p3"><span class="s1"></span><br></p>
<p class="p2"><span class="s1">Contact Person: _____________________     EMAIL: ______________________________</span></p>
<p class="p3"><span class="s1"></span><br></p>
<p class="p2"><span class="s1">                                                                       <span class="Apple-converted-space">    </span>PHONE: ______________________________</span></p>
<p class="p4"><span class="s1"><b>Material Received:</b></span></p>
<p class="p5"><span class="s1"></span><br></p>
<p class="p4"><span class="s1"> </span></p>
<p class="p4"><span class="s1">Total Quantity for Certificate of Destruction by Category: (e.g # of Laptops, # of PCs, etc.)<span class="Apple-converted-space"> </span></span></p>
<p class="p3"><span class="s1"></span><br></p>
<p class="p2"><span class="s1">_____________________________________________________________________________________________________________________________________________</span></p>
<p class="p3"><span class="s1"></span><br></p>
<p class="p3"><span class="s1"></span><br></p>
<p class="p1"><span class="s1"><b>Value Scrap</b><b></b></span></p>
<p class="p4"><span class="s1"> <span class="Apple-tab-span">	</span><span class="Apple-tab-span">	</span><span class="Apple-tab-span">	</span><span class="Apple-tab-span">	</span></span></p>
<p class="p4"><span class="s1"> </span></p>
<p class="p4"><span class="s1">Example Entry: _________ Lbs.</span></p>
<p class="p5"><span class="s1"><span class="Apple-tab-span">	</span></span></p>
<p class="p4"><span class="s1">Example Entry: ______________ Pcs.</span></p>
<p class="p5"><span class="s1"></span><br></p>
<p class="p4"><span class="s1">Example Entry: _________ Lbs.</span></p>
<p class="p4"><span class="s1"> </span></p>
<p class="p4"><span class="s1">Example Entry: ____________ Lbs.</span></p>
<p class="p5"><span class="s1"></span><br></p>
<p class="p6"><span class="s1">Example Entry: ______________ Pcs.</span></p>
<p class="p7"><span class="s1"></span><br></p>
<p class="p6"><span class="s1">Example Entry: _______ Lbs.</span></p>
<p class="p8"><span class="s1"><b> </b><b></b></span></p>
<p class="p1"><span class="s1"><b> </b><b></b></span></p>
<p class="p1"><span class="s1"><b>i-Series PCs and Laptops</b><b></b></span></p>
<p class="p2"><span class="s1"> </span></p>
<p class="p4"><span class="s1"><b>Material Received:</b></span></p>
<p class="p5"><span class="s1"></span><br></p>
<p class="p4"><span class="s1"> </span></p>
<p class="p4"><span class="s1">Example Entry: _________ Pcs.</span></p>
<p class="p5"><span class="s1"></span><br></p>
<p class="p4"><span class="s1">Example Entry: _________ Pcs.</span></p>
<p class="p5"><span class="s1"></span><br></p>
<p class="p4"><span class="s1">Example Entry: _________ Pcs.</span></p>
<p class="p4"><span class="s1"><b> </b><b></b></span></p>
<p class="p4"><span class="s1"> </span></p>
</body>
</html>`;
};

/**
 * Format categories in a natural way (e.g., "20 PCs, 71 Tablets")
 */
const formatCategoriesNaturally = (categories: Array<{ category: string; quantity: string }>): string => {
  if (!categories || categories.length === 0) return '';
  
  return categories.map(item => {
    const quantity = escapeHtml(item.quantity);
    const category = escapeHtml(item.category);
    return `${quantity} ${category}`;
  }).join(', ');
};

/**
 * Generate HTML from template by replacing placeholders with actual data
 * This maintains the exact spacing and layout of the original template
 */
const generateHTMLFromTemplate = async (
  checkIn: CheckInFormData,
  config: PDFTemplateConfig
): Promise<string> => {
  try {
    // Read the HTML template
    let html = await readHTMLTemplate();
    
    console.log('Starting HTML generation for:', checkIn.companyName);
    
    // Format date and time
    const { date, time } = formatDateTime(checkIn.startedAt);
    const duration = calculateDuration(checkIn.startedAt, checkIn.finishedAt);
    
    // Replace basic info line - preserve exact spacing from template
    const nameValue = escapeHtml(checkIn.employeeName) || '';
    const dateValue = escapeHtml(date) || '';
    const timeValue = escapeHtml(time) || '';
    const totalTimeValue = escapeHtml(checkIn.totalTime || duration) || '';
    
    // Build the info line with proper spacing matching the template structure
    const infoLine = `Name ${nameValue}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;        <span class="Apple-converted-space">  </span>Date ${dateValue}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;          Time ${timeValue} <span class="Apple-converted-space">          </span>Total Time Out and Back ${totalTimeValue}`;
    
    html = html.replace(
      /Name_____________________\s+<span class="Apple-converted-space">\s+<\/span>Date _________\s+Time________\s+<span class="Apple-converted-space">\s+<\/span>Total Time Out and Back ______________Hours/,
      infoLine
    );
    
    // Replace company info - PRESERVE the empty <p> tags for double spacing
    html = html.replace(
      /Company of Origin: ________________________________________________________/,
      `Company of Origin: ${escapeHtml(checkIn.companyName)}`
    );
    
    // Replace address - keep the <p class="p3"> empty line before it
    html = html.replace(
      /Address: _________________________________________________________________/,
      `Address: ${escapeHtml(checkIn.address)}`
    );
    
    // Replace contact person and email - keep the <p class="p3"> empty line before it
    html = html.replace(
      /Contact Person: _____________________\s+EMAIL: ______________________________/,
      `Contact Person: ${escapeHtml(checkIn.contactPerson)}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;EMAIL: ${escapeHtml(checkIn.email)}`
    );
    
    // Replace phone - keep the <p class="p3"> empty line before it
    html = html.replace(
      /<span class="Apple-converted-space">\s+<\/span>PHONE: ______________________________/,
      `<span class="Apple-converted-space">    </span>PHONE: ${escapeHtml(checkIn.phone)}`
    );
    
    // Replace categories section - preserve the empty lines and formatting
    if (checkIn.categories && checkIn.categories.length > 0) {
      const categoriesText = formatCategoriesNaturally(checkIn.categories);
      
      // Replace the underline with the categories text, keeping it centered and bold
      html = html.replace(
        /_____________________________________________________________________________________________________________________________________________/,
        `<b>${categoriesText}</b>`
      );
    }
    
    // Replace Value Scrap section - preserve spacing structure
    console.log('Processing Value Scrap section, items:', checkIn.valueScrap?.length || 0);
    
    if (checkIn.valueScrap && checkIn.valueScrap.length > 0) {
      // Build the new Value Scrap entries HTML with proper spacing
      let valueScrapEntriesHTML = '';
      
      checkIn.valueScrap.forEach((item, index) => {
        console.log(`Value Scrap item ${index}:`, item.materialName, item.quantity, item.measurement);
        
        // Create entry matching the template format
        const entryText = `${escapeHtml(item.materialName)}: ${escapeHtml(item.quantity)}&nbsp;${escapeHtml(item.measurement)}.`;
        
        valueScrapEntriesHTML += `<p class="p4"><span class="s1">${entryText}</span></p>\n`;
        
        // Add empty line between entries (p5 class with min-height for spacing)
        if (index < checkIn.valueScrap.length - 1) {
          valueScrapEntriesHTML += '<p class="p5"><span class="s1"></span><br></p>\n';
        }
      });
      
      console.log('Generated Value Scrap HTML length:', valueScrapEntriesHTML.length);
      
      // Find and replace the example entries in the Value Scrap section
      // Match from first "Example Entry" to the empty bold line before i-Series
      const valueScrapPattern = /<p class="p4"><span class="s1">Example Entry: _________ Lbs\.<\/span><\/p>[\s\S]*?<p class="p8"><span class="s1"><b> <\/b><b><\/b><\/span><\/p>/;
      
      if (valueScrapPattern.test(html)) {
        console.log('Found Value Scrap section, replacing...');
        html = html.replace(valueScrapPattern, valueScrapEntriesHTML + '<p class="p8"><span class="s1"><b> </b><b></b></span></p>');
        console.log('Replaced Value Scrap section');
      } else {
        console.log('Could not find Value Scrap section pattern');
      }
    }
    
    // Replace i-Series section - preserve spacing structure
    console.log('Processing i-Series section');
    console.log('i-Series PCs:', checkIn.iSeriesPcs?.length || 0);
    console.log('i-Series Laptops:', checkIn.iSeriesLaptops?.length || 0);
    
    if ((checkIn.iSeriesPcs && checkIn.iSeriesPcs.length > 0) || 
        (checkIn.iSeriesLaptops && checkIn.iSeriesLaptops.length > 0)) {
      
      // Build the new i-Series entries HTML with proper spacing
      let iSeriesEntriesHTML = '';
      
      // Add PCs
      if (checkIn.iSeriesPcs && checkIn.iSeriesPcs.length > 0) {
        checkIn.iSeriesPcs.forEach((item, index) => {
          console.log(`i-Series PC ${index}:`, item.processorSeries, item.processorGeneration, item.quantity);
          
          const entryText = `${escapeHtml(item.processorSeries)} ${escapeHtml(item.processorGeneration)}: ${escapeHtml(item.quantity)}&nbsp;Pcs.`;
          
          iSeriesEntriesHTML += `<p class="p4"><span class="s1">${entryText}</span></p>\n`;
          
          // Add empty line between entries (p5 class with min-height for spacing)
          if (index < checkIn.iSeriesPcs.length - 1) {
            iSeriesEntriesHTML += '<p class="p5"><span class="s1"></span><br></p>\n';
          }
        });
      }
      
      // Add spacing between PCs and Laptops if both exist
      if (checkIn.iSeriesPcs && checkIn.iSeriesPcs.length > 0 && 
          checkIn.iSeriesLaptops && checkIn.iSeriesLaptops.length > 0) {
        iSeriesEntriesHTML += '<p class="p5"><span class="s1"></span><br></p>\n';
      }
      
      // Add Laptops
      if (checkIn.iSeriesLaptops && checkIn.iSeriesLaptops.length > 0) {
        checkIn.iSeriesLaptops.forEach((item, index) => {
          console.log(`i-Series Laptop ${index}:`, item.processorSeries, item.processorGeneration, item.quantity);
          
          const entryText = `${escapeHtml(item.processorSeries)} ${escapeHtml(item.processorGeneration)}: ${escapeHtml(item.quantity)}&nbsp;Pcs.`;
          
          iSeriesEntriesHTML += `<p class="p4"><span class="s1">${entryText}</span></p>\n`;
          
          // Add empty line between entries (except after the last one)
          if (index < checkIn.iSeriesLaptops.length - 1) {
            iSeriesEntriesHTML += '<p class="p5"><span class="s1"></span><br></p>\n';
          }
        });
      }
      
      console.log('Generated i-Series HTML length:', iSeriesEntriesHTML.length);
      
      // Find and replace the example entries in the i-Series section
      // Match from first "Example Entry" after "Material Received:" to the final empty lines
      const iSeriesPattern = /<p class="p4"><span class="s1">Example Entry: _________ Pcs\.<\/span><\/p>\s*<p class="p5"><span class="s1"><\/span><br><\/p>\s*<p class="p4"><span class="s1">Example Entry: _________ Pcs\.<\/span><\/p>\s*<p class="p5"><span class="s1"><\/span><br><\/p>\s*<p class="p4"><span class="s1">Example Entry: _________ Pcs\.<\/span><\/p>/;
      
      if (iSeriesPattern.test(html)) {
        console.log('Found i-Series section, replacing...');
        html = html.replace(iSeriesPattern, iSeriesEntriesHTML.trim());
        console.log('Replaced i-Series section');
      } else {
        console.log('Could not find i-Series section pattern');
      }
    }
    
    console.log('HTML generation complete');
    return html;
  } catch (error) {
    console.error('Error generating HTML from template:', error);
    throw error;
  }
};

/**
 * Generate a complete PDF using the HTML template
 */
export const generateCheckInPDF = async (
  checkIn: CheckInFormData,
  config: Partial<PDFTemplateConfig> = {}
): Promise<void> => {
  try {
    const finalConfig = { ...DEFAULT_CONFIG, ...config };
    
    console.log('Generating PDF for check-in:', checkIn.companyName);
    
    // Generate HTML from template
    const html = await generateHTMLFromTemplate(checkIn, finalConfig);
    
    console.log('Generated HTML length:', html.length);
    
    // Generate PDF with error handling
    console.log('Calling Print.printToFileAsync...');
    const { uri } = await Print.printToFileAsync({
      html: html,
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
        
        // Generate HTML from template
        const html = await generateHTMLFromTemplate(checkIn, finalConfig);
        
        // Generate PDF
        console.log(`Calling Print.printToFileAsync for check-in ${i + 1}...`);
        const { uri } = await Print.printToFileAsync({
          html: html,
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
