import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';

import { DialogComponent } from '@syncfusion/ej2-angular-popups';
import { ChipListComponent } from '@syncfusion/ej2-angular-buttons';
import { Actions, Select, ofActionDispatched } from '@ngxs/store';
import { Observable, Subject, takeUntil } from 'rxjs';

import { ExportColumn } from '@shared/models/export.model';
import { ExportedFileType } from '@shared/enums/exported-file-type';
import { AppState } from 'src/app/store/app.state';
import { ShowCustomExportDialog } from '../../../store/app.actions';

@Component({
  selector: 'app-custom-export-dialog',
  templateUrl: './custom-export-dialog.component.html',
  styleUrls: ['./custom-export-dialog.component.scss'],
})
export class CustomExportDialogComponent implements OnInit, OnDestroy {
  private unsubscribe$: Subject<void> = new Subject();
  @ViewChild('exportDialog') customExportDialog: DialogComponent;
  targetElement: HTMLElement = document.body;

  @ViewChild('chipList') chipList: ChipListComponent;

  @Input() width = '496px';

  @Input() set fileName(value: string) {
    this._fileName = value;
  }
  @Input() columns: ExportColumn[] = [];
  @Output() cancel = new EventEmitter();
  @Output() export = new EventEmitter();

  @Select(AppState.isMobileScreen)
  public readonly isMobile$: Observable<boolean>;

  public ExportedFileType = ExportedFileType;
  public selectedColumns: string[] = [];
  public fileType = ExportedFileType.excel;
  public _fileName: string;

  constructor(private action$: Actions) { }

  ngOnInit(): void {
    this.subscribeOnOpenCustomExportDialog();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  public onCancel(): void {
    this.cancel.emit();
  }

  public selectChips(event: { index: number }): void {
    if ((this.chipList.selectedChips as number[]).length === 0) {
      this.chipList.select(event.index);
    }
  }

  public onExport(): void {
    this.export.emit({
      fileName: this._fileName,
      fileType: this.fileType,
      columns: (this.chipList.selectedChips as []).map((val: number) => this.columns[val]),
    });
  }

  private subscribeOnOpenCustomExportDialog(): void {
    this.action$.pipe(takeUntil(this.unsubscribe$), ofActionDispatched(ShowCustomExportDialog)).subscribe((payload) => {
      if (payload.isDialogShown) {
        this.chipList.select(this.columns.map((val, i) => i));
        this.customExportDialog.show();
      } else {
        this.chipList.select(this.chipList.selectedChips);
        this.fileType = ExportedFileType.excel;
        this.customExportDialog.hide();
      }
    });
  }
}
