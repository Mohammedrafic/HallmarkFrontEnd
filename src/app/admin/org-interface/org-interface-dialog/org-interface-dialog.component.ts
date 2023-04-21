import { Component, OnInit, ChangeDetectionStrategy, Input, ViewChild, OnDestroy } from '@angular/core';
import { OrgInterface } from '@shared/models/org-interface.model';
import { disabledBodyOverflow, windowScrollTop } from '@shared/utils/styles.utils';
import { DialogComponent } from '@syncfusion/ej2-angular-popups';
import { Subject, takeUntil, takeWhile } from 'rxjs';

@Component({
  selector: 'app-org-interface-dialog',
  templateUrl: './org-interface-dialog.component.html',
  styleUrls: ['./org-interface-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrgInterfaceDialogComponent implements OnInit,  OnDestroy {

  @Input() selectedOrgLog$: Subject<OrgInterface> = new Subject<OrgInterface>();
  @Input() openDialogue: Subject<boolean>;

  @ViewChild('sideOrgInterfaceDialog') sideOrgInterfaceDialog: DialogComponent;

  private isAlive = true;
  selectedOrgLogDataset:OrgInterface;
  private unsubscribe$: Subject<void> = new Subject();
  selectedOrgLogDataset$: Subject<OrgInterface> = new Subject<OrgInterface>();
  onSaveEvent$: Subject<boolean> = new Subject<boolean>();
  onClearEvent$: Subject<boolean> = new Subject<boolean>();
  public targetElement: HTMLElement | null = document.body.querySelector('#main');

  constructor() { }

  ngOnInit(): void {

    this.selectedOrgLog$.pipe(takeUntil(this.unsubscribe$)).subscribe((dataSet)=>{
      this.selectedOrgLogDataset$.next(dataSet);
    });

    this.openDialogue.pipe(takeWhile(() => this.isAlive)).subscribe((isOpen) => {
      if (isOpen) { 
        windowScrollTop();
        this.sideOrgInterfaceDialog.show();
        disabledBodyOverflow(true);
      } else {
        this.sideOrgInterfaceDialog.hide();
        disabledBodyOverflow(false);
      }
    });
  }

  public onClose(): void {
    this.sideOrgInterfaceDialog.hide();
    this.openDialogue.next(false);
  }

  ngOnDestroy(): void {
    this.isAlive = false;
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

}
