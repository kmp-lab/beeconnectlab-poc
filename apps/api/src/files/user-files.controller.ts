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
import { UserGuard } from '../auth/guards/user.guard';

const DOC_EXTENSIONS = ['.pdf', '.doc', '.docx', '.hwp'];
const MAX_DOC_SIZE = 10 * 1024 * 1024; // 10MB

@Controller('user-files')
@UseGuards(UserGuard)
export class UserFilesController {
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
        if (!DOC_EXTENSIONS.includes(ext)) {
          cb(
            new BadRequestException(
              `Unsupported file type: ${ext}. Allowed: ${DOC_EXTENSIONS.join(', ')}`,
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

    const url = `/uploads/${file.filename}`;
    return { url, filename: file.originalname, size: file.size };
  }
}
