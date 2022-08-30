import { Attachment } from '@shared/components/attachments';

export type AttachmentAction<T extends Attachment = Attachment> = (item: T) => void;

export interface AttachmentsListConfig<T extends Attachment = Attachment> {
  preview?: AttachmentAction<T>;
  download?: AttachmentAction<T>;
  delete?: AttachmentAction<T>;
}
