import { FileExtension } from '@core/enums/file-extension.enum';

export const FileExtensions: FileExtension[] = Object.values(FileExtension);
export const FileExtensionsString: string = FileExtensions.join()
