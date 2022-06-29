import {Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild} from '@angular/core';
import {GridComponent} from "@syncfusion/ej2-angular-grids";
import {Actions, ofActionDispatched, Select, Store} from "@ngxs/store";
import {BillRatesState} from "@organization-management/store/bill-rates.state";
import {filter, Observable, Subject, takeUntil, throttleTime} from "rxjs";
import {BillRateOption, ExternalBillRateTypePage, ExternalBillRateType} from "@shared/models/bill-rate.model";
import {AbstractGridConfigurationComponent} from "@shared/components/abstract-grid-configuration/abstract-grid-configuration.component";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {ConfirmService} from "@shared/services/confirm.service";
import {CANCEL_COFIRM_TEXT, DELETE_CONFIRM_TITLE, DELETE_RECORD_TEXT, DELETE_RECORD_TITLE} from "@shared/constants";
import {ShowExportDialog, ShowSideDialog} from "../../../store/app.actions";
import {
  DeleteBillRatesTypeById,
  ExportBillRateSetup,
  GetExternalBillRateType, SaveBillRateType, UpdateBillRateType
} from "@organization-management/store/bill-rates.actions";
import {FieldSettingsModel} from "@syncfusion/ej2-angular-dropdowns";
import {ExportedFileType} from "@shared/enums/exported-file-type";
import {DatePipe} from "@angular/common";
import {ExportColumn, ExportOptions, ExportPayload} from "@shared/models/export.model";

@Component({
  selector: 'app-external-bill-rate',
  templateUrl: './external-bill-rate.component.html',
  styleUrls: [
    './external-bill-rate.component.scss',
    '../bill-rate-setup/bill-rate-setup.component.scss'
  ]
})
export class ExternalBillRateComponent extends AbstractGridConfigurationComponent implements OnInit, OnChanges {
  @ViewChild('grid') grid: GridComponent;
  @Input() isActive: boolean = false;
  @Input() searchQuery: string = '';
  @Input() export$: Subject<ExportedFileType> | undefined;

  public externalBillRateTypeForm: FormGroup;
  public isEdit = false;
  public defaultFileName: string;

  @Select(BillRatesState.externalBillRateType)
  billRateTypePage$: Observable<ExternalBillRateTypePage>;

  @Select(BillRatesState.billRateOptions)
  billRatesOptions$: Observable<BillRateOption[]>;
  billRateTitleFields: FieldSettingsModel = { text: 'title', value: 'id' };

  private pageSubject = new Subject<number>();
  public fileName: string;
  private unsubscribe$: Subject<void> = new Subject();
  private editRecordId?: number;
  public isReadOnly = false;

  public columnsToExport: ExportColumn[] = [
    { text:'External Bill Rate', column: 'Name'},
    { text:'Bill Rate Title', column: 'BillRateTitle'},
  ];

  constructor(
    private store: Store,
    private actions$: Actions,
    private fb: FormBuilder,
    private confirmService: ConfirmService,
    private datePipe: DatePipe,
  ) {
    super();
  }

  ngOnInit(): void {
    this.createFormGroups();
    this.store.dispatch(new GetExternalBillRateType({ pageNumber: this.currentPage, pageSize: this.pageSize }));
    this.actions$.pipe(takeUntil(this.unsubscribe$), ofActionDispatched(ShowExportDialog)).subscribe((val) => {
      if (val.isDialogShown) {
        this.defaultFileName = 'Bill Rates/External Bill Rate ' + this.generateDateTime(this.datePipe);
        this.fileName = this.defaultFileName;
      }
    });
    this.export$?.pipe(takeUntil(this.unsubscribe$)).subscribe((event: ExportedFileType) => {
      this.defaultFileName = 'Bill Rates/External Bill Rate ' + this.generateDateTime(this.datePipe);
      this.defaultExport(event);
    });
    this.pageSubject.pipe(takeUntil(this.unsubscribe$), throttleTime(100)).subscribe((page) => {
      this.currentPage = page;
      this.store.dispatch(new GetExternalBillRateType({pageNumber: this.currentPage, pageSize: this.pageSize}));
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['searchQuery']?.currentValue || changes['searchQuery']?.currentValue === "") {
      this.store.dispatch(new GetExternalBillRateType({ pageNumber: this.currentPage, pageSize: this.pageSize, name: this.searchQuery }));
    }
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  private createFormGroups(): void {
    this.externalBillRateTypeForm = this.fb.group({
      name: [null, [Validators.required, Validators.maxLength(100)]],
      billRateTitleId: [null],
    });
  }

  public onFormCancelClick(): void {
    if (this.externalBillRateTypeForm.dirty) {
      this.confirmService
        .confirm(CANCEL_COFIRM_TEXT, {
          title: DELETE_CONFIRM_TITLE,
          okButtonLabel: 'Leave',
          okButtonClass: 'delete-button'
        }).pipe(
          filter(confirm => !!confirm),
          takeUntil(this.unsubscribe$),
        )
        .subscribe(() => {
          this.store.dispatch(new ShowSideDialog(false));
          this.clearFormDetails();
          this.removeActiveCssClass();
        });
    } else {
      this.store.dispatch(new ShowSideDialog(false));
      this.clearFormDetails();
      this.removeActiveCssClass();
    }
  }

  private clearFormDetails(): void {
    this.externalBillRateTypeForm.reset();
    this.isEdit = false;
    this.editRecordId = undefined;
  }

  public onFormSaveClick(): void {
    if (this.externalBillRateTypeForm.valid) {
      this.saveForm();
    } else {
      this.externalBillRateTypeForm.markAllAsTouched();
    }
  }

  private saveForm(): void {
    const {name, billRateTitleId: billRateConfigId} = this.externalBillRateTypeForm.value;
    if(this.editRecordId) {
      this.store.dispatch(new UpdateBillRateType(this.editRecordId, {name, billRateConfigId}, this.currentPage, this.pageSize));
    } else {
      this.store.dispatch(new SaveBillRateType({name, billRateConfigId}, this.currentPage, this.pageSize));
    }
    setTimeout(() => this.clearFormDetails(), 1500);
  }

  public onEditRecordButtonClick(data: ExternalBillRateType, event: Event): void {
    if (!this.isReadOnly) {
      this.addActiveCssClass(event);
      this.isEdit = true;
      this.editRecordId = data.id;
      this.store.dispatch(new ShowSideDialog(true));
      this.externalBillRateTypeForm.patchValue({name: data.name, billRateTitleId: data.billRateConfigId});
    }
  }

  public onRemoveRecordButtonClick(data: ExternalBillRateType, event: Event): void {
    if (!this.isReadOnly) {
      this.addActiveCssClass(event);
      this.confirmService
        .confirm(DELETE_RECORD_TEXT, {
          title: DELETE_RECORD_TITLE,
          okButtonLabel: 'Delete',
          okButtonClass: 'delete-button'
        }).pipe(takeUntil(this.unsubscribe$))
        .subscribe((confirm) => {
          if (confirm) {
            this.store.dispatch(new DeleteBillRatesTypeById(data.id, this.currentPage, this.pageSize));
          }
          this.removeActiveCssClass();
        });
    }
  }

  public onGoToClick(event: any): void {
    if (event.currentPage || event.value) {
      this.pageSubject.next(event.currentPage || event.value);
    }
  }

  public onRowsDropDownChanged(): void {
    this.pageSize = parseInt(this.activeRowsPerPageDropDown);
    this.grid.pageSettings.pageSize = this.pageSize;
  }

  public override defaultExport(fileType: ExportedFileType, options?: ExportOptions): void {
    this.store.dispatch(new ExportBillRateSetup(new ExportPayload(
      fileType,
      {
        ids: this.selectedItems.length ? this.selectedItems.map(val => val[this.idFieldName]) : null,
        offset: Math.abs(new Date().getTimezoneOffset()),
      },
      options ? options.columns.map(val => val.column) : this.columnsToExport.map(val => val.column),
      null,
      options?.fileName || this.defaultFileName
    )));
    this.clearSelection(this.grid);
  }

  public closeExport() {
    this.fileName = '';
    this.store.dispatch(new ShowExportDialog(false));
  }

  public export(event: ExportOptions): void {
    this.closeExport();
    this.defaultExport(event.fileType, event);
  }
}
