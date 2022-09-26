import {
  ChangeDetectorRef,
  Component,
  Inject,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { AbstractGridConfigurationComponent } from '@shared/components/abstract-grid-configuration/abstract-grid-configuration.component';
import { filter, Observable, Subject, takeUntil, throttleTime } from 'rxjs';
import { GridComponent } from '@syncfusion/ej2-angular-grids';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  OrganizationDepartment,
  OrganizationLocation,
  OrganizationRegion,
  OrganizationStructure,
} from '@shared/models/organization.model';
import { Actions, ofActionDispatched, ofActionSuccessful, Select, Store } from '@ngxs/store';
import { UserState } from '../../../store/user.state';
import { GetAllOrganizationSkills } from '@organization-management/store/organization-management.actions';
import { FieldSettingsModel } from '@syncfusion/ej2-angular-dropdowns';
import { OrganizationManagementState } from '@organization-management/store/organization-management.state';
import { Skill } from '@shared/models/skill.model';
import { ConfirmService } from '@shared/services/confirm.service';
import {
  CANCEL_CONFIRM_TEXT,
  DATA_OVERRIDE_TEXT,
  DATA_OVERRIDE_TITLE,
  DELETE_CONFIRM_TITLE,
  DELETE_RECORD_TEXT,
  DELETE_RECORD_TITLE,
} from '@shared/constants';
import { ShowExportDialog, ShowFilterDialog, ShowSideDialog } from '../../../store/app.actions';
import {
  DeleteBillRatesById,
  GetBillRateOptions,
  GetBillRates,
  SaveUpdateBillRate,
  ShowConfirmationPopUp,
  SaveUpdateBillRateSucceed,
  ExportBillRateSetup,
} from '@organization-management/store/bill-rates.actions';
import { BillRatesState } from '@organization-management/store/bill-rates.state';
import {
  BillRateCategory,
  BillRateFilters,
  BillRateOption,
  BillRateSetup,
  BillRateSetupPage,
  BillRateSetupPost,
  BillRateType,
  BillRateTypes,
  BillRateUnit,
} from '@shared/models/bill-rate.model';
import { OrderTypeOptions } from '@shared/enums/order-type';
import { MaskedTextBoxComponent } from '@syncfusion/ej2-angular-inputs';
import { intervalMaxValidator, intervalMinValidator } from '@shared/validators/interval.validator';
import { FilteredItem } from '@shared/models/filter.model';
import { FilterService } from '@shared/services/filter.service';
import { ControlTypes, ValueType } from '@shared/enums/control-types.enum';
import PriceUtils from '@shared/utils/price.utils';
import { currencyValidator } from '@shared/validators/currency.validator';
import { BusinessUnitType } from '@shared/enums/business-unit-type';
import { ExportedFileType } from '@shared/enums/exported-file-type';
import { ExportColumn, ExportOptions, ExportPayload } from '@shared/models/export.model';
import { DatePipe } from '@angular/common';
import { valuesOnly } from '@shared/utils/enum.utils';
import { MaskedDateTimeService } from '@syncfusion/ej2-angular-calendars';

@Component({
  selector: 'app-bill-rate-setup',
  templateUrl: './bill-rate-setup.component.html',
  styleUrls: ['./bill-rate-setup.component.scss'],
  providers: [MaskedDateTimeService],
})
export class BillRateSetupComponent extends AbstractGridConfigurationComponent implements OnInit, OnChanges, OnDestroy {
  @ViewChild('grid') grid: GridComponent;
  @ViewChild('rateHours') rateHoursInput: MaskedTextBoxComponent;
  @Input() isActive: boolean = false;
  @Input() export$: Subject<ExportedFileType> | undefined;
  @Input() filteredItems$: Subject<number>;

  @Select(UserState.lastSelectedOrganizationId)
  organizationId$: Observable<number>;

  @Select(UserState.organizationStructure)
  organizationStructure$: Observable<OrganizationStructure>;
  public orgRegions: OrganizationRegion[] = [];
  public allRegions: OrganizationRegion[] = [];

  public locations: OrganizationLocation[] = [];

  public departments: OrganizationDepartment[] = [];
  public departmentFields: FieldSettingsModel = { text: 'departmentName', value: 'departmentId' };

  @Select(OrganizationManagementState.allOrganizationSkills)
  skills$: Observable<Skill[]>;
  skillsFields: FieldSettingsModel = { text: 'skillDescription', value: 'id' };
  public allSkills: Skill[] = [];

  @Select(BillRatesState.billRatesPage)
  billRatesPage$: Observable<BillRateSetupPage>;

  @Select(BillRatesState.billRateOptions)
  billRatesOptions$: Observable<BillRateOption[]>;
  billRateTitleFields: FieldSettingsModel = { text: 'title', value: 'id' };
  public billRatesOptions: BillRateOption[];
  public priceUtils = PriceUtils;

  public orderTypes = OrderTypeOptions;
  public orderTypesFields: FieldSettingsModel = { text: 'name', value: 'id' };

  public fields: FieldSettingsModel = { text: 'name', value: 'id' };
  public isEdit = false;
  public selectedBillRateUnit: BillRateUnit = BillRateUnit.Multiplier;
  public BillRateUnitList = BillRateUnit;
  public isIntervalMinEnabled = true;
  public isIntervalMaxEnabled = true;
  public billRatesFormGroup: FormGroup;
  public billRateFilterFormGroup: FormGroup;
  public intervalMinField: AbstractControl;
  public intervalMaxField: AbstractControl;
  public billRateCategory = BillRateCategory;
  public billRateTypesOptions = BillRateTypes;
  public billRateType = BillRateType;
  public filters: BillRateFilters = {};
  public filterColumns: any;
  public billRateToPost?: BillRateSetupPost;
  public isReadOnly = false; // TODO: temporary solution, until specific service provided

  get dialogHeader(): string {
    return this.isEdit ? 'Edit' : 'Add New';
  }

  private formBuilder: FormBuilder;
  private pageSubject = new Subject<number>();
  private unsubscribe$: Subject<void> = new Subject();
  private editRecordId?: number;
  private billRateValueValidators = [currencyValidator(0), Validators.minLength(1)];

  public columnsToExport: ExportColumn[] = [
    { text: 'Region', column: 'Region' },
    { text: 'Location', column: 'Location' },
    { text: 'Department', column: 'Department' },
    { text: 'Skill', column: 'Skill' },
    { text: 'Order Type', column: 'OrderType' },
    { text: 'Bill Rate Title', column: 'BillRateTitle' },
    { text: 'Bill Rate Category', column: 'BillRateCategory' },
    { text: 'Bill Rate Type', column: 'BillRateType' },
    { text: 'Effective Date', column: 'EffectiveDate' },
    { text: 'Bill Rate Value (Rate/Times)', column: 'BillRateValue' },
    { text: 'Interval Min', column: 'IntervalMin' },
    { text: 'Interval Max', column: 'IntervalMax' },
    { text: 'Consider For Weekly OT', column: 'ConsiderForWeeklyOT' },
    { text: 'Consider For Daily OT', column: 'ConsiderForDailyOT' },
    { text: 'Consider For 7th Day OT', column: 'ConsiderFor7thDayOT' },
    { text: 'Regular Local', column: 'RegularLocal' },
    { text: 'Display In Timesheet', column: 'DisplayInTimesheet' },
    { text: 'Display In Job', column: 'DisplayInJob' },
  ];
  public fileName: string;
  public defaultFileName: string;

  constructor(
    private store: Store,
    private actions$: Actions,
    @Inject(FormBuilder) private builder: FormBuilder,
    private confirmService: ConfirmService,
    private filterService: FilterService,
    private datePipe: DatePipe,
    private cd: ChangeDetectorRef
  ) {
    super();
    this.formBuilder = builder;
    this.createFormGroups();
  }

  ngOnInit(): void {
    this.idFieldName = 'billRateSettingId';
    this.actions$.pipe(takeUntil(this.unsubscribe$), ofActionDispatched(ShowExportDialog)).subscribe((val) => {
      if (val.isDialogShown) {
        this.defaultFileName = 'Bill Rates/Bill Rate Setup ' + this.generateDateTime(this.datePipe);
        this.fileName = this.defaultFileName;
      }
    });
    this.export$?.pipe(takeUntil(this.unsubscribe$)).subscribe((event: ExportedFileType) => {
      this.defaultFileName = 'Bill Rates/Bill Rate Setup ' + this.generateDateTime(this.datePipe);
      this.defaultExport(event);
    });
    this.organizationId$.pipe(takeUntil(this.unsubscribe$)).subscribe((id) => {
      this.clearFilters();
      this.loadData();
    });

    this.handlePagePermission();

    this.filterColumns = {
      regionIds: {
        type: ControlTypes.Multiselect,
        valueType: ValueType.Id,
        dataSource: [],
        valueField: 'name',
        valueId: 'id',
      },
      locationIds: {
        type: ControlTypes.Multiselect,
        valueType: ValueType.Id,
        dataSource: [],
        valueField: 'name',
        valueId: 'id',
      },
      departmentIds: {
        type: ControlTypes.Multiselect,
        valueType: ValueType.Id,
        dataSource: [],
        valueField: 'name',
        valueId: 'id',
      },
      skillIds: {
        type: ControlTypes.Multiselect,
        valueType: ValueType.Id,
        dataSource: [],
        valueField: 'skillDescription',
        valueId: 'id',
      },
      billRateConfigIds: {
        type: ControlTypes.Multiselect,
        valueType: ValueType.Id,
        dataSource: [],
        valueField: 'title',
        valueId: 'id',
      },
      orderTypes: {
        type: ControlTypes.Multiselect,
        valueType: ValueType.Id,
        dataSource: [],
        valueField: 'name',
        valueId: 'id',
      },
      billRateCategories: {
        type: ControlTypes.Multiselect,
        valueType: ValueType.Id,
        dataSource: [],
        valueField: 'name',
        valueId: 'id',
      },
      billRateTypes: {
        type: ControlTypes.Multiselect,
        valueType: ValueType.Id,
        dataSource: [],
        valueField: 'name',
        valueId: 'id',
      },
      effectiveDate: { type: ControlTypes.Date, valueType: ValueType.Text },
      intervalMin: { type: ControlTypes.Text, valueType: ValueType.Text },
      intervalMax: { type: ControlTypes.Text, valueType: ValueType.Text },
      considerForWeeklyOt: {
        type: ControlTypes.Checkbox,
        valueType: ValueType.Text,
        checkBoxTitle: 'Consider for Weekly OT',
      },
      considerForDailyOt: {
        type: ControlTypes.Checkbox,
        valueType: ValueType.Text,
        checkBoxTitle: 'Consider for Daily OT',
      },
      considerFor7thDayOt: {
        type: ControlTypes.Checkbox,
        valueType: ValueType.Text,
        checkBoxTitle: 'Consider for 7th Day OT',
      },
      regularLocal: { type: ControlTypes.Checkbox, valueType: ValueType.Text, checkBoxTitle: 'Regular/Local' },
      displayInTimesheet: {
        type: ControlTypes.Checkbox,
        valueType: ValueType.Text,
        checkBoxTitle: 'Display in Timesheet',
      },
      displayInJob: { type: ControlTypes.Checkbox, valueType: ValueType.Text, checkBoxTitle: 'Display in Job' },
    };

    this.filterColumns.billRateCategories.dataSource = Object.values(BillRateCategory)
      .filter(valuesOnly)
      .map((name) => ({ name, id: BillRateCategory[name as BillRateCategory] }));

    this.filterColumns.billRateTypes.dataSource = Object.values(BillRateType)
      .filter(valuesOnly)
      .map((name) => ({ name, id: BillRateType[name as BillRateType] }));

    this.organizationStructure$
      .pipe(takeUntil(this.unsubscribe$), filter(Boolean))
      .subscribe((structure: OrganizationStructure) => {
        this.orgRegions = structure.regions;
        this.allRegions = [...this.orgRegions];
        this.filterColumns.regionIds.dataSource = this.allRegions;
      });

    this.skills$.pipe(takeUntil(this.unsubscribe$)).subscribe((skills) => {
      if (skills && skills.length > 0) {
        this.allSkills = skills;
        this.filterColumns.skillIds.dataSource = skills;
      }
    });

    this.billRatesOptions$.pipe(takeUntil(this.unsubscribe$)).subscribe((options) => {
      if (options && options.length > 0) {
        this.billRatesOptions = options;
        this.filterColumns.billRateConfigIds.dataSource = options;
      }
    });

    this.pageSubject.pipe(takeUntil(this.unsubscribe$), throttleTime(100)).subscribe((page) => {
      this.currentPage = page;
      this.filters.pageNumber = page;
      this.store.dispatch(new GetBillRates(this.filters));
    });

    this.filterColumns.orderTypes.dataSource = OrderTypeOptions;

    this.intervalMinField = this.billRatesFormGroup.get('intervalMin') as AbstractControl;
    this.intervalMinField.addValidators(intervalMinValidator(this.billRatesFormGroup, 'intervalMax'));
    this.intervalMinField.valueChanges.subscribe(() =>
      this.intervalMaxField.updateValueAndValidity({ onlySelf: true, emitEvent: false })
    );

    this.intervalMaxField = this.billRatesFormGroup.get('intervalMax') as AbstractControl;
    this.intervalMaxField.addValidators(intervalMaxValidator(this.billRatesFormGroup, 'intervalMin'));
    this.intervalMaxField.valueChanges.subscribe(() =>
      this.intervalMinField.updateValueAndValidity({ onlySelf: true, emitEvent: false })
    );

    this.regionChangedHandler();
    this.locationChangedHandler();
    this.billRatesTitleChangedHandler();

    this.billRateFilterFormGroup.get('regionIds')?.valueChanges.subscribe((val: number[]) => {
      if (val?.length) {
        const selectedRegions: OrganizationRegion[] = [];
        val.forEach((id) =>
          selectedRegions.push(this.orgRegions.find((region) => region.id === id) as OrganizationRegion)
        );
        this.filterColumns.locationIds.dataSource = [];
        selectedRegions.forEach((region) => {
          region.locations?.forEach((location) => (location.regionName = region.name));
          this.filterColumns.locationIds.dataSource.push(...(region.locations as []));
        });
      } else {
        this.filterColumns.locationIds.dataSource = [];
        this.billRateFilterFormGroup.get('locationIds')?.setValue([]);
        this.filteredItems = this.filterService.generateChips(this.billRateFilterFormGroup, this.filterColumns);
        this.filteredItems$.next(this.filteredItems.length);
      }
      this.cd.markForCheck();
    });

    this.billRateFilterFormGroup.get('locationIds')?.valueChanges.subscribe((locationIds: number[]) => {
      if (locationIds && locationIds.length > 0) {
        this.filterColumns.departmentIds.dataSource = [];
        locationIds.forEach((id) => {
          const selectedLocation = this.filterColumns.locationIds.dataSource.find(
            (location: OrganizationLocation) => location.id === id
          );
          this.filterColumns.departmentIds.dataSource.push(...(selectedLocation?.departments as []));
        });
      } else {
        this.filterColumns.departmentIds.dataSource = [];
        this.billRateFilterFormGroup.get('departmentIds')?.setValue([]);
        this.filteredItems = this.filterService.generateChips(this.billRateFilterFormGroup, this.filterColumns);
        this.filteredItems$.next(this.filteredItems.length);
      }
      this.cd.markForCheck();
    });

    this.actions$.pipe(takeUntil(this.unsubscribe$), ofActionSuccessful(SaveUpdateBillRateSucceed)).subscribe(() => {
      this.store.dispatch(new ShowSideDialog(false));
      this.clearFormDetails();
    });

    this.actions$.pipe(takeUntil(this.unsubscribe$), ofActionSuccessful(ShowConfirmationPopUp)).subscribe(() => {
      this.confirmService
        .confirm(DATA_OVERRIDE_TEXT, {
          title: DATA_OVERRIDE_TITLE,
          okButtonLabel: 'Confirm',
          okButtonClass: '',
        })
        .pipe(filter((confirm) => !!confirm))
        .subscribe(() => {
          if (this.billRateToPost) {
            this.billRateToPost.forceUpsert = true; // set force override flag for BE
            this.store.dispatch(new SaveUpdateBillRate(this.billRateToPost, this.currentPage, this.pageSize));
          } else {
            this.store.dispatch(new ShowSideDialog(false));
            this.clearFormDetails();
          }
        });
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    const isActive = changes['isActive'];

    if (isActive?.currentValue && !isActive.isFirstChange()) {
      this.loadData();
    }
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  public loadData(): void {
    this.store.dispatch(new GetAllOrganizationSkills());
    this.store.dispatch(new GetBillRates({ pageNumber: this.currentPage, pageSize: this.pageSize }));
    this.store.dispatch(new GetBillRateOptions());
  }

  public closeExport() {
    this.fileName = '';
    this.store.dispatch(new ShowExportDialog(false));
  }

  public export(event: ExportOptions): void {
    this.closeExport();
    this.defaultExport(event.fileType, event);
  }

  public override defaultExport(fileType: ExportedFileType, options?: ExportOptions): void {
    this.store.dispatch(
      new ExportBillRateSetup(
        new ExportPayload(
          fileType,
          {
            ...this.filters,
            ids: this.selectedItems.length ? this.selectedItems.map((val) => val[this.idFieldName]) : null,
            offset: Math.abs(new Date().getTimezoneOffset()),
          },
          options ? options.columns.map((val) => val.column) : this.columnsToExport.map((val) => val.column),
          null,
          options?.fileName || this.defaultFileName
        )
      )
    );
    this.clearSelection(this.grid);
  }

  public onFormCancelClick(): void {
    if (this.billRatesFormGroup.dirty) {
      this.confirmService
        .confirm(CANCEL_CONFIRM_TEXT, {
          title: DELETE_CONFIRM_TITLE,
          okButtonLabel: 'Leave',
          okButtonClass: 'delete-button',
        })
        .pipe(filter((confirm) => !!confirm))
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

  public onFormSaveClick(): void {
    if (this.billRatesFormGroup.valid) {
      const isAllRegions = this.billRatesFormGroup.controls['regionIds'].value.length === this.allRegions.length;
      const billRate: BillRateSetupPost = {
        billRateSettingId: this.editRecordId,
        billType: this.billRatesFormGroup.controls['billRatesType'].value,
        regionIds: isAllRegions ? [] : this.billRatesFormGroup.controls['regionIds'].value, // [] means All on the BE side
        locationIds:
          isAllRegions && this.billRatesFormGroup.controls['locationIds'].value.length === this.locations.length
            ? []
            : this.billRatesFormGroup.controls['locationIds'].value, // [] means All on the BE side
        departmentIds:
          isAllRegions && this.billRatesFormGroup.controls['departmentIds'].value.length === this.departments.length
            ? []
            : this.billRatesFormGroup.controls['departmentIds'].value, // [] means All on the BE side
        skillIds:
          this.billRatesFormGroup.controls['skillIds'].value.length === this.allSkills.length
            ? [] // [] means All on the BE side
            : this.billRatesFormGroup.controls['skillIds'].value,
        billRateConfigId: this.billRatesFormGroup.controls['billRateTitleId'].value,
        orderTypes:
          this.billRatesFormGroup.controls['orderTypeIds'].value.length === this.orderTypes.length
            ? [] // [] means All on the BE side
            : this.billRatesFormGroup.controls['orderTypeIds'].value,
        rateHour: this.billRatesFormGroup.controls['billRateValueRateTimes'].value,
        effectiveDate: this.billRatesFormGroup.controls['effectiveDate'].value,
        intervalMin: this.isIntervalMinEnabled ? this.billRatesFormGroup.controls['intervalMin'].value : null,
        intervalMax: this.isIntervalMaxEnabled ? this.billRatesFormGroup.controls['intervalMax'].value : null,
        considerForWeeklyOT: this.billRatesFormGroup.controls['considerForWeeklyOt'].value
          ? this.billRatesFormGroup.controls['considerForWeeklyOt'].value
          : false,
        considerForDailyOT: this.billRatesFormGroup.controls['considerForDailyOt'].value
          ? this.billRatesFormGroup.controls['considerForDailyOt'].value
          : false,
        considerFor7thDayOT: this.billRatesFormGroup.controls['considerFor7thDayOt'].value
          ? this.billRatesFormGroup.controls['considerFor7thDayOt'].value
          : false,
        regularLocal: this.billRatesFormGroup.controls['regularLocal'].value
          ? this.billRatesFormGroup.controls['regularLocal'].value
          : false,
        displayInTimesheet: this.billRatesFormGroup.controls['displayInTimesheet'].value
          ? this.billRatesFormGroup.controls['displayInTimesheet'].value
          : false,
        displayInJob: this.billRatesFormGroup.controls['displayInJob'].value
          ? this.billRatesFormGroup.controls['displayInJob'].value
          : false,
      };

      this.billRateToPost = billRate;
      this.store.dispatch(new SaveUpdateBillRate(billRate, this.currentPage, this.pageSize));
    } else {
      this.billRatesFormGroup.markAllAsTouched();
    }
  }

  public onEditRecordButtonClick(data: BillRateSetup, event: Event): void {
    if (!this.isReadOnly) {
      this.addActiveCssClass(event);
      this.isEdit = true;
      this.editRecordId = data.billRateSettingId;

      setTimeout(() => this.setupFormValues(data));

      this.store.dispatch(new ShowSideDialog(true));
    }
  }

  public onRemoveRecordButtonClick(data: BillRateSetup, event: any): void {
    if (!this.isReadOnly) {
      this.addActiveCssClass(event);
      this.confirmService
        .confirm(DELETE_RECORD_TEXT, {
          title: DELETE_RECORD_TITLE,
          okButtonLabel: 'Delete',
          okButtonClass: 'delete-button',
        })
        .subscribe((confirm) => {
          if (confirm) {
            this.store.dispatch(new DeleteBillRatesById(data.billRateSettingId, this.currentPage, this.pageSize));
          }
          this.removeActiveCssClass();
        });
    }
  }

  public considerForWeeklyOtChange(data: any, event: any): void {
    this.onClickedCheckboxHandler(data, 'considerForWeeklyOt', event.checked);
  }

  public considerForDailyOtChange(data: any, event: any): void {
    this.onClickedCheckboxHandler(data, 'considerForDailyOt', event.checked);
  }

  public considerFor7thDayOtChange(data: any, event: any): void {
    this.onClickedCheckboxHandler(data, 'considerFor7thDayOt', event.checked);
  }

  public regularLocalChange(data: any, event: any): void {
    this.onClickedCheckboxHandler(data, 'regularLocal', event.checked);
  }

  public displayInTimeSheetChange(data: any, event: any): void {
    this.onClickedCheckboxHandler(data, 'displayInTimesheet', event.checked);
  }

  public displayInJobChange(data: any, event: any): void {
    this.onClickedCheckboxHandler(data, 'displayInJob', event.checked);
  }

  public onRowsDropDownChanged(): void {
    this.pageSize = parseInt(this.activeRowsPerPageDropDown);
    this.grid.pageSettings.pageSize = this.pageSize;
  }

  public onGoToClick(event: any): void {
    if (event.currentPage || event.value) {
      this.pageSubject.next(event.currentPage || event.value);
    }
  }

  public onFilterDelete(event: FilteredItem): void {
    this.filterService.removeValue(event, this.billRateFilterFormGroup, this.filterColumns);
  }

  private clearFilters(): void {
    this.billRateFilterFormGroup.reset();
    this.filteredItems = [];
    this.filteredItems$.next(this.filteredItems.length);
    this.currentPage = 1;
    this.filters = {};
  }

  public onFilterClearAll(): void {
    this.clearFilters();
    this.store.dispatch(
      new GetBillRates({
        pageNumber: this.currentPage,
        pageSize: this.pageSize,
        ...this.filters,
      })
    );
  }

  public onFilterClose() {
    this.billRateFilterFormGroup.setValue({
      regionIds: this.filters.regionIds || [],
      locationIds: this.filters.locationIds || [],
      departmentIds: this.filters.departmentIds || [],
      skillIds: this.filters.skillIds || [],
      billRateConfigIds: this.filters.billRateConfigIds || [],
      orderTypes: this.filters.orderTypes || [],
      billRateCategories: this.filters.billRateCategories || [],
      billRateTypes: this.filters.billRateTypes || [],
      effectiveDate: this.filters.effectiveDate || null,
      intervalMin: this.filters.intervalMin || null,
      intervalMax: this.filters.intervalMax || null,
      considerForWeeklyOt: this.filters.considerForWeeklyOt || null,
      considerForDailyOt: this.filters.considerForDailyOt || null,
      considerFor7thDayOt: this.filters.considerFor7thDayOt || null,
      regularLocal: this.filters.regularLocal || null,
      displayInTimesheet: this.filters.displayInTimesheet || null,
      displayInJob: this.filters.displayInJob || null,
    });
    this.filteredItems = this.filterService.generateChips(
      this.billRateFilterFormGroup,
      this.filterColumns,
      this.datePipe
    );
    this.filteredItems$.next(this.filteredItems.length);
  }

  public onFilterApply(): void {
    this.filters = this.billRateFilterFormGroup.getRawValue();
    this.filters.effectiveDate = this.filters.effectiveDate || null;
    this.filteredItems = this.filterService.generateChips(
      this.billRateFilterFormGroup,
      this.filterColumns,
      this.datePipe
    );
    this.filteredItems$.next(this.filteredItems.length);
    this.store.dispatch(
      new GetBillRates({
        pageNumber: this.currentPage,
        pageSize: this.pageSize,
        ...this.filters,
      })
    );
    this.store.dispatch(new ShowFilterDialog(false));
  }

  private createFormGroups(): void {
    this.billRatesFormGroup = this.formBuilder.group({
      regionIds: ['', [Validators.required]],
      locationIds: ['', [Validators.required]],
      departmentIds: ['', [Validators.required]],
      skillIds: ['', [Validators.required]],
      billRateTitleId: ['', [Validators.required]],
      orderTypeIds: ['', [Validators.required]],
      billRatesCategory: [{ value: '', disabled: true }],
      billRatesType: ['', [Validators.required]],
      billRateValueRateTimes: [null, [Validators.required, Validators.maxLength(11), ...this.billRateValueValidators]],
      effectiveDate: [null, [Validators.required]],
      intervalMin: [''],
      intervalMax: [''],
      considerForWeeklyOt: [null],
      considerForDailyOt: [null],
      considerFor7thDayOt: [null],
      regularLocal: [null],
      displayInTimesheet: [null],
      displayInJob: [null],
    });

    this.billRateFilterFormGroup = this.formBuilder.group({
      regionIds: [[]],
      locationIds: [[]],
      departmentIds: [[]],
      skillIds: [[]],
      billRateConfigIds: [[]],
      orderTypes: [[]],
      billRateCategories: [[]],
      billRateTypes: [[]],
      effectiveDate: [null],
      intervalMin: [null],
      intervalMax: [null],
      considerForWeeklyOt: [null],
      considerForDailyOt: [null],
      considerFor7thDayOt: [null],
      regularLocal: [null],
      displayInTimesheet: [null],
      displayInJob: [null],
    });
  }

  private clearFormDetails(): void {
    this.billRatesFormGroup.reset();
    this.isEdit = false;
    this.editRecordId = undefined;
    this.billRateToPost = undefined;
    this.removeActiveCssClass();
    this.selectedBillRateUnit = BillRateUnit.Multiplier;
  }

  private regionChangedHandler(): void {
    this.billRatesFormGroup
      .get('regionIds')
      ?.valueChanges.pipe(takeUntil(this.unsubscribe$))
      .subscribe((regionIds: number[]) => {
        if (regionIds && regionIds.length > 0) {
          this.locations = [];
          regionIds.forEach((id) => {
            const selectedRegion = this.orgRegions.find((region) => region.id === id);
            this.locations.push(...(selectedRegion?.locations as any));
          });
          this.departments = [];
          this.locations.forEach((location) => {
            this.departments.push(...location.departments);
          });
        } else {
          this.locations = [];
          this.departments = [];
        }

        this.billRatesFormGroup.controls['locationIds'].setValue(null);
        this.billRatesFormGroup.controls['departmentIds'].setValue(null);
        this.cd.markForCheck();
      });
  }

  private locationChangedHandler(): void {
    this.billRatesFormGroup
      .get('locationIds')
      ?.valueChanges.pipe(takeUntil(this.unsubscribe$))
      .subscribe((locationIds: number[]) => {
        if (locationIds && locationIds.length > 0) {
          this.departments = [];
          locationIds.forEach((id) => {
            const selectedLocation = this.locations.find((location) => location.id === id);
            this.departments.push(...(selectedLocation?.departments as []));
          });
        } else {
          this.departments = [];
        }

        this.billRatesFormGroup.controls['departmentIds'].setValue(null);
        this.cd.markForCheck();
      });
  }

  private billRatesTitleChangedHandler(): void {
    this.billRatesFormGroup
      .get('billRateTitleId')
      ?.valueChanges.pipe(takeUntil(this.unsubscribe$))
      .subscribe((typeId: number) => {
        const foundBillRateOption = this.billRatesOptions.find((option) => option.id === typeId);
        if (foundBillRateOption) {
          this.setBillRateTypes(foundBillRateOption);
          this.selectedBillRateUnit = foundBillRateOption.unit;
          this.isIntervalMinEnabled = foundBillRateOption.intervalMin;
          this.isIntervalMaxEnabled = foundBillRateOption.intervalMax;
          this.billRatesFormGroup.get('billRateValueRateTimes')?.setValue('');
          this.updateAmountValidators();
          this.billRatesFormGroup.get('billRatesCategory')?.setValue(BillRateCategory[foundBillRateOption.category]);
        }

        if (this.isIntervalMinEnabled) {
          this.billRatesFormGroup.get('intervalMin')?.reset();
          this.billRatesFormGroup.get('intervalMin')?.enable();
          this.billRatesFormGroup
            .get('intervalMin')
            ?.addValidators([Validators.required, Validators.minLength(1), Validators.maxLength(10)]);
        } else {
          this.billRatesFormGroup.get('intervalMin')?.reset();
          this.billRatesFormGroup.get('intervalMin')?.disable();
          this.billRatesFormGroup
            .get('intervalMin')
            ?.removeValidators([Validators.required, Validators.minLength(1), Validators.maxLength(10)]);
        }

        if (this.isIntervalMaxEnabled) {
          this.billRatesFormGroup.get('intervalMax')?.reset();
          this.billRatesFormGroup.get('intervalMax')?.enable();
          this.billRatesFormGroup
            .get('intervalMax')
            ?.addValidators([Validators.required, Validators.minLength(1), Validators.maxLength(10)]);
        } else {
          this.billRatesFormGroup.get('intervalMax')?.reset();
          this.billRatesFormGroup.get('intervalMax')?.disable();
          this.billRatesFormGroup
            .get('intervalMax')
            ?.removeValidators([Validators.required, Validators.minLength(1), Validators.maxLength(10)]);
        }
        this.cd.markForCheck();
      });
  }

  setBillRateTypes(billRateOption: BillRateOption): void {
    this.billRateTypesOptions = BillRateTypes.filter((type) => billRateOption.billTypes.includes(type.id));
  }

  private onClickedCheckboxHandler(data: any, controlName: string, isChecked: boolean): void {
    if (!this.isReadOnly) {
      this.editRecordId = data.billRateSettingId;
      this.setupFormValues(data);
      setTimeout(() => {
        this.billRatesFormGroup.controls[controlName].setValue(isChecked);
        this.onFormSaveClick();
      });
    }
  }

  updateAmountValidators(): void {
    if (this.selectedBillRateUnit === this.BillRateUnitList.Currency) {
      this.billRatesFormGroup.get('billRateValueRateTimes')?.removeValidators(this.billRateValueValidators);
    } else {
      this.billRatesFormGroup.get('billRateValueRateTimes')?.addValidators(this.billRateValueValidators);
    }
    this.billRatesFormGroup.get('billRateValueRateTimes')?.updateValueAndValidity();
  }

  private setupFormValues(data: BillRateSetup): void {
    if (!data.regionId) {
      const allRegionsIds = this.allRegions.map((region) => region.id);
      this.billRatesFormGroup.controls['regionIds'].setValue(allRegionsIds);
    } else {
      this.billRatesFormGroup.controls['regionIds'].setValue([data.regionId]);
    }

    if (!data.locationId) {
      const locationIds = this.locations.map((location) => location.id);
      this.billRatesFormGroup.controls['locationIds'].setValue(locationIds);
    } else {
      this.billRatesFormGroup.controls['locationIds'].setValue([data.locationId]);
    }

    if (!data.departmentId) {
      const departmentIds = this.departments.map((department) => department.id);
      this.billRatesFormGroup.controls['departmentIds'].setValue(departmentIds);
    } else {
      this.billRatesFormGroup.controls['departmentIds'].setValue([data.departmentId]);
    }

    if (data.skills.length === 0) {
      this.billRatesFormGroup.controls['skillIds'].setValue(this.allSkills.map((skill: Skill) => skill.id));
    } else {
      this.billRatesFormGroup.controls['skillIds'].setValue(data.skills.map((skill: any) => skill.id));
    }

    const foundBillRateOption = this.billRatesOptions.find((option) => option.id === data.billRateConfigId);
    if (foundBillRateOption) {
      this.billRatesFormGroup.controls['billRateTitleId'].setValue(foundBillRateOption.id);
    }

    if (data.orderTypes.length === 0) {
      this.billRatesFormGroup.controls['orderTypeIds'].setValue(this.orderTypes.map((type) => type.id));
    } else {
      this.billRatesFormGroup.controls['orderTypeIds'].setValue(data.orderTypes);
    }

    const rateHour =
      foundBillRateOption?.unit === BillRateUnit.Hours
        ? data.rateHour
        : parseFloat(data.rateHour.toString()).toFixed(2);
    this.billRatesFormGroup.controls['billRateValueRateTimes'].setValue(rateHour);
    this.billRatesFormGroup.controls['effectiveDate'].setValue(data.effectiveDate);
    this.billRatesFormGroup.controls['intervalMin'].setValue(data.intervalMin);
    this.billRatesFormGroup.controls['intervalMax'].setValue(data.intervalMax);
    this.billRatesFormGroup.controls['considerForWeeklyOt'].setValue(data.considerForWeeklyOT);
    this.billRatesFormGroup.controls['considerForDailyOt'].setValue(data.considerForDailyOT);
    this.billRatesFormGroup.controls['considerFor7thDayOt'].setValue(data.considerFor7thDayOT);
    this.billRatesFormGroup.controls['regularLocal'].setValue(data.regularLocal);
    this.billRatesFormGroup.controls['displayInTimesheet'].setValue(data.displayInTimesheet);
    this.billRatesFormGroup.controls['displayInJob'].setValue(data.displayInJob);
    this.billRatesFormGroup.controls['billRatesType'].setValue(data.billType);
  }

  // TODO: temporary solution, until specific service provided
  private handlePagePermission(): void {
    const user = this.store.selectSnapshot(UserState.user);
    this.isReadOnly = user?.businessUnitType === BusinessUnitType.Organization;
  }
}
