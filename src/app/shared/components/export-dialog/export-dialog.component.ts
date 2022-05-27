import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { DialogComponent } from '@syncfusion/ej2-angular-popups';
import { Actions, ofActionDispatched } from '@ngxs/store';
import { ShowExportDialog } from '../../../store/app.actions';
import { ChipListComponent } from '@syncfusion/ej2-angular-buttons';
import { Subject, takeUntil } from 'rxjs';
import { ExportColumn } from '@shared/models/export.model';

@Component({
  selector: 'app-export-dialog',
  templateUrl: './export-dialog.component.html',
  styleUrls: ['./export-dialog.component.scss']
})
export class ExportDialogComponent implements OnInit, OnDestroy {
  private unsubscribe$: Subject<void> = new Subject();
  @ViewChild('exportDialog') exportDialog: DialogComponent;
  targetElement: HTMLElement = document.body;

  @ViewChild('chipList') chipList: ChipListComponent;

  @Input() width: string = '496px';
  @Input() fileName: string = 'File name';
  @Input() columns: ExportColumn[] = [];
  @Output() cancel = new EventEmitter();
  @Output() export = new EventEmitter();

  public selectedColumns:string[] = [];
  public fileType = '0';

  constructor(private action$: Actions) { }

  ngOnInit(): void {
    this.action$.pipe(takeUntil(this.unsubscribe$), ofActionDispatched(ShowExportDialog)).subscribe(payload => {
      if (payload.isDialogShown) {
        this.chipList.select(this.columns.map((val, i) => i));
        this.exportDialog.show();
      } else {
        this.chipList.select(this.chipList.selectedChips);
        this.fileType = '0';
        this.exportDialog.hide();
      }
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  onCancel(): void {
    this.cancel.emit();
  }

  onExport(): void {
    this.export.emit({
      fileName: this.fileName,
      fileType: this.fileType,
      columns: (this.chipList.selectedChips as []).map((val: string, i: number) => this.columns[i])
    });
  }
}
