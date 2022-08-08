import { Attachment } from '@shared/components/attachments';
import { AttachmentsListConfig } from '@shared/components/attachments/models/attachments-list-config.interface';

export interface AttachmentsListParams {
  attachments: Attachment[];
  attachmentsListConfig: AttachmentsListConfig | null;
}
