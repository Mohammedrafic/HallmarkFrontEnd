import { ChangeDetectorRef, Component, Inject, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { AbstractGridConfigurationComponent } from '@shared/components/abstract-grid-configuration/abstract-grid-configuration.component';
import { filter, Observable, Subject, takeUntil, throttleTime } from 'rxjs';
import { GridComponent } from '@syncfusion/ej2-angular-grids';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OrganizationDepartment, OrganizationLocation, OrganizationRegion, OrganizationStructure } from '@shared/models/organization.model';
import { Actions, ofActionDispatched, ofActionSuccessful, Select, Store } from '@ngxs/store';
import { UserState } from '../../../store/user.state';
import { GetAssignedSkillsByOrganization } from '@organization-management/store/organization-management.actions';
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
  DELETE_RECORD_TITLE
} from '@shared/constants';
import { ShowExportDialog, ShowFilterDialog, ShowSideDialog } from '../../../store/app.actions';
import {
  DeleteBillRatesById,
  ExportBillRateSetup,
  GetBillRateOptions,
  GetBillRates,
  SaveUpdateBillRate,
  SaveUpdateBillRateSucceed,
  ShowConfirmationPopUp
} from '@organization-management/store/bill-rates.actions';
import { BillRatesState } from '@organization-management/store/bill-rates.state';
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
  BillRateUnit
} from '@shared/models/bill-rate.model';
import { OrderTypeOptions } from '@shared/enums/order-type';
import { MaskedTextBoxComponent } from '@syncfusion/ej2-angular-inputs';
import { intervalMaxValidator, intervalMinValidator } from '@shared/validators/interval.validator';
import { FilteredItem } from '@shared/models/filter.model';
import { FilterService } from '@shared/services/filter.service';
import { ControlTypes, ValueType } from '@shared/enums/control-types.enum';
import { BusinessUnitType } from '@shared/enums/business-unit-type';
import { ExportedFileType } from '@shared/enums/exported-file-type';
import { ExportColumn, ExportOptions, ExportPayload } from '@shared/models/export.model';
import { DatePipe } from '@angular/common';
import { valuesOnly } from '@shared/utils/enum.utils';
import { MaskedDateTimeService } from '@syncfusion/ej2-angular-calendars';
import { DateTimeHelper } from '@core/helpers';
import { UserPermissions } from '@core/enums';
import { Permission } from '@core/interface';
import { BillRateTitleId } from '@shared/enums/bill-rate-title-id.enum';
import { sortByField } from '@shared/helpers/sort-by-field.helper';
import { Query } from "@syncfusion/ej2-data";
import { FilteringEventArgs } from "@syncfusion/ej2-dropdowns";

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
  public isEdit = false;
  public selectedBillRateUnit: BillRateUnit = BillRateUnit.Multiplier;
  public BillRateUnitList = BillRateUnit;
  public isIntervalMinEnabled = true;
  public isIntervalMaxEnabled = true;
  public isIntervalMaxRequired = true;
  public isIntervalMinRequired = true;
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
  public additionalLableForMinMax: string | null = null;
  public hideFilds = new Set<string>();
  public isWeeklyOT = false;

  get dialogHeader(): string {
    return this.isEdit ? 'Edit' : 'Add New';
  }

  private formBuilder: FormBuilder;
  private pageSubject = new Subject<number>();
  private unsubscribe$: Subject<void> = new Subject();
  private editRecordId?: number;

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
    { text: 'Display In Job', column: 'DisplayInJob' },
  ];
  public fileName: string;
  public defaultFileName: string;
  public isMileageTitleType: boolean;
  public format = '#';
  public allRegionsSelected: boolean = false;
  public allLocationsSelected: boolean = false;
  public allDepartmentsSelected: boolean = false;
  public maxDepartmentsLength = 1000;
  public query: Query = new Query().take(this.maxDepartmentsLength);

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
      displayInJob: { type: ControlTypes.Checkbox, valueType: ValueType.Text, checkBoxTitle: 'Display in Job' },
    };

    this.filterColumns.billRateCategories.dataSource = Object.values(BillRateCategory)
      .filter(valuesOnly)
      .map((name) => ({ name, id: BillRateCategory[name as BillRateCategory] }));

    this.filterColumns.billRateTypes.dataSource = BillRateTypes

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

    this.billRateFilterFormGroup.get('locationIds')?.valueChanges.subscribe((locationIds: number[]) => {
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
  };

  public loadData(): void {
    this.store.dispatch(new GetAssignedSkillsByOrganization());
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

  public onRemoveRecordButtonClick(data: BillRateSetup, event: any): void {
    this.addActiveCssClass(event);
    this.confirmService
      .confirm(DELETE_RECORD_TEXT, {
        title: DELETE_RECORD_TITLE,
        okButtonLabel: 'Delete',
        okButtonClass: 'delete-button',
      })
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
    const effectiveDate = this.filters.effectiveDate ? DateTimeHelper.toUtcFormat(this.filters.effectiveDate) : null;
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

  private billRatesTitleChangedHandler(): void {
    this.billRatesFormGroup
      .get('billRateTitleId')
      ?.valueChanges.pipe(takeUntil(this.unsubscribe$))
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

  setBillRateTypes(billRateOption: BillRateOption): void {
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
      locations.push(...(selectedRegion?.locations as any));
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
    this.billRatesFormGroup.controls['effectiveDate'].setValue(data.effectiveDate);
    this.billRatesFormGroup.controls['intervalMin'].setValue(data.intervalMin);
    this.billRatesFormGroup.controls['intervalMax'].setValue(data.intervalMax);
    this.billRatesFormGroup.controls['considerForWeeklyOt'].setValue(data.considerForWeeklyOT);
    this.billRatesFormGroup.controls['considerForDailyOt'].setValue(data.considerForDailyOT);
    this.billRatesFormGroup.controls['considerFor7thDayOt'].setValue(data.considerFor7thDayOT);
    this.billRatesFormGroup.controls['displayInJob'].setValue(data.displayInJob);
    this.billRatesFormGroup.controls['billRatesType'].setValue(data.billType);
  }

  private setFormatDecimalsValues(): void {
    const isBillRateUnitHours = this.selectedBillRateUnit === this.BillRateUnitList.Hours;
    this.format = isBillRateUnitHours ? '#' : this.isMileageTitleType ? '###.00' : '###.000';
    this.decimals = isBillRateUnitHours ? 0 : this.isMileageTitleType ? 2 : 3;
  }
}
