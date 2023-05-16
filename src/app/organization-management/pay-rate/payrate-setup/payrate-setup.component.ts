import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { AbstractGridConfigurationComponent } from '@shared/components/abstract-grid-configuration/abstract-grid-configuration.component';
import { filter, Observable, Subject, takeUntil, throttleTime } from 'rxjs';
import { GridComponent } from '@syncfusion/ej2-angular-grids';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { OrganizationDepartment, OrganizationLocation, OrganizationRegion, OrganizationStructure } from '@shared/models/organization.model';
import { Actions, ofActionDispatched, ofActionSuccessful, Select, Store } from '@ngxs/store';
import { UserState } from '../../../store/user.state';
import { GetAssignedSkillsByOrganization } from '@organization-management/store/organization-management.actions';
import { FieldSettingsModel } from '@syncfusion/ej2-angular-dropdowns';
import { ConfirmService } from '@shared/services/confirm.service';
import {
  CANCEL_CONFIRM_TEXT,
  DATA_OVERRIDE_TEXT,
  DATA_OVERRIDE_TITLE,
  DELETE_CONFIRM_TITLE,
  DELETE_RECORD_TEXT,
  DELETE_RECORD_TITLE
} from '@shared/constants';
import { ShowExportDialog, ShowFilterDialog, ShowSideDialog, ShowToast } from '../../../store/app.actions';
import {
  DeletePayRatesById,
  ExportPayRateSetup,
  GetPayRates,
  GetSkillsbyDepartment,
  GetWorkCommitmentByPage,
  SaveUpdatePayRate,
  SaveUpdatePayRateSucceed,
  ShowConfirmationPopUp
} from '@organization-management/store/pay-rates.action';
import { PayRatesState } from '@organization-management/store/pay-rates.state';
import {
  PayRateCategory,
  PayRateFilters,
  PayRateSetup,
  PayRateSetupPage,
  PayRateSetupPost,
  PayRateTitle,
  PayRateType,
  PayRateTypes,
} from '@shared/models/pay-rate.model';
import { PayrateOrderType } from '@shared/enums/order-type';
import { MaskedTextBoxComponent } from '@syncfusion/ej2-angular-inputs';
import { FilteredItem } from '@shared/models/filter.model';
import { FilterService } from '@shared/services/filter.service';
import { ControlTypes, ValueType } from '@shared/enums/control-types.enum';
import { ExportedFileType } from '@shared/enums/exported-file-type';
import { ExportColumn, ExportOptions, ExportPayload } from '@shared/models/export.model';
import { DatePipe } from '@angular/common';
import { valuesOnly } from '@shared/utils/enum.utils';
import { UserPermissions } from '@core/enums';
import { Permission } from '@core/interface';
import { sortByField } from '@shared/helpers/sort-by-field.helper';
import { TakeUntilDestroy } from '@core/decorators';
import { DefaultOptionFields } from 'src/app/dashboard/widgets/rn-utilization-widget/rn-utilization.constants';
import { MasterCommitmentState } from '@admin/store/commitment.state';
import { MasterCommitmentsPage } from '@shared/models/commitment.model';
import { GetCommitmentByPage } from '@admin/store/commitment.actions';
import { MessageTypes } from '@shared/enums/message-types';

@TakeUntilDestroy
@Component({
  selector: 'app-payrate-setup',
  templateUrl: './payrate-setup.component.html',
  styleUrls: ['./payrate-setup.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PayrateSetupComponent extends AbstractGridConfigurationComponent implements OnInit, OnChanges, OnDestroy {

  @ViewChild('grid') grid: GridComponent;
  @ViewChild('rateHours') rateHoursInput: MaskedTextBoxComponent;
  @Input() isActive: boolean = false;
  @Input() export$: Subject<ExportedFileType> | undefined;
  @Input() filteredItems$: Subject<number>;
  @Input() userPermission: Permission;

  @Select(UserState.lastSelectedOrganizationId)
  organizationId$: Observable<number>;

  @Select(UserState.organizationStructure)
  organizationStructure$: Observable<OrganizationStructure>;

  @Select(PayRatesState.workCommitmentsPage)
  public commitmentsPage$: Observable<MasterCommitmentsPage>;

  public orgRegions: OrganizationRegion[] = [];
  public allRegions: OrganizationRegion[] = [];

  public locations: OrganizationLocation[] = [];

  public departments: OrganizationDepartment[] = [];
  public skills : any[] = [];
  public departmentFields: FieldSettingsModel = { text: 'departmentName', value: 'departmentId' };
  public readonly userPermissions = UserPermissions;

  @Select(PayRatesState.payRatesPage)
  payRatesPage$: Observable<PayRateSetupPage>;

  @Select(PayRatesState.skillbydepartment)
  skillbydepartment$: Observable<any>;

  public readonly optionFields = DefaultOptionFields;

  billRateTitleFields: FieldSettingsModel = { text: 'title', value: 'id' };

  public orderTypes = PayrateOrderType;
  public orderTypesFields: FieldSettingsModel = { text: 'name', value: 'id' };

  public fields: FieldSettingsModel = { text: 'name', value: 'id' };
  public isEdit = false;
  public PayRatesFormGroup: FormGroup;
  public payRateFilterFormGroup: FormGroup;
  public payRateCategory = PayRateCategory;
  public payRateTypesOptions = PayRateTypes;
  public PayRateTitleOption = PayRateTitle;
  public payTypes = PayRateType;
  public filters: PayRateFilters = {};
  public filterColumns: any;
  public billRateToPost?: PayRateSetupPost;
  public orgId : number;
  get dialogHeader(): string {
    return this.isEdit ? 'Edit' : 'Add New';
  }
  private formBuilder: FormBuilder;
  private pageSubject = new Subject<number>();
  private unsubscribe$: Subject<void> = new Subject();
  private editRecordId?: number;
  private workcommitmentsedit: any[] = [];
  private skillsEdit: any[] = [];
  public columnsToExport: ExportColumn[] = [
    { text: 'Region', column: 'Region' },
    { text: 'Location', column: 'Location' },
    { text: 'Department', column: 'Department' },
    { text: 'Skill', column: 'Skill' },
    { text: 'Order Type', column: 'OrderType' },
    { text: 'Pay Rate Title', column: 'PayRateTitle' },
    { text: 'Pay Rate Category', column: 'PayRateCategory' },
    { text: 'Pay Rate Type', column: 'PayRateType' },
    { text: 'Effective Date', column: 'EffectiveDate' },
    { text: 'Work Commitment', column: 'WorkCommitments' },
    { text: 'Pay Rate', column : 'Amount' }
  ];
  public fileName: string;
  public defaultFileName: string;
  public format = 'n3';
  public allRegionsSelected: boolean = false;
  public allLocationsSelected: boolean = false;
  public allDepartmentsSelected: boolean = false;
  protected componentDestroy: () => Observable<unknown>;
  public pageNumber = 1;
  public deptId: any[] = [];
  public workcommitments:any = [];

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
    this.getWorkCommitment();
    this.idFieldName = 'payRateSettingId';
    this.actions$.pipe(takeUntil(this.unsubscribe$), ofActionDispatched(ShowExportDialog)).subscribe((val) => {
      if (val.isDialogShown) {
        this.defaultFileName = 'Pay Rate ' + this.generateDateTime(this.datePipe);
        this.fileName = this.defaultFileName;
      }
    });
    this.export$?.pipe(takeUntil(this.unsubscribe$)).subscribe((event: ExportedFileType) => {
      this.defaultFileName = 'Pay Rate ' + this.generateDateTime(this.datePipe);
      this.defaultExport(event);
    });
    this.organizationId$.pipe(takeUntil(this.unsubscribe$)).subscribe((id) => {
      this.orgId = id;
      this.clearFilters();
      this.loadData();
    });
    this.commitmentsPage$.pipe(takeUntil(this.unsubscribe$)).subscribe((id) => {
      if(id){
        this.workcommitments = id.items;
      }
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
        valueField: 'name',
        valueId: 'id',
      },
      PayRateTitleOption: {
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
      payRatesCategory: {
        type: ControlTypes.Multiselect,
        valueType: ValueType.Id,
        dataSource: [],
        valueField: 'name',
        valueId: 'id',
      },
      payTypes: {
        type: ControlTypes.Multiselect,
        valueType: ValueType.Id,
        dataSource: [],
        valueField: 'name',
        valueId: 'id',
      },
      WorkCommitmentIds: {
        type: ControlTypes.Multiselect,
        valueType: ValueType.Id,
        dataSource: [],
        valueField: 'name',
        valueId: 'id',
      },
      payType: {
        type: ControlTypes.Multiselect,
        valueType: ValueType.Id,
        dataSource: [],
        valueField: 'name',
        valueId: 'id',
      },
      effectiveDate: { type: ControlTypes.Date, valueType: ValueType.Text },
    };

    this.filterColumns.payRatesCategory.dataSource = Object.values(PayRateCategory)
      .filter(valuesOnly)
      .map((name) => ({ name, id: PayRateCategory[name as PayRateCategory] }));

    this.filterColumns.payTypes.dataSource = PayRateTypes;
    this.filterColumns.PayRateTitleOption.dataSource = PayRateTitle;

    this.organizationStructure$
      .pipe(takeUntil(this.unsubscribe$), filter(Boolean))
      .subscribe((structure: OrganizationStructure) => {
        this.orgRegions = structure.regions;
        this.allRegions = [...this.orgRegions];
        this.filterColumns.regionIds.dataSource = this.allRegions;
      });

    this.pageSubject.pipe(takeUntil(this.unsubscribe$), throttleTime(100)).subscribe((page) => {
      this.currentPage = page;
      this.filters.pageNumber = page;
      this.store.dispatch(new GetPayRates(this.filters));
    });

    this.filterColumns.orderTypes.dataSource = PayrateOrderType;

    this.regionChangedHandler();
    this.locationChangedHandler();
    this.departmentChangedHandler();

    this.payRateFilterFormGroup.get('regionIds')?.valueChanges.subscribe((val: number[]) => {
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
        this.payRateFilterFormGroup.get('locationIds')?.setValue([]);
        this.filteredItems = this.filterService.generateChips(this.payRateFilterFormGroup, this.filterColumns);
        this.filteredItems$.next(this.filteredItems.length);
      }
      this.cd.markForCheck();
    });

    this.payRateFilterFormGroup.get('locationIds')?.valueChanges.subscribe((locationIds: number[]) => {
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
        this.payRateFilterFormGroup.get('departmentIds')?.setValue([]);
        this.filteredItems = this.filterService.generateChips(this.payRateFilterFormGroup, this.filterColumns);
        this.filteredItems$.next(this.filteredItems.length);
      }
      this.cd.markForCheck();
    });

    this.payRateFilterFormGroup.get('departmentIds')?.valueChanges.subscribe((departmentIds: number[]) => {
      if (departmentIds && departmentIds.length > 0) {
        this.store.dispatch(new GetSkillsbyDepartment(departmentIds));
        this.skillbydepartment$.pipe(takeUntil(this.componentDestroy())).subscribe((skills) => {
          if(skills && skills.length > 0){
            this.filterColumns.skillIds.dataSource = sortByField(skills, "name");
          } else {
            this.filterColumns.skillIds.dataSource = [];
            this.payRateFilterFormGroup.get("skillIds")?.setValue(null);
          }
          this.cd.markForCheck();
        });
      }
    });

    this.actions$.pipe(takeUntil(this.unsubscribe$), ofActionSuccessful(SaveUpdatePayRateSucceed)).subscribe(() => {
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
            this.store.dispatch(new SaveUpdatePayRate(this.billRateToPost, filters));
          } else {
            this.store.dispatch(new ShowSideDialog(false));
            this.clearFormDetails();
          }
        });
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
      this.loadData();
  }

  public getWorkCommitment():void {
    this.store.dispatch(new GetWorkCommitmentByPage(this.pageNumber, this.pageSize));
    
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  public allRegionsChange(event: { checked: boolean }): void {
    this.allRegionsSelected = event.checked;
    const regionsControl = this.PayRatesFormGroup.controls['regionIds'];
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
    const locationsControl = this.PayRatesFormGroup.controls['locationIds'];
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
    const departmentsControl = this.PayRatesFormGroup.controls['departmentIds'];
    if (this.allDepartmentsSelected) {
      departmentsControl.setValue(null);
      departmentsControl.disable();
      this.deptId = [];
      for(let i=0; i<this.departments.length; i++){
        this.deptId.push(this.departments[i].id);
      }
      this.store.dispatch(new GetSkillsbyDepartment(this.deptId));
      this.skillbydepartment$.pipe(takeUntil(this.componentDestroy())).subscribe((skills) => {
        if(skills && skills.length > 0){
          this.skills = sortByField(skills, "name");
        } else {
          this.skills = [];
          this.PayRatesFormGroup.get("skillIds")?.setValue(null);
        }
        this.cd.markForCheck();
      });

    } else {
      departmentsControl.enable();
    }
  }

  public loadData(): void {
    this.store.dispatch(new GetAssignedSkillsByOrganization());
    this.getWorkCommitment();
    this.filters = this.PayRatesFormGroup.getRawValue();
    this.store.dispatch(new GetPayRates({  
      pageNumber: this.currentPage, 
      pageSize: this.pageSize,
      ...this.filters }));
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
      new ExportPayRateSetup(
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
    if (this.PayRatesFormGroup.dirty) {
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
    if (this.PayRatesFormGroup.valid) {
      const effectiveDate: Date = this.PayRatesFormGroup.controls['effectiveDate'].value;
      if (effectiveDate && !this.isEdit) {
        effectiveDate.setHours(0, 0, 0, 0);
      }

      const billRate: PayRateSetupPost = {
        Id: this.editRecordId,
        payType: this.PayRatesFormGroup.controls['payType'].value,
        regionIds: this.allRegionsSelected ? [] : this.PayRatesFormGroup.controls['regionIds'].value,
        locationIds: this.allLocationsSelected
          ? []
          : this.PayRatesFormGroup.controls['locationIds'].value,
        departmentIds: this.allDepartmentsSelected
          ? []
          : this.PayRatesFormGroup.controls['departmentIds'].value,
        skillIds: this.PayRatesFormGroup.controls['skillIds'].value,
        payRateConfigId: this.PayRatesFormGroup.controls['payRateConfigId'].value,
        orderTypes: this.PayRatesFormGroup.controls['orderTypes'].value.length === this.orderTypes.length
          ? [] 
          : this.PayRatesFormGroup.controls['orderTypes'].value,
        amountMultiplier: this.PayRatesFormGroup.controls['amountMultiplier'].value,
        effectiveDate: effectiveDate,
        workCommitmentIds: this.PayRatesFormGroup.controls["WorkCommitmentIds"].value,
        organizationId: this.orgId,
      };
      this.billRateToPost = billRate;
      this.filters = this.payRateFilterFormGroup.getRawValue();
      const filters = {
        pageNumber: this.currentPage,
        pageSize: this.pageSize,
        ...this.filters,
      };
      this.store.dispatch(new SaveUpdatePayRate(billRate, filters));
    } else {
      this.store.dispatch(new ShowToast(MessageTypes.Error, "Form should Not be Invalid"));
      this.PayRatesFormGroup.markAllAsTouched();
    }
  }

  public onEditRecordButtonClick(data: PayRateSetup, event: Event): void {
    this.addActiveCssClass(event);
    this.isEdit = true;
    this.editRecordId = data.payRateSettingId;

    setTimeout(() => this.setupFormValues(data));

    this.store.dispatch(new ShowSideDialog(true));
  }

  public onRemoveRecordButtonClick(data: PayRateSetup, event: any): void {
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
          this.store.dispatch(new DeletePayRatesById(data.payRateSettingId, filters));
        }
        this.removeActiveCssClass();
      });
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
    this.filterService.removeValue(event, this.payRateFilterFormGroup, this.filterColumns);
  }

  private clearFilters(): void {
    this.payRateFilterFormGroup.reset();
    this.filteredItems = [];
    this.filteredItems$.next(this.filteredItems.length);
    this.currentPage = 1;
    this.filters = {};
  }

  public onFilterClearAll(): void {
    this.clearFilters();
    this.store.dispatch(
      new GetPayRates({
        pageNumber: this.currentPage,
        pageSize: this.pageSize,
        ...this.filters,
      })
    );
  }

  public onFilterClose() {
    this.payRateFilterFormGroup.setValue({
      regionIds: this.filters.regionIds || [],
      locationIds: this.filters.locationIds || [],
      departmentIds: this.filters.departmentIds || [],
      skillIds: this.filters.skillIds || [],
      orderTypes: this.filters.orderTypes || [],
      payRatesCategory: this.filters.payRatesCategory || [],
      payType: this.filters.payTypes || [],
      effectiveDate: this.filters.effectiveDate || null,
      PayRateTitleOption : this.filters.payRateConfigId || []
    });
    this.filteredItems = this.filterService.generateChips(
      this.payRateFilterFormGroup,
      this.filterColumns,
      this.datePipe
    );
    this.filteredItems$.next(this.filteredItems.length);
  }

  public onFilterApply(): void {
    this.filters = this.payRateFilterFormGroup.getRawValue();
    this.filteredItems = this.filterService.generateChips(
      this.payRateFilterFormGroup,
      this.filterColumns,
      this.datePipe
    );
    this.filteredItems$.next(this.filteredItems.length);
    this.store.dispatch(
      new GetPayRates({
        pageNumber: this.currentPage,
        pageSize: this.pageSize,
        ...this.filters,
      })
    );
    this.store.dispatch(new ShowFilterDialog(false));
  }

  private createFormGroups(): void {
      this.PayRatesFormGroup = new FormGroup({
        regionIds: new FormControl([], [Validators.required]),
        locationIds: new FormControl([], [Validators.required]),
        departmentIds: new FormControl([], [Validators.required]),
        skillIds: new FormControl([], [Validators.required]),
        orderTypes: new FormControl([], [Validators.required]),
        payRatesCategory: new FormControl({ value: '', disabled: true }),
        payRateConfigId: new FormControl([], [Validators.required]),
        amountMultiplier: new FormControl("", [Validators.required, Validators.maxLength(11)]),
        effectiveDate: new FormControl(null, [Validators.required]),
        WorkCommitmentIds : new FormControl([], [Validators.required]), 
        payType : new FormControl([], [Validators.required]),
      });

    this.payRateFilterFormGroup = this.formBuilder.group({
      regionIds: [[]],
      locationIds: [[]],
      departmentIds: [[]],
      skillIds: [[]],
      PayRateTitleOption: [[]],
      orderTypes: [[]],
      effectiveDate: [null],
      payRatesCategory: [[]],
      payType : [[]]
    });
  }

  private clearFormDetails(): void {
    this.PayRatesFormGroup.reset();
    this.isEdit = false;
    this.editRecordId = undefined;
    this.billRateToPost = undefined;
    this.removeActiveCssClass();
    this.allRegionsSelected = this.allLocationsSelected = this.allDepartmentsSelected = false;
    this.allRegionsChange({ checked: false });
    this.allLocationsChange({ checked: false });
    this.allDepartmentsChange({ checked: false });
  }

  private regionChangedHandler(): void {
    this.PayRatesFormGroup
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

        this.PayRatesFormGroup.controls['locationIds'].setValue(null);
        this.PayRatesFormGroup.controls['departmentIds'].setValue(null);
        this.cd.markForCheck();
      });
  }

  private locationChangedHandler(): void {
    this.PayRatesFormGroup
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

        this.PayRatesFormGroup.controls['departmentIds'].setValue(null);
        this.cd.markForCheck();
      });
  }


  private departmentChangedHandler(): void {
    this.PayRatesFormGroup
      .get('departmentIds')
      ?.valueChanges.pipe(takeUntil(this.unsubscribe$))
      .subscribe((departmentIds: number[]) => {
        if(departmentIds && departmentIds.length > 0){
          this.store.dispatch(new GetSkillsbyDepartment(departmentIds));
          this.skillbydepartment$.pipe(takeUntil(this.componentDestroy())).subscribe((skills) => {
            if(skills && skills.length > 0){
              this.skills = sortByField(skills, "name");
            } else {
              this.skills = [];
              this.PayRatesFormGroup.get("skillIds")?.setValue(null);
            }
            this.cd.markForCheck();
          });  
        }
      });
  }

  private setupFormValues(data: PayRateSetup): void {
    this.allRegionsChange({ checked: !data.regionId });
    this.allLocationsChange({ checked: !data.locationId });
    this.allDepartmentsChange({ checked: !data.departmentId });
    if (!data.regionId) {
      this.allRegionsSelected = true;
      this.PayRatesFormGroup.controls['regionIds'].setValue(null);
    } else {
      const locations: OrganizationLocation[] = [];
      const selectedRegion = this.orgRegions.find((region) => region.id === data.regionId);
      locations.push(...(selectedRegion?.locations as any));
      this.locations = sortByField(locations, 'name');
      this.PayRatesFormGroup.controls['regionIds'].setValue([data.regionId], {emitEvent: false});
    }

    if (!data.locationId) {
      this.allLocationsSelected = true;
      this.PayRatesFormGroup.controls['locationIds'].setValue(null);
    } else {
      const departments: OrganizationDepartment[] = [];
      const selectedLocation = this.locations.find((location) => location.id === data.locationId);
      departments.push(...(selectedLocation?.departments as []));
      this.departments = sortByField(departments, 'name');
      this.PayRatesFormGroup.controls['locationIds'].setValue([data.locationId], {emitEvent: false});
    }

    if (!data.departmentId) {
      this.allDepartmentsSelected = true;
      this.PayRatesFormGroup.controls['departmentIds'].setValue(null);
    } else {
      this.PayRatesFormGroup.controls['departmentIds'].setValue([data.departmentId]);
    }

    if (data.skills.length === 0) {
      this.PayRatesFormGroup.controls['skillIds'].setValue(null);
    } else {
      this.skillsEdit = [];
      for(let i=0; i < data.skills.length; i++){
        this.skillsEdit.push(data.skills[i].skillId);
      }
      this.PayRatesFormGroup.controls['skillIds'].setValue(this.skillsEdit);
    }
    if (data.orderTypes.length === 0) {
      this.PayRatesFormGroup.controls['orderTypes'].setValue(this.orderTypes.map((type) => type.id));
    } else {
      this.PayRatesFormGroup.controls['orderTypes'].setValue(data.orderTypes);
    }

    if (data.workCommitments.length === 0) {
      this.PayRatesFormGroup.controls['WorkCommitmentIds'].setValue(null);
    } else {
      this.workcommitmentsedit = [];
      for(let i=0; i < data.workCommitments.length; i++){
        this.workcommitmentsedit.push(data.workCommitments[i].workCommitmentId);
      }
      this.PayRatesFormGroup.controls['WorkCommitmentIds'].setValue(this.workcommitmentsedit);
    }
    
    this.PayRatesFormGroup.controls['amountMultiplier'].setValue(data.amountMultiplier);
    this.PayRatesFormGroup.controls['effectiveDate'].setValue(data.effectiveDate);
    this.PayRatesFormGroup.controls['payType'].setValue(data.payType);
    this.PayRatesFormGroup.controls['payRateConfigId'].setValue(data.payRateConfigId);
  }

}
