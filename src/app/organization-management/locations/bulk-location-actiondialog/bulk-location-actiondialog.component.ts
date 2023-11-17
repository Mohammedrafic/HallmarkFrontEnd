import { Component, OnInit, ChangeDetectionStrategy, ViewChild, Input, ChangeDetectorRef } from '@angular/core';
import { Actions, ofActionDispatched } from '@ngxs/store';
import { ShowBulkLocationActionDialog } from 'src/app/store/app.actions';
import { DestroyableDirective } from '@shared/directives/destroyable.directive';
import { DialogComponent } from '@syncfusion/ej2-angular-popups';
import { takeUntil } from 'rxjs';
@Component({
  selector: 'app-bulk-location-actiondialog',
  templateUrl: './bulk-location-actiondialog.component.html',
  styleUrls: ['./bulk-location-actiondialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BulkLocationActiondialogComponent extends DestroyableDirective implements OnInit {

  @ViewChild('bulklocationactiondialog') sideDialog: DialogComponent;
  targetElement: HTMLElement = document.body;
  public bulkactionmessage1:string='';
  public bulkactionmessage2:string='';
  public bulkactionmessage3:string='';
  

  @Input() message: string;
  @Input() bulkAction: Number;
  @Input() locationNames: string[];
  @Input() width = '340px'; 
  @Input() isDepartment: boolean;



  constructor(private action$: Actions,   private cdr: ChangeDetectorRef,) {
    super();
  }

  ngOnInit(): void {
    this.subscribeOnBulklocationNamesActionDialog();
  }

  private subscribeOnBulklocationNamesActionDialog(): void {
    this.action$
      .pipe(
        ofActionDispatched(ShowBulkLocationActionDialog),
        takeUntil(this.destroy$)
      ).subscribe(payload => { 
 
        if (payload.isDialogShown) {
          this.bulkactionmessage1=this.bulkAction===0? this.isDepartment? 'Following Department cannot be Updated':'Following Locations cannot be Updated': this.message;
          this.bulkactionmessage2=this.bulkAction===0? `They have ${this.message}.` : 'They are in use';
          this.bulkactionmessage3=this.bulkAction === 0 ? `Selected Records are not updated. They have ${this.message}` 
          : this.message

          this.cdr.detectChanges();
          this.sideDialog.show();
         
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
