import { Module } from '@nestjs/common';
import { FilesController } from './files.controller';
import { UserFilesController } from './user-files.controller';

@Module({
  controllers: [FilesController, UserFilesController],
})
export class FilesModule {}
