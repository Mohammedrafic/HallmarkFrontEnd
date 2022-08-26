import { Attachment } from '@shared/components/attachments';
import { InvoiceAttachmentFileType } from '../enums';

export interface InvoiceAttachment extends Attachment {
  fileType: InvoiceAttachmentFileType;
}
