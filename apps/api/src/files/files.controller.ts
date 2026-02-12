import {
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { randomUUID } from 'crypto';
import { AdminGuard } from '../auth/guards/admin.guard';

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];
const DOC_EXTENSIONS = ['.pdf', '.doc', '.docx', '.hwp'];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_DOC_SIZE = 10 * 1024 * 1024; // 10MB

@Controller('files')
@UseGuards(AdminGuard)
export class FilesController {
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: join(process.cwd(), 'uploads'),
        filename: (_req, file, cb) => {
          const ext = extname(file.originalname).toLowerCase();
          cb(null, `${randomUUID()}${ext}`);
        },
      }),
      limits: { fileSize: MAX_DOC_SIZE },
      fileFilter: (_req, file, cb) => {
        const ext = extname(file.originalname).toLowerCase();
        const allAllowed = [...IMAGE_EXTENSIONS, ...DOC_EXTENSIONS];
        if (!allAllowed.includes(ext)) {
          cb(
            new BadRequestException(
              `Unsupported file type: ${ext}. Allowed: ${allAllowed.join(', ')}`,
            ),
            false,
          );
          return;
        }
        cb(null, true);
      },
    }),
  )
  upload(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const ext = extname(file.originalname).toLowerCase();
    const isImage = IMAGE_EXTENSIONS.includes(ext);

    if (isImage && file.size > MAX_IMAGE_SIZE) {
      throw new BadRequestException('Image files must be under 5MB');
    }

    const url = `/uploads/${file.filename}`;
    return { url, filename: file.originalname, size: file.size };
  }
}
