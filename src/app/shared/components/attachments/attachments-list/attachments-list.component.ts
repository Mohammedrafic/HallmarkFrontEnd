import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { Attachment, AttachmentsListConfig, AttachmentsListParams } from '@shared/components/attachments';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-attachments-list',
  templateUrl: './attachments-list.component.html',
  styleUrls: ['./attachments-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AttachmentsListComponent implements AttachmentsListParams, OnInit {
  @Input()
  public attachments: Attachment[] = [];

  @Input()
  public attachmentsListConfig: AttachmentsListConfig | null;

  @Input()
  public deleteIconColor: '#FF5858' | 'initial' = 'initial';

  @Input()
  public disableDelete = false;
  @Input()
  public openTheAttachment$?:Subject<number> = new Subject<number>();

  @Output() 
   previewAttachmentEvent = new EventEmitter<number>();

  public agInit(params: AttachmentsListParams): void {
    this.attachments = params.attachments;
    this.attachmentsListConfig = params.attachmentsListConfig;
  }
  
  public ngOnInit(): void {
    this.openTheAttachment$?.subscribe((index)=>{
      if(index != null && index != undefined){
        this.attachmentsListConfig?.preview?.(this.attachments[index]);
      }      
    })
  }

  public refresh(params: AttachmentsListParams): boolean {
    this.agInit(params);

    return true;
  }

  public trackById(_: number, item: Attachment): number {
    return item.id;
  }

  public preview(attachment: Attachment,index:number): void {
    this.previewAttachmentEvent.emit(index);
    this.attachmentsListConfig?.preview?.(attachment);
  }

  public download(attachment: Attachment): void {
    this.attachmentsListConfig?.download?.(attachment);
  }
}
