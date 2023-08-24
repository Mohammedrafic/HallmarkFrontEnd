import { DatePipe } from '@angular/common';
import {
  ChangeDetectorRef, Component, Input, OnChanges, OnDestroy, OnInit,
  SimpleChanges, ViewChild,
} from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Actions, Select, Store, ofActionDispatched, ofActionSuccessful } from '@ngxs/store';
import { MaskedDateTimeService } from '@syncfusion/ej2-angular-calendars';
import { FieldSettingsModel } from '@syncfusion/ej2-angular-dropdowns';
import { GridComponent } from '@syncfusion/ej2-angular-grids';
import { MaskedTextBoxComponent } from '@syncfusion/ej2-angular-inputs';
import { Query } from "@syncfusion/ej2-data";
import { FilteringEventArgs } from "@syncfusion/ej2-dropdowns";
import { Observable, Subject, filter, switchMap, take, takeUntil, throttleTime } from 'rxjs';

import { UserPermissions } from '@core/enums';
import { DateTimeHelper } from '@core/helpers';
import { Permission } from '@core/interface';
import {
  DeleteBillRatesById,
  ExportBillRateSetup,
  GetBillRateOptions,
  GetBillRates,
  SaveUpdateBillRate,
  SaveUpdateBillRateSucceed,
  ShowConfirmationPopUp,
} from '@organization-management/store/bill-rates.actions';
import { BillRatesState } from '@organization-management/store/bill-rates.state';
import { GetAssignedSkillsByOrganization } from '@organization-management/store/organization-management.actions';
import { OrganizationManagementState } from '@organization-management/store/organization-management.state';
import {
  AbstractGridConfigurationComponent,
} from '@shared/components/abstract-grid-configuration/abstract-grid-configuration.component';
import {
  CANCEL_CONFIRM_TEXT,
  DATA_OVERRIDE_TEXT,
  DATA_OVERRIDE_TITLE,
  DELETE_CONFIRM_TITLE,
  DELETE_RECORD_TEXT,
  DELETE_RECORD_TITLE,
} from '@shared/constants';
import { BillRateTitleId } from '@shared/enums/bill-rate-title-id.enum';
import { ExportedFileType } from '@shared/enums/exported-file-type';
import { OrderTypeOptions } from '@shared/enums/order-type';
import { sortByField } from '@shared/helpers/sort-by-field.helper';
import {
  BillRateCalculationType,
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
import { ExportColumn, ExportOptions, ExportPayload } from '@shared/models/export.model';
import { FilteredItem } from '@shared/models/filter.model';
import {
  OrganizationDepartment, OrganizationLocation, OrganizationRegion,
  OrganizationStructure,
} from '@shared/models/organization.model';
import { Skill } from '@shared/models/skill.model';
import { ConfirmService } from '@shared/services/confirm.service';
import { FilterService } from '@shared/services/filter.service';
import { valuesOnly } from '@shared/utils/enum.utils';
import { intervalMaxValidator, intervalMinValidator } from '@shared/validators/interval.validator';
import { ShowExportDialog, ShowFilterDialog, ShowSideDialog } from '../../../store/app.actions';
import { UserState } from '../../../store/user.state';
import { RateSetupFilters, rateColumnsToExport } from './bill-rate-setup.constant';

@Component({
  selector: 'app-bill-rate-setup',
  templateUrl: './bill-rate-setup.component.html',
  styleUrls: ['./bill-rate-setup.component.scss'],
  providers: [MaskedDateTimeService],
})
export class BillRateSetupComponent extends AbstractGridConfigurationComponent implements OnInit, OnChanges, OnDestroy {
  @ViewChild('grid') grid: GridComponent;
  @ViewChild('rateHours') rateHoursInput: MaskedTextBoxComponent;
  @Input() isActive = false;
  @Input() export$: Subject<ExportedFileType> | undefined;
  @Input() filteredItems$: Subject<number>;
  @Input() importDialogEvent: Subject<boolean>;
  @Input() userPermission: Permission;

  @Select(UserState.lastSelectedOrganizationId)
  organizationId$: Observable<number>;

  @Select(UserState.organizationStructure)
  organizationStructure$: Observable<OrganizationStructure>;
  public orgRegions: OrganizationRegion[] = [];
  public allRegions: OrganizationRegion[] = [];

  public locations: OrganizationLocation[] = [];

  public departments: OrganizationDepartment[] = [];
  public departmentFields: FieldSettingsModel = { text: 'departmentName', value: 'departmentId' };
  public readonly userPermissions = UserPermissions;

  @Select(OrganizationManagementState.assignedSkillsByOrganization)
  skills$: Observable<Skill[]>;
  skillsFields: FieldSettingsModel = { text: 'skillDescription', value: 'id' };
  public allSkills: Skill[] = [];

  @Select(BillRatesState.billRatesPage)
  billRatesPage$: Observable<BillRateSetupPage>;

  @Select(BillRatesState.billRateOptions)
  billRatesOptions$: Observable<BillRateOption[]>;
  billRateTitleFields: FieldSettingsModel = { text: 'title', value: 'id' };
  public billRatesOptions: BillRateOption[];

  public orderTypes = OrderTypeOptions;
  public orderTypesFields: FieldSettingsModel = { text: 'name', value: 'id' };
  public fields: FieldSettingsModel = { text: 'name', value: 'id' };
  public selectedBillRateUnit: BillRateUnit = BillRateUnit.Multiplier;
  public BillRateUnitList = BillRateUnit;
  public isIntervalMaxRequired = true;
  public isIntervalMinRequired = true;
  public billRatesFormGroup: FormGroup;
  public billRateFilterFormGroup: FormGroup;
  public billRateCategory = BillRateCategory;
  public billRateTypesOptions = BillRateTypes;
  public billRateType = BillRateType;
  public filterColumns: any;
  public additionalLableForMinMax: string | null = null;
  public hideFilds = new Set<string>();
  public isWeeklyOT = false;
  public columnsToExport: ExportColumn[] = rateColumnsToExport;
  public fileName: string;
  public format = '#';
  public allRegionsSelected = false;
  public allLocationsSelected = false;
  public allDepartmentsSelected = false;
  public maxDepartmentsLength = 1000;
  public query: Query = new Query().take(this.maxDepartmentsLength);
  public otInputsEnabled = true;
  public amountDisabled = false;

  private billRateToPost?: BillRateSetupPost;
  private filters: BillRateFilters = {};
  private intervalMinField: AbstractControl;
  private intervalMaxField: AbstractControl;
  private isIntervalMinEnabled = true;
  private isIntervalMaxEnabled = true;
  private isEdit = false;
  private defaultFileName: string;
  private isMileageTitleType: boolean;
  private pageSubject = new Subject<number>();
  private unsubscribe$: Subject<void> = new Subject();
  private editRecordId?: number;
  public filterType: string = 'Contains';
  public isConsiderForHolidayShown = false;
  
  constructor(
    private store: Store,
    private actions$: Actions,
    private formBuilder: FormBuilder,
    private confirmService: ConfirmService,
    private filterService: FilterService,
    private datePipe: DatePipe,
    private cd: ChangeDetectorRef
  ) {
    super();
    this.createFormGroups();
  }

  get dialogHeader(): string {
    if (this.isEdit) {
      return 'Edit';
    }

    return 'Add New';
  }

  ngOnInit(): void {
    this.filterColumns = RateSetupFilters;
    this.idFieldName = 'billRateSettingId';
    this.filterColumns.billRateTypes.dataSource = BillRateTypes;
    this.filterColumns.orderTypes.dataSource = OrderTypeOptions;
    this.intervalMinField = this.billRatesFormGroup.get('intervalMin') as AbstractControl;
    this.intervalMaxField = this.billRatesFormGroup.get('intervalMax') as AbstractControl;

    this.observeExportAction();
    this.observeOrgId();
    this.observeExportEvent();
    this.observaStructure();
    this.observeSkills();
    this.observeRateOptions();
    this.observePaging();
    this.observeIntervalMin();
    this.observeIntervalMax();
    this.regionChangedHandler();
    this.locationChangedHandler();
    this.billRatesTitleChangedHandler();
    this.setBillRatesCtegories();
    this.intervalMinField.addValidators(intervalMinValidator(this.billRatesFormGroup, 'intervalMax'));
    this.intervalMaxField.addValidators(intervalMaxValidator(this.billRatesFormGroup, 'intervalMin'));
    this.observeRegionControl();
    this.observeLocationControl();
    this.observeSaveAction();
    this.observeConfirmAction();
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

  public allRegionsChange(event: { checked: boolean }): void {
    this.allRegionsSelected = event.checked;
    const regionsControl = this.billRatesFormGroup.controls['regionIds'];
    if (this.allRegionsSelected) {
      regionsControl.setValue(null);
      regionsControl.disable();
      let locations: Location[] = [];
      this.orgRegions.forEach((region: OrganizationRegion) => {
        const filteredLocation = region.locations || [];
        locations = [...locations, ...filteredLocation] as Location[];
      });
      this.locations = sortByField(locations, 'name');
    } else {
      regionsControl.enable({emitEvent: false});
    }
  }

  public allLocationsChange(event: { checked: boolean }): void {
    this.allLocationsSelected = event.checked;
    const locationsControl = this.billRatesFormGroup.controls['locationIds'];
    if (this.allLocationsSelected) {
      locationsControl.setValue(null);
      locationsControl.disable();
      let departments: OrganizationDepartment[] = [];
      this.locations?.forEach((location: OrganizationLocation) => {
        const filteredDepartments = location.departments || [];
        departments = [...departments, ...filteredDepartments] as OrganizationDepartment[];
      });
      this.departments = sortByField(departments, 'name');
    } else {
      locationsControl.enable({emitEvent: false});
    }
  }

  public allDepartmentsChange(event: { checked: boolean }): void {
    this.allDepartmentsSelected = event.checked;
    const departmentsControl = this.billRatesFormGroup.controls['departmentIds'];
    if (this.allDepartmentsSelected) {
      departmentsControl.setValue(null);
      departmentsControl.disable();
    } else {
      departmentsControl.enable();
    }
  }

  public onDepartmentsFiltering(e: FilteringEventArgs): void {
    const char = e.text.length + 1;
    let query: Query = new Query();
    query =
      e.text !== ""
        ? query.where('name', 'contains', e.text, true).take(char * 15)
        : query;
    e.updateData(this.departments as [], query);
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
        .pipe(
          filter((confirm) => !!confirm),
          take(1),
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

  public onFormSaveClick(): void {
    if (this.billRatesFormGroup.valid) {
      const effectiveDate: Date = this.billRatesFormGroup.controls['effectiveDate'].value;
      if (effectiveDate && !this.isEdit) {
        effectiveDate.setHours(0, 0, 0, 0);
      }

      const billRate: BillRateSetupPost = {
        billRateSettingId: this.editRecordId,
        billType: this.billRatesFormGroup.controls['billRatesType'].value,
        regionIds: this.allRegionsSelected ? null : this.billRatesFormGroup.controls['regionIds'].value,
        locationIds:
          this.allLocationsSelected
            ? null
            : this.billRatesFormGroup.controls['locationIds'].value,
        departmentIds:
          this.allDepartmentsSelected
            ? null
            : this.billRatesFormGroup.controls['departmentIds'].value,
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
        effectiveDate: effectiveDate,
        intervalMin: this.billRatesFormGroup.controls['intervalMin'].value,
        intervalMax: this.billRatesFormGroup.controls['intervalMax'].value,
        considerForWeeklyOT: this.billRatesFormGroup.controls['considerForWeeklyOt'].value
          ? this.billRatesFormGroup.controls['considerForWeeklyOt'].value
          : false,
        considerForDailyOT: this.billRatesFormGroup.controls['considerForDailyOt'].value
          ? this.billRatesFormGroup.controls['considerForDailyOt'].value
          : false,
        considerFor7thDayOT: this.billRatesFormGroup.controls['considerFor7thDayOt'].value
          ? this.billRatesFormGroup.controls['considerFor7thDayOt'].value
          : false,
        displayInJob: this.billRatesFormGroup.controls['displayInJob'].value
          ? this.billRatesFormGroup.controls['displayInJob'].value
          : false,
        considerForHoliday: this.billRatesFormGroup.controls['considerForHoliday'].value
          ? this.billRatesFormGroup.controls['considerForHoliday'].value
          : false,
      };

      this.billRateToPost = billRate;
      const filters = {
        pageNumber: this.currentPage,
        pageSize: this.pageSize,
        ...this.filters,
      };
      this.store.dispatch(new SaveUpdateBillRate(billRate, filters));
    } else {
      this.billRatesFormGroup.markAllAsTouched();
    }
  }

  public onEditRecordButtonClick(data: BillRateSetup, event: Event): void {
    this.addActiveCssClass(event);
    this.isEdit = true;
    this.editRecordId = data.billRateSettingId;

    setTimeout(() => this.setupFormValues(data));

    this.store.dispatch(new ShowSideDialog(true));
  }

  public onRemoveRecordButtonClick(data: BillRateSetup, event: Event): void {
    this.addActiveCssClass(event);
    this.confirmService
      .confirm(DELETE_RECORD_TEXT, {
        title: DELETE_RECORD_TITLE,
        okButtonLabel: 'Delete',
        okButtonClass: 'delete-button',
      })
      .pipe(
        take(1),
      )
      .subscribe((confirm) => {
        if (confirm) {
          const filters = {
            pageNumber: this.currentPage,
            pageSize: this.pageSize,
            ...this.filters,
          };
          this.store.dispatch(new DeleteBillRatesById(data.billRateSettingId, filters));
        }
        this.removeActiveCssClass();
      });
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
    const effectiveDate = this.filters.effectiveDate ? DateTimeHelper.setUtcTimeZone(this.filters.effectiveDate) : null;
    this.filters.effectiveDate = effectiveDate;
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

  public override updatePage(): void {
    this.store.dispatch(
      new GetBillRates({
        pageNumber: this.currentPage,
        pageSize: this.pageSize,
        ...this.filters,
      })
    );
  }

  private clearFilters(): void {
    this.billRateFilterFormGroup.reset();
    this.filteredItems = [];
    this.filteredItems$.next(this.filteredItems.length);
    this.currentPage = 1;
    this.filters = {};
  }

  private loadData(): void {
    this.store.dispatch(new GetAssignedSkillsByOrganization());
    this.store.dispatch(new GetBillRates({ pageNumber: this.currentPage, pageSize: this.pageSize }));
    this.store.dispatch(new GetBillRateOptions());
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
      billRateValueRateTimes: [null, [Validators.required, Validators.maxLength(11)]],
      effectiveDate: [null, [Validators.required]],
      intervalMin: [''],
      intervalMax: [''],
      considerForWeeklyOt: [null],
      considerForDailyOt: [null],
      considerFor7thDayOt: [null],
      displayInJob: [null],
      considerForHoliday: [null],
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
    this.allRegionsSelected = this.allLocationsSelected = this.allDepartmentsSelected = false;
    this.allRegionsChange({ checked: false });
    this.allLocationsChange({ checked: false });
    this.allDepartmentsChange({ checked: false });
  }

  private regionChangedHandler(): void {
    this.billRatesFormGroup
      .get('regionIds')
      ?.valueChanges.pipe(takeUntil(this.unsubscribe$))
      .subscribe((regionIds: number[]) => {
        if (regionIds && regionIds.length > 0) {
          const locations: OrganizationLocation[] = [];
          regionIds.forEach((id) => {
            const selectedRegion = this.orgRegions.find((region) => region.id === id);
            locations.push(...(selectedRegion?.locations as any));
          });
          this.locations = sortByField(locations, 'name');
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
          const departments: OrganizationDepartment[] = [];
          locationIds.forEach((id) => {
            const selectedLocation = this.locations.find((location) => location.id === id);
            departments.push(...(selectedLocation?.departments as []));
          });
          this.departments = sortByField(departments, 'name');
        }

        this.billRatesFormGroup.controls['departmentIds'].setValue(null);
        this.cd.markForCheck();
      });
  }

  private handleOnCallBillRateType(typeId: BillRateTitleId): void {
    if (typeId === BillRateTitleId.Oncall) {
      this.isConsiderForHolidayShown = true;
    } else {
      this.billRatesFormGroup.get('considerForHoliday')?.setValue(false);
      this.isConsiderForHolidayShown = false;
    }
  }

  // eslint-disable-next-line max-lines-per-function
  private billRatesTitleChangedHandler(): void {
    this.billRatesFormGroup
      .get('billRateTitleId')
      ?.valueChanges
      .pipe(takeUntil(this.unsubscribe$))
      // eslint-disable-next-line max-lines-per-function
      .subscribe((typeId: number) => {
        this.isMileageTitleType = typeId !== BillRateTitleId.Mileage;
        const foundBillRateOption = this.billRatesOptions.find((option) => option.id === typeId);

        if (foundBillRateOption) {
          this.setBillRateTypes(foundBillRateOption);
          this.selectedBillRateUnit = foundBillRateOption.unit;
          this.isIntervalMinEnabled = foundBillRateOption.intervalMin;
          this.isIntervalMaxEnabled = foundBillRateOption.intervalMax;
          this.isIntervalMinRequired = foundBillRateOption.intervalMinRequired;
          this.isIntervalMaxRequired = foundBillRateOption.intervalMaxRequired;
          this.billRatesFormGroup.get('billRateValueRateTimes')?.setValue('');
          this.billRatesFormGroup.get('billRatesCategory')?.setValue(BillRateCategory[foundBillRateOption.category]);
        }

        const VALIDATORS = [Validators.required, Validators.minLength(1), Validators.maxLength(10)];
        const intervalMinControl = this.billRatesFormGroup.get('intervalMin');
        const intervalMaxControl = this.billRatesFormGroup.get('intervalMax');

        if (this.isIntervalMinRequired) {
          intervalMinControl?.addValidators(VALIDATORS);
        } else {
          intervalMinControl?.clearValidators();
        }

        if (this.isIntervalMaxRequired) {
          intervalMaxControl?.addValidators(VALIDATORS);
        } else {
          intervalMaxControl?.clearValidators();
        }

        if (this.isIntervalMinEnabled) {
          intervalMinControl?.reset();
          intervalMinControl?.enable();
        } else {
          intervalMinControl?.reset();
          intervalMinControl?.disable();
        }

        if (this.isIntervalMaxEnabled) {
          intervalMaxControl?.reset();
          intervalMaxControl?.enable();
        } else {
          intervalMaxControl?.reset();
          intervalMaxControl?.disable();
        }

        this.handleOnCallBillRateType(typeId);

        if (typeId === BillRateTitleId.MissedMeal) {
          this.billRatesFormGroup.get('billRateValueRateTimes')?.patchValue(1);
        }

        if (typeId === BillRateTitleId.FacilityCalledOff || typeId === BillRateTitleId.ResourceCalledOff) {
          this.amountDisabled = true;
          this.billRatesFormGroup.get('billRateValueRateTimes')?.patchValue(0);
          this.billRatesFormGroup.get('billRateValueRateTimes')?.removeValidators(Validators.required);
        } else {
          this.amountDisabled = false;
          this.billRatesFormGroup.get('billRateValueRateTimes')?.addValidators(Validators.required);
        }

        if (typeId === BillRateTitleId.MissedMeal
          || typeId === BillRateTitleId.FacilityCalledOff || typeId === BillRateTitleId.ResourceCalledOff) {
            this.otInputsEnabled = false;
            this.billRatesFormGroup.get('considerForWeeklyOt')?.patchValue(false);
            this.billRatesFormGroup.get('considerForDailyOt')?.patchValue(false);
            this.billRatesFormGroup.get('considerFor7thDayOt')?.patchValue(false);

        } else if (!this.otInputsEnabled) {
          this.otInputsEnabled = true;
        }

        this.changeFieldsSettingByType(typeId);

        this.billRatesFormGroup.updateValueAndValidity();
        this.setFormatDecimalsValues();
        this.cd.markForCheck();
      });
  }

  private changeFieldsSettingByType(billRateType: BillRateCalculationType): void {
    this.hideFilds.clear();
    const intervalMinControl = this.billRatesFormGroup.get('intervalMin');
    const billRateValueRateTimesControl = this.billRatesFormGroup.get('billRateValueRateTimes');
    billRateValueRateTimesControl?.enable();
    switch (billRateType) {
      case BillRateCalculationType.Regular:
        intervalMinControl?.setValue(0);
        break;
      case BillRateCalculationType.RegularLocal:
        this.additionalLableForMinMax = 'Mileage';
        intervalMinControl?.setValue(0);
        break;
      case BillRateCalculationType.GuaranteedHours:
        this.additionalLableForMinMax = 'Work Week';
        this.hideFilds.add('intervalMax');
        this.hideFilds.add('billRateValueRateTimes');
        billRateValueRateTimesControl?.setValue(0);
        billRateValueRateTimesControl?.disable();
        break;
      case BillRateCalculationType.WeeklyOT:
        this.isWeeklyOT = true;
        break;
      default:
        this.isWeeklyOT = false;
        this.additionalLableForMinMax = null;
        break;
    }
  }

  private setBillRateTypes(billRateOption: BillRateOption): void {
    this.billRateTypesOptions = BillRateTypes.filter((type) => billRateOption.billTypes.includes(type.id));
  }

  private onClickedCheckboxHandler(data: any, controlName: string, isChecked: boolean): void {
    this.editRecordId = data.billRateSettingId;
    this.setupFormValues(data);

    setTimeout(() => {
      this.billRatesFormGroup.controls[controlName].setValue(isChecked);
      this.onFormSaveClick();
    });
  }

  private setupFormValues(data: BillRateSetup): void {
    this.allRegionsChange({ checked: !data.regionId });
    this.allLocationsChange({ checked: !data.locationId });
    this.allDepartmentsChange({ checked: !data.departmentId });
    if (!data.regionId) {
      this.allRegionsSelected = true;
      this.billRatesFormGroup.controls['regionIds'].setValue(null);
    } else {
      const locations: OrganizationLocation[] = [];
      const selectedRegion = this.orgRegions.find((region) => region.id === data.regionId);
      locations.push(...(selectedRegion?.locations as OrganizationLocation[]));
      this.locations = sortByField(locations, 'name');
      this.billRatesFormGroup.controls['regionIds'].setValue([data.regionId], {emitEvent: false});
    }

    if (!data.locationId) {
      this.allLocationsSelected = true;
      this.billRatesFormGroup.controls['locationIds'].setValue(null);
    } else {
      const departments: OrganizationDepartment[] = [];
      const selectedLocation = this.locations.find((location) => location.id === data.locationId);
      departments.push(...(selectedLocation?.departments as []));
      this.departments = sortByField(departments, 'name');
      this.billRatesFormGroup.controls['locationIds'].setValue([data.locationId], {emitEvent: false});
    }

    if (!data.departmentId) {
      this.allDepartmentsSelected = true;
      this.billRatesFormGroup.controls['departmentIds'].setValue(null);
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

    const decimals = this.isMileageTitleType ? 2 : 3;
    const rateHour =
      foundBillRateOption?.unit === BillRateUnit.Hours
        ? data.rateHour
        : parseFloat(data.rateHour.toString()).toFixed(decimals);
    this.billRatesFormGroup.controls['billRateValueRateTimes'].setValue(rateHour);
    this.billRatesFormGroup.controls['effectiveDate'].setValue(DateTimeHelper.setCurrentTimeZone(data.effectiveDate));
    this.billRatesFormGroup.controls['intervalMin'].setValue(data.intervalMin);
    this.billRatesFormGroup.controls['intervalMax'].setValue(data.intervalMax);
    this.billRatesFormGroup.controls['considerForWeeklyOt'].setValue(data.considerForWeeklyOT);
    this.billRatesFormGroup.controls['considerForDailyOt'].setValue(data.considerForDailyOT);
    this.billRatesFormGroup.controls['considerFor7thDayOt'].setValue(data.considerFor7thDayOT);
    this.billRatesFormGroup.controls['displayInJob'].setValue(data.displayInJob);
    this.billRatesFormGroup.controls['billRatesType'].setValue(data.billType);
    this.billRatesFormGroup.controls['considerForHoliday'].setValue(data.considerForHoliday);
  }

  private setFormatDecimalsValues(): void {
    const isBillRateUnitHours = this.selectedBillRateUnit === this.BillRateUnitList.Hours;
    this.format = isBillRateUnitHours ? '#' : this.isMileageTitleType ? '###.00' : '###.000';
    this.decimals = isBillRateUnitHours ? 0 : this.isMileageTitleType ? 2 : 3;
  }

  private observeExportAction(): void {
    this.actions$
    .pipe(
      ofActionDispatched(ShowExportDialog),
      filter((val) => !!val.isDialogShown),
      takeUntil(this.unsubscribe$),
    ).subscribe(() => {
      this.defaultFileName = 'Bill Rates/Bill Rate Setup ' + this.generateDateTime(this.datePipe);
      this.fileName = this.defaultFileName;
    });
  }

  private observeOrgId(): void {
    this.organizationId$
    .pipe(
      takeUntil(this.unsubscribe$)
    ).subscribe(() => {
      this.clearFilters();
      this.loadData();
    });
  }

  private observeExportEvent(): void {
    this.export$?.pipe(
      takeUntil(this.unsubscribe$)
    ).subscribe((event: ExportedFileType) => {
      this.defaultFileName = 'Bill Rates/Bill Rate Setup ' + this.generateDateTime(this.datePipe);
      this.defaultExport(event);
    });
  }

  private observaStructure(): void {
    this.organizationStructure$
    .pipe(
      filter((structure) => !!structure),
      takeUntil(this.unsubscribe$),
    ).subscribe((structure: OrganizationStructure) => {
      this.orgRegions = structure.regions;
      this.allRegions = [...this.orgRegions];
      this.filterColumns.regionIds.dataSource = this.allRegions;
    });
  }

  private observeSkills(): void {
    this.skills$
    .pipe(
      filter((skills) => skills && skills.length > 0),
      takeUntil(this.unsubscribe$)
    ).subscribe((skills) => {
      this.allSkills = skills;
      this.filterColumns.skillIds.dataSource = skills;
    });
  }

  private observeRateOptions(): void {
    this.billRatesOptions$
    .pipe(
      filter((options) => options && options.length > 0),
      takeUntil(this.unsubscribe$)
    ).subscribe((options) => {
      this.billRatesOptions = options;
      this.filterColumns.billRateConfigIds.dataSource = options;
    });
  }

  private observePaging(): void {
    this.pageSubject
    .pipe(
      throttleTime(100),
      takeUntil(this.unsubscribe$),
    ).subscribe((page) => {
      this.currentPage = page;
      this.filters.pageNumber = page;
      this.store.dispatch(new GetBillRates(this.filters));
    });
  }

  private observeIntervalMin(): void {
    this.intervalMinField.valueChanges
    .pipe(
      takeUntil(this.unsubscribe$),
    )
    .subscribe(() =>
      this.intervalMaxField.updateValueAndValidity({ onlySelf: true, emitEvent: false })
    );
  }

  private observeIntervalMax(): void {
    this.intervalMaxField.valueChanges
    .pipe(
      takeUntil(this.unsubscribe$),
    )
    .subscribe(() =>{
      this.intervalMinField.updateValueAndValidity({ onlySelf: true, emitEvent: false });
    });
  }

  private setBillRatesCtegories(): void {
    this.filterColumns.billRateCategories.dataSource = Object.values(BillRateCategory)
    .filter(valuesOnly)
    .map((name) => ({ name, id: BillRateCategory[name as BillRateCategory] }));
  }

  private observeRegionControl(): void {
    this.billRateFilterFormGroup.get('regionIds')?.valueChanges
    .pipe(
      takeUntil(this.unsubscribe$),
    )
    .subscribe((val: number[]) => {
      if (val?.length) {
        const selectedRegions: OrganizationRegion[] = [];
        val.forEach((id) =>
          selectedRegions.push(this.orgRegions.find((region) => region.id === id) as OrganizationRegion)
        );
        this.filterColumns.locationIds.dataSource = [];
        const locations: OrganizationLocation[] = [];
        selectedRegions.forEach((region) => {
          region.locations?.forEach((location) => (location.regionName = region.name));
          locations.push(...(region.locations as []));
        });
        this.filterColumns.locationIds.dataSource = sortByField(locations, 'name');
      } else {
        this.filterColumns.locationIds.dataSource = [];
        this.billRateFilterFormGroup.get('locationIds')?.setValue([]);
        this.filteredItems = this.filterService.generateChips(this.billRateFilterFormGroup, this.filterColumns);
        this.filteredItems$.next(this.filteredItems.length);
      }
      this.cd.markForCheck();
    });
  }

  private observeLocationControl(): void {
    this.billRateFilterFormGroup.get('locationIds')?.valueChanges
    .pipe(
      takeUntil(this.unsubscribe$),
    )
    .subscribe((locationIds: number[]) => {
      if (locationIds && locationIds.length > 0) {
        this.filterColumns.departmentIds.dataSource = [];
        const departments: OrganizationDepartment[] = [];
        locationIds.forEach((id) => {
          const selectedLocation = this.filterColumns.locationIds.dataSource.find(
            (location: OrganizationLocation) => location.id === id
          );
          departments.push(...(selectedLocation?.departments as []));
        });
        this.filterColumns.departmentIds.dataSource = sortByField(departments, 'name');
      } else {
        this.filterColumns.departmentIds.dataSource = [];
        this.billRateFilterFormGroup.get('departmentIds')?.setValue([]);
        this.filteredItems = this.filterService.generateChips(this.billRateFilterFormGroup, this.filterColumns);
        this.filteredItems$.next(this.filteredItems.length);
      }
      this.cd.markForCheck();
    });
  }

  private observeSaveAction(): void {
    this.actions$
    .pipe(
      ofActionSuccessful(SaveUpdateBillRateSucceed),
      takeUntil(this.unsubscribe$),
    ).subscribe(() => {
      this.store.dispatch(new ShowSideDialog(false));
      this.clearFormDetails();
    });
  }

  private observeConfirmAction(): void {
    this.actions$.pipe(
      takeUntil(this.unsubscribe$),
      ofActionSuccessful(ShowConfirmationPopUp),
      switchMap(() => this.confirmService
      .confirm(DATA_OVERRIDE_TEXT, {
        title: DATA_OVERRIDE_TITLE,
        okButtonLabel: 'Confirm',
        okButtonClass: '',
      })),
      filter((confirm) => confirm),
      take(1)
    ).subscribe(() => {
      if (this.billRateToPost) {
        const filters = {
          pageNumber: this.currentPage,
          pageSize: this.pageSize,
          ...this.filters,
        };
        this.billRateToPost.forceUpsert = true; // set force override flag for BE
        this.store.dispatch(new SaveUpdateBillRate(this.billRateToPost, filters));
      } else {
        this.store.dispatch(new ShowSideDialog(false));
        this.clearFormDetails();
      }
    });
  }
}
