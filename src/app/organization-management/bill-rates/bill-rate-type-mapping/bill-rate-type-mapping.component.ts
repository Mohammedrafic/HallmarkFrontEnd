import {Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild} from '@angular/core';
import {GridComponent} from "@syncfusion/ej2-angular-grids";
import {AbstractControl, FormBuilder, FormGroup, Validators} from "@angular/forms";
import {Actions, ofActionDispatched, Select, Store} from "@ngxs/store";
import {BillRatesState} from "@organization-management/store/bill-rates.state";
import {filter, Observable, Subject, takeUntil, throttleTime} from "rxjs";
import {
  BillRateOption, ExternalBillRateMapped,
  ExternalBillRateMapping,
  ExternalBillRateMappingPage,
  ExternalBillRateType,
} from "@shared/models/bill-rate.model";
import {FieldSettingsModel} from "@syncfusion/ej2-angular-dropdowns";
import {ConfirmService} from "@shared/services/confirm.service";
import {
  DeleteBillRatesMappingById,
  ExportExternalBillRateMapping,
  GetExternalBillRateMapping, GetExternalBillRateMappingById, SaveUpdateBillRateMapping,
} from "@organization-management/store/bill-rates.actions";
import {CANCEL_COFIRM_TEXT, DELETE_CONFIRM_TITLE, DELETE_RECORD_TEXT, DELETE_RECORD_TITLE} from "@shared/constants";
import {ShowExportDialog, ShowSideDialog} from "../../../store/app.actions";
import {AbstractGridConfigurationComponent} from "@shared/components/abstract-grid-configuration/abstract-grid-configuration.component";
import {ExportedFileType} from "@shared/enums/exported-file-type";
import {ExportColumn, ExportOptions, ExportPayload} from "@shared/models/export.model";
import {DatePipe} from "@angular/common";
import {UserState} from "../../../store/user.state";

@Component({
  selector: 'app-bill-rate-type-mapping',
  templateUrl: './bill-rate-type-mapping.component.html',
  styleUrls: [
    '../bill-rate-setup/bill-rate-setup.component.scss',
    './bill-rate-type-mapping.component.scss',
  ]
})
export class BillRateTypeMappingComponent extends AbstractGridConfigurationComponent implements OnInit, OnChanges {
  @ViewChild('grid') grid: GridComponent;
  @Input() isActive: boolean = false;
  @Input() searchQuery: string = '';
  @Input() export$: Subject<ExportedFileType> | undefined;

  public billRateMappingForm: FormGroup;
  public isEdit = false;
  public defaultFileName: string;
  public fileName: string;

  public columnsToExport: ExportColumn[] = [
    { text:'Bill Rate Title', column: 'BillRateTitle'},
    { text:'External Bill Rate', column: 'ExternalBillRate'},
  ];

  @Select(BillRatesState.externalBillRateMapping)
  billRateMapping$: Observable<ExternalBillRateMappingPage>;
  billRateMappingFields: FieldSettingsModel = { text: 'name', value: 'id' };

  @Select(BillRatesState.billRateOptions)
  billRatesOptions$: Observable<BillRateOption[]>;
  billRateTitleFields: FieldSettingsModel = { text: 'title', value: 'id' };

  @Select(BillRatesState.externalBillRateMapped)
  externalBillRateMapped$: Observable<ExternalBillRateMapped[]>;
  externalBillRateMappedFields: FieldSettingsModel = { text: 'externalBillRateName', value: 'externalBillRateId' };

  @Select(UserState.lastSelectedOrganizationId)
  organizationId$: Observable<number>;

  private pageSubject = new Subject<number>();
  private unsubscribe$: Subject<void> = new Subject();
  private editRecordId?: number;
  public isReadOnly = false; // TODO: temporary solution, until specific service provided

  get billRateTitleId(): AbstractControl {
    return this.billRateMappingForm.get("billRateTitleId") as AbstractControl;
  }

  get externalBillRates(): AbstractControl {
    return this.billRateMappingForm.get("externalBillRates") as AbstractControl;
  }

  constructor(
    private store: Store,
    private actions$: Actions,
    private fb: FormBuilder,
    private confirmService: ConfirmService,
    private datePipe: DatePipe,
  ) {
    super();
    this.idFieldName = 'billRateConfigId';
  }

  ngOnInit(): void {
    this.createFormGroups();
    this.patchExternalBillRates();
    this.subsToBillRateTitleChange();
    this.subsToExport();
    this.subsToOrganizationChange();
    this.subsToActions();
    this.subsToPageChange();
  }

  ngOnChanges(changes: SimpleChanges): void {
    const searchQuery = changes['searchQuery'];
    const isActive = changes['isActive'];

    if (!searchQuery?.isFirstChange() && (searchQuery?.currentValue || searchQuery?.currentValue === "")) {
      this.store.dispatch(new GetExternalBillRateMapping({ pageNumber: this.currentPage, pageSize: this.pageSize, name: this.searchQuery }));
    }
    if (isActive.currentValue && !isActive.isFirstChange()) {
      this.store.dispatch(new GetExternalBillRateMapping({ pageNumber: this.currentPage, pageSize: this.pageSize }));
    }
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  private createFormGroups(): void {
    this.billRateMappingForm = this.fb.group({
      billRateTitleId: [null, [Validators.required, Validators.maxLength(100)]],
      externalBillRates: [null, [Validators.required]],
    });

    this.externalBillRates.disable({emitEvent: false});
  }

  private patchExternalBillRates(): void {
    this.externalBillRateMapped$
      .pipe(filter(Boolean), takeUntil(this.unsubscribe$))
      .subscribe(externalBillRates => {
        const ids = externalBillRates.filter(item => item.mapped).map(item => item.externalBillRateId);
      this.externalBillRates.enable();
      this.billRateMappingForm.patchValue( {externalBillRates: ids}, {emitEvent: false});
    })
  }

  private subsToBillRateTitleChange(): void {
    this.billRateTitleId.valueChanges
      .pipe(filter(Boolean), takeUntil((this.unsubscribe$)))
      .subscribe(id => {
        this.store.dispatch(new GetExternalBillRateMappingById(id))
    });
  }

  private subsToExport(): void {
    this.export$?.pipe(takeUntil(this.unsubscribe$)).subscribe((event: ExportedFileType) => {
      this.defaultFileName = 'Bill Rates/External Bill Rate Mapping' + this.generateDateTime(this.datePipe);
      this.defaultExport(event);
    });
  }

  private subsToOrganizationChange(): void {
    this.organizationId$.pipe(takeUntil(this.unsubscribe$)).subscribe((id) => {
      this.store.dispatch(new GetExternalBillRateMapping({ pageNumber: this.currentPage, pageSize: this.pageSize }));
    });
  }

  private subsToActions(): void {
    this.actions$.pipe(takeUntil(this.unsubscribe$), ofActionDispatched(ShowExportDialog)).subscribe((val) => {
      if (val.isDialogShown) {
        this.defaultFileName = 'Bill Rates/External Bill Rate ' + this.generateDateTime(this.datePipe);
        this.fileName = this.defaultFileName;
      }
    });
  }

  private subsToPageChange(): void {
    this.pageSubject.pipe(takeUntil(this.unsubscribe$), throttleTime(100)).subscribe((page) => {
      this.currentPage = page;
      this.store.dispatch(new GetExternalBillRateMapping({pageNumber: this.currentPage, pageSize: this.pageSize}));
    });
  }

  public onFormCancelClick(): void {
    if (this.billRateMappingForm.dirty) {
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
    this.billRateMappingForm.reset();
    this.billRateTitleId.enable();
    this.externalBillRates.disable();
    this.isEdit = false;
    this.editRecordId = undefined;
  }

  public onFormSaveClick(): void {
    if (this.billRateMappingForm.valid) {
      this.saveForm();
      setTimeout(() => this.clearFormDetails(), 1500);
    } else {
      this.billRateMappingForm.markAllAsTouched();
    }
  }

  private saveForm(): void {
    const {billRateTitleId, externalBillRates} = this.billRateMappingForm.value;
    const ids = externalBillRates.map((id: number) => ({id}));
    this.store.dispatch(new SaveUpdateBillRateMapping(billRateTitleId || this.editRecordId, ids, this.currentPage, this.pageSize));
  }

  public onEditRecordButtonClick(data: ExternalBillRateMapping, event: Event): void {
    if (!this.isReadOnly) {
      this.store.dispatch(new GetExternalBillRateMappingById(data.billRateConfigId))
      this.billRateTitleId.disable();
      this.externalBillRates.enable();
      this.addActiveCssClass(event);
      this.isEdit = true;
      this.editRecordId = data.billRateConfigId;
      this.store.dispatch(new ShowSideDialog(true));
      const ids = data.externalBillRates.map(rate => rate.id);
      this.billRateMappingForm.patchValue({billRateTitleId: data.billRateConfigId, externalBillRates: ids}, {emitEvent: false});
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
            this.store.dispatch(new DeleteBillRatesMappingById(data.billRateConfigId, this.currentPage, this.pageSize));
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
    this.store.dispatch(new ExportExternalBillRateMapping(new ExportPayload(
      fileType,
      {
        ids: this.selectedItems.length ? this.selectedItems.map(val => val[this.idFieldName]) : null,
        offset: Math.abs(new Date().getTimezoneOffset()),
        name: this.searchQuery
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

