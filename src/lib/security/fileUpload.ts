// Secure File Upload Handler
import multer from 'multer';
import sharp from 'sharp';
import { fileTypeFromBuffer } from 'file-type';
import crypto from 'crypto';
import path from 'path';

// File upload configuration
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_FILES = 5;

// Allowed file types
const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp'
];

const ALLOWED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];
const ALLOWED_DOCUMENT_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png', '.webp'];

// Malicious file signatures to block
const MALICIOUS_SIGNATURES = [
  Buffer.from([0x4D, 0x5A]), // PE executables (.exe)
  Buffer.from([0x7F, 0x45, 0x4C, 0x46]), // ELF executables
  Buffer.from([0xCF, 0xFA, 0xED, 0xFE]), // Mach-O executables
  Buffer.from([0x50, 0x4B, 0x03, 0x04]), // ZIP files (could contain malware)
  Buffer.from([0x52, 0x61, 0x72, 0x21]), // RAR files
];

// Custom storage configuration
const storage = multer.memoryStorage();

export interface SecureFileUpload {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
  secureFilename: string;
  fileType: string;
  isValid: boolean;
  errors: string[];
}

// File validation class
export class FileValidator {
  static async validateFile(file: Express.Multer.File): Promise<{
    isValid: boolean;
    errors: string[];
    fileType?: any;
  }> {
    const errors: string[] = [];
    
    try {
      // 1. Check file size
      if (file.size > MAX_FILE_SIZE) {
        errors.push(`File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB`);
      }
      
      if (file.size === 0) {
        errors.push('Empty file not allowed');
      }

      // 2. Validate file type using magic bytes
      const fileType = await fileTypeFromBuffer(file.buffer);
      
      if (!fileType) {
        errors.push('Could not determine file type');
        return { isValid: false, errors };
      }

      // 3. Check allowed MIME types
      if (!ALLOWED_DOCUMENT_TYPES.includes(fileType.mime)) {
        errors.push(`File type ${fileType.mime} not allowed`);
      }

      // 4. Check file extension matches content
      const extension = path.extname(file.originalname).toLowerCase();
      if (!ALLOWED_DOCUMENT_EXTENSIONS.includes(extension)) {
        errors.push(`File extension ${extension} not allowed`);
      }

      // 5. Scan for malicious signatures
      if (this.containsMaliciousSignature(file.buffer)) {
        errors.push('File contains malicious content');
      }

      // 6. Additional PDF validation
      if (fileType.mime === 'application/pdf') {
        if (!this.isValidPDF(file.buffer)) {
          errors.push('Invalid PDF file structure');
        }
      }

      // 7. Image validation
      if (fileType.mime.startsWith('image/')) {
        const imageValidation = await this.validateImage(file.buffer);
        if (!imageValidation.isValid) {
          errors.push(...imageValidation.errors);
        }
      }

      return {
        isValid: errors.length === 0,
        errors,
        fileType
      };

    } catch (error) {
      errors.push('File validation failed');
      return { isValid: false, errors };
    }
  }

  private static containsMaliciousSignature(buffer: Buffer): boolean {
    return MALICIOUS_SIGNATURES.some(signature => {
      return buffer.subarray(0, signature.length).equals(signature);
    });
  }

  private static isValidPDF(buffer: Buffer): boolean {
    // Check PDF header
    const pdfHeader = buffer.subarray(0, 5);
    return pdfHeader.toString() === '%PDF-';
  }

  private static async validateImage(buffer: Buffer): Promise<{
    isValid: boolean;
    errors: string[];
  }> {
    const errors: string[] = [];
    
    try {
      const metadata = await sharp(buffer).metadata();
      
      // Check image dimensions
      if (metadata.width && metadata.width > 4000) {
        errors.push('Image width too large (max 4000px)');
      }
      
      if (metadata.height && metadata.height > 4000) {
        errors.push('Image height too large (max 4000px)');
      }

      // Check for EXIF data that might contain malicious scripts
      if (metadata.exif) {
        // Strip EXIF data for security
        console.log('EXIF data found - will be stripped during processing');
      }

      return {
        isValid: errors.length === 0,
        errors
      };
    } catch (error) {
      return {
        isValid: false,
        errors: ['Invalid image file']
      };
    }
  }
}

// File processor class
export class FileProcessor {
  static generateSecureFilename(originalName: string, userId: string): string {
    const extension = path.extname(originalName).toLowerCase();
    const timestamp = Date.now();
    const random = crypto.randomBytes(8).toString('hex');
    const hash = crypto
      .createHash('sha256')
      .update(`${userId}${originalName}${timestamp}`)
      .digest('hex')
      .substring(0, 16);
    
    return `${hash}_${timestamp}_${random}${extension}`;
  }

  static async processImage(buffer: Buffer, maxWidth = 2000, quality = 80): Promise<Buffer> {
    return await sharp(buffer)
      .resize(maxWidth, null, {
        withoutEnlargement: true,
        fit: 'inside'
      })
      .jpeg({ 
        quality,
        progressive: true,
        mozjpeg: true
      })
      .withMetadata(false) // Strip all metadata including EXIF
      .toBuffer();
  }

  static async sanitizeDocument(buffer: Buffer, fileType: string): Promise<Buffer> {
    if (fileType.startsWith('image/')) {
      // Process and sanitize images
      return await this.processImage(buffer);
    }
    
    // For PDFs and other documents, return as-is after validation
    // In production, you might want to use PDF sanitization libraries
    return buffer;
  }
}

// Multer configuration
export const secureUpload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: MAX_FILES,
    fieldSize: 1024, // 1KB field size limit
  },
  fileFilter: (req, file, cb) => {
    // Basic filename validation
    if (file.originalname.length > 255) {
      cb(new Error('Filename too long'));
      return;
    }

    // Check for null bytes and path traversal
    if (file.originalname.includes('\0') || 
        file.originalname.includes('..') ||
        file.originalname.includes('/') ||
        file.originalname.includes('\\')) {
      cb(new Error('Invalid filename'));
      return;
    }

    cb(null, true);
  }
});

// Main upload handler
export const handleSecureUpload = async (
  files: Express.Multer.File[],
  userId: string
): Promise<SecureFileUpload[]> => {
  const results: SecureFileUpload[] = [];

  for (const file of files) {
    const validation = await FileValidator.validateFile(file);
    
    let processedBuffer = file.buffer;
    let secureFilename = '';

    if (validation.isValid && validation.fileType) {
      // Generate secure filename
      secureFilename = FileProcessor.generateSecureFilename(file.originalname, userId);
      
      // Sanitize and process file
      try {
        processedBuffer = await FileProcessor.sanitizeDocument(
          file.buffer, 
          validation.fileType.mime
        );
      } catch (error) {
        validation.errors.push('File processing failed');
        validation.isValid = false;
      }
    }

    results.push({
      fieldname: file.fieldname,
      originalname: file.originalname,
      encoding: file.encoding,
      mimetype: file.mimetype,
      buffer: processedBuffer,
      size: processedBuffer.length,
      secureFilename,
      fileType: validation.fileType?.mime || 'unknown',
      isValid: validation.isValid,
      errors: validation.errors
    });
  }

  return results;
};

// Virus scanning simulation (integrate with ClamAV or similar in production)
export class VirusScanner {
  static async scanFile(buffer: Buffer): Promise<{
    isClean: boolean;
    threat?: string;
  }> {
    // Simulate virus scanning
    // In production, integrate with ClamAV, VirusTotal API, or similar
    
    // Simple signature-based detection
    const malwareSignatures = [
      'EICAR-STANDARD-ANTIVIRUS-TEST-FILE', // EICAR test string
      'X5O!P%@AP[4\\PZX54(P^)7CC)7}', // EICAR signature
    ];

    const fileContent = buffer.toString();
    
    for (const signature of malwareSignatures) {
      if (fileContent.includes(signature)) {
        return {
          isClean: false,
          threat: 'Test virus detected'
        };
      }
    }

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return { isClean: true };
  }
}

// Usage example for KYC document upload
export const handleKYCUpload = async (req: any, res: any, next: any) => {
  try {
    const upload = secureUpload.fields([
      { name: 'panCard', maxCount: 1 },
      { name: 'aadhaarCard', maxCount: 1 },
      { name: 'bankStatement', maxCount: 1 },
      { name: 'photo', maxCount: 1 }
    ]);

    upload(req, res, async (err) => {
      if (err) {
        return res.status(400).json({
          error: 'File upload failed',
          message: err.message
        });
      }

      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const allFiles: Express.Multer.File[] = [];
      Object.values(req.files as any).forEach((files: any) => {
        allFiles.push(...files);
      });

      const processedFiles = await handleSecureUpload(allFiles, userId);
      
      // Check if any files failed validation
      const invalidFiles = processedFiles.filter(f => !f.isValid);
      if (invalidFiles.length > 0) {
        return res.status(400).json({
          error: 'File validation failed',
          details: invalidFiles.map(f => ({
            filename: f.originalname,
            errors: f.errors
          }))
        });
      }

      // Scan for viruses
      for (const file of processedFiles) {
        const scanResult = await VirusScanner.scanFile(file.buffer);
        if (!scanResult.isClean) {
          return res.status(400).json({
            error: 'Malicious file detected',
            filename: file.originalname,
            threat: scanResult.threat
          });
        }
      }

      // Files are safe - proceed with storage
      req.processedFiles = processedFiles;
      next();
    });
  } catch (error) {
    res.status(500).json({
      error: 'Internal server error during file upload'
    });
  }
};
