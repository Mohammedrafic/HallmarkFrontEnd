import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { Attachment, AttachmentsListConfig, AttachmentsListParams } from '@shared/components/attachments';

@Component({
  selector: 'app-attachments-list',
  templateUrl: './attachments-list.component.html',
  styleUrls: ['./attachments-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AttachmentsListComponent implements AttachmentsListParams {
  @Input()
  public attachments: Attachment[] = [];

  @Input()
  public attachmentsListConfig: AttachmentsListConfig | null;

  @Input()
  public deleteIconColor: '#FF5858' | 'initial' = 'initial';

  @Input()
  public disableDelete = false;

  public agInit(params: AttachmentsListParams): void {
    this.attachments = params.attachments;
    this.attachmentsListConfig = params.attachmentsListConfig;
  }

  public refresh(params: AttachmentsListParams): boolean {
    this.agInit(params);

    return true;
  }

  public trackById(_: number, item: Attachment): number {
    return item.id;
  }

  public preview(attachment: Attachment): void {
    this.attachmentsListConfig?.preview?.(attachment);
  }

  public download(attachment: Attachment): void {
    this.attachmentsListConfig?.download?.(attachment);
  }
}
