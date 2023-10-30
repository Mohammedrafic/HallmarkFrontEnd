import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';

import { DialogComponent,PositionDataModel } from '@syncfusion/ej2-angular-popups';
import { Actions, ofActionDispatched } from '@ngxs/store';

import { ShowBulkSkillActionDialog } from '../../../store/app.actions';
import { DestroyableDirective } from '@shared/directives/destroyable.directive';
import { takeUntil } from 'rxjs';

@Component({
  selector: 'app-bulkskill-action-side-dialog',
  templateUrl: './bulk-skill-action-dialog.component.html',
  styleUrls: ['./bulk-skill-action-dialog.component.scss'],
})
export class BulkSkillActionDialogComponent extends DestroyableDirective implements OnInit {
  @ViewChild('bulkskillactiondialog') sideDialog: DialogComponent;
  targetElement: HTMLElement = document.body;
  public bulkactionmessage1:string='';
  public bulkactionmessage2:string='';
  public bulkactionmessage3:string='';
  

  @Input() message: string;
  @Input() bulkAction: Number;
  @Input() skillNames: string[];
  @Input() width = '340px';



  constructor(private action$: Actions) {
    super();
  }

  ngOnInit(): void {
    this.subscribeOnBulkSkillActionDialog();
  }

  private subscribeOnBulkSkillActionDialog(): void {
    this.action$
      .pipe(
        ofActionDispatched(ShowBulkSkillActionDialog),
        takeUntil(this.destroy$)
      ).subscribe(payload => {
        if (payload.isDialogShown) {
          this.sideDialog.show();
          this.bulkactionmessage1=this.bulkAction===0?'Following Skills Cannot be Updated': this.message;
          this.bulkactionmessage2=this.bulkAction===0? `They have ${this.message}` : 'They Are In Use In Orders';
          this.bulkactionmessage3=this.bulkAction === 0 ? `Selected Records are not updated. They have ${this.message}` 
          : this.message
        } else {
          this.sideDialog.hide();
        }
      });
  }
  public onOkClick()
  {
    this.sideDialog.hide();
  }
}
