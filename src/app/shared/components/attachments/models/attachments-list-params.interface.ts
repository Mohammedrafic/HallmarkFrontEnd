import { Attachment } from '@shared/components/attachments';
import { AttachmentsListConfig } from '@shared/components/attachments/models/attachments-list-config.interface';

export interface AttachmentsListParams<T extends Attachment = Attachment> {
  attachments: T[];
  attachmentsListConfig: AttachmentsListConfig<T> | null;
}
