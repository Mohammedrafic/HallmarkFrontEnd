import { Attachment } from '@shared/components/attachments';

type AttachmentAction = (item: Attachment) => void;

export interface AttachmentsListConfig {
  preview?: AttachmentAction;
  download?: AttachmentAction;
  delete?: AttachmentAction;
}
