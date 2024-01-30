import { OrderManagementState } from '@agency/store/order-management.state';
import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { AbstractControl, FormControl, FormGroup } from '@angular/forms';
import { Actions, ofActionSuccessful, Select, Store } from '@ngxs/store';
import { FieldSettingsModel, MultiSelectComponent } from '@syncfusion/ej2-angular-dropdowns';
import { BehaviorSubject, debounceTime, filter, forkJoin, Observable, takeUntil, tap } from 'rxjs';

import { isEmpty, uniqBy } from 'lodash';

import { ControlTypes, ValueType } from '@shared/enums/control-types.enum';
import { OrderTypeOptions } from '@shared/enums/order-type';
import { AgencyOrderFilteringOptions } from '@shared/models/agency.model';
import { GetOrganizationStructure } from '@agency/store/order-management.actions';
import { OrganizationLocation, OrganizationRegion, OrganizationStructure } from '@shared/models/organization.model';
import { ShowFilterDialog } from 'src/app/store/app.actions';
import { getDepartmentFromLocations, getLocationsFromRegions, getRegionsFromOrganizationStructure } from './agency-order-filters.utils';
import { DestroyableDirective } from '@shared/directives/destroyable.directive';
import { AgencyOrderManagementTabs, orderLockList, clearedToStartList } from '@shared/enums/order-management-tabs.enum';
import { CandidatesStatusText, FilterOrderStatusText } from '@shared/enums/status';
import { CandidatStatus } from '@shared/enums/applicant-status.enum';
import { placeholderDate } from '@shared/constants/placeholder-date';
import { formatDate } from '@shared/constants/format-date';
import { MaskedDateTimeService } from '@syncfusion/ej2-angular-calendars';
import { datepickerMask } from '@shared/constants/datepicker-mask';
import { sortByField } from '@shared/helpers/sort-by-field.helper';
import { OrderManagementAgencyService } from '@agency/order-management/order-management-agency.service';
import { ORDER_MASTER_SHIFT_NAME_LIST } from '@shared/constants/order-master-shift-name-list';
import { AllCandidateStatuses, filterClearedToStartList, filterOrderLockList } from '@client/order-management/constants';
import { SecurityState } from 'src/app/security/store/security.state';
import { Organisation } from '@shared/models/visibility-settings.model';
import { GetOrganizationsStructureAll } from 'src/app/security/store/security.actions';
import { UserState } from 'src/app/store/user.state';
import { OrderStatusesList } from '@shared/models/order-management.model';

enum RLDLevel {
  Orginization,
  Region,
  Location,
}

@Component({
  selector: 'app-agency-order-filters',
  templateUrl: './agency-order-filters.component.html',
  styleUrls: ['./agency-order-filters.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [MaskedDateTimeService],
})
export class AgencyOrderFiltersComponent extends DestroyableDirective implements OnInit, AfterViewInit {
  @ViewChild('regionMultiselect') regionMultiselect: MultiSelectComponent;
  @ViewChild('organizationMultiselect') organizationMultiselect: MultiSelectComponent;
  @ViewChild('locationMultiselect') locationMultiselect: MultiSelectComponent;
  @ViewChild('orderStatusFilter') public readonly orderStatusFilter: MultiSelectComponent;
  @Input() isEnableClearedToStart$: BehaviorSubject<boolean> =new BehaviorSubject<boolean>(false);
  @Input() form: FormGroup;
  @Input() filterColumns: any;
  @Input() activeTab: AgencyOrderManagementTabs;
  @Output() setDefault = new EventEmitter();
  @Output() mappedOrganizations = new EventEmitter();

  public AgencyOrderManagementTabs = AgencyOrderManagementTabs;

  @Select(OrderManagementState.orderFilteringOptions)
  orderFilteringOptions$: Observable<AgencyOrderFilteringOptions>;

  @Select(OrderManagementState.gridFilterRegions)
  gridFilterRegions$: Observable<OrganizationRegion[]>;

  @Select(SecurityState.organisations)
  organizations$: Observable<Organisation[]>;

  public readonly specialProjectCategoriesFields: FieldSettingsModel = { text: 'projectType', value: 'id' };
  public readonly projectNameFields: FieldSettingsModel = { text: 'projectName', value: 'id' };
  public readonly poNumberFields: FieldSettingsModel = { text: 'poNumber', value: 'id' };
  public readonly shiftFields: FieldSettingsModel = { text: 'name', value: 'id' };
  public orderLockList = orderLockList;
  public readonly formatDate = formatDate;
  public readonly placeholderDate = placeholderDate;
  public readonly datepickerMask = datepickerMask;
  public shift = ORDER_MASTER_SHIFT_NAME_LIST;
  partneredOrganizations:OrganizationStructure[] = [];
  public isAgency:boolean = false;
  public isAgencyVisibilityFlagEnabled = false;
  public clearedToStartList = clearedToStartList;

  public optionFields = {
    text: 'name',
    value: 'id',
  };
  public organizationFields = {
    text: 'organizationName',
    value: 'organizationId',
  };
  public statusFields = {
    text: 'statusText',
    value: 'status',
  };
  public filterStatusFields = {
    text: 'filterStatus',
    value: 'filterStatus',
  };
  get regionIdsControl(): AbstractControl {
    return this.form.get('regionIds') as AbstractControl;
  }

  get locationIdsControl(): AbstractControl {
    return this.form.get('locationIds') as AbstractControl;
  }

  get departmentsIdsControl(): AbstractControl {
    return this.form.get('departmentsIds') as AbstractControl;
  }

  constructor(
    private store: Store,
    private actions$: Actions,
    private orderManagementAgencyService: OrderManagementAgencyService,
    private cd: ChangeDetectorRef,
  ) {
    super();
  }

  ngOnInit(): void {
    this.isAgencyVisibilityFlagEnabled = this.store.selectSnapshot(SecurityState.isAgencyVisibilityFlagEnabled);
    this.onOrderFilteringOptionsChange();
    const user = this.store.selectSnapshot(UserState.user);
    if(this.isAgencyVisibilityFlagEnabled){
      this.agencyOrganizations();
      if(user){
        this.store.dispatch(new GetOrganizationsStructureAll(user?.id));
     }
    }
  }

  ngAfterViewInit(): void {
    forkJoin([
      this.onShowFilterDialog(),
      this.onOrganizationIdsControlChange(),
      this.onGridFilterRegions(),
      this.onRegionIdsControlChange(),
      this.onLocationIdsControlChange(),
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe();
  }

  private onOrganizationIdsControlChange(): Observable<number[]> {
    const organizationIdsControl = this.form.get('organizationIds') as AbstractControl;

    return organizationIdsControl.valueChanges.pipe(
      tap((value: number[]) => {
        if (isEmpty(value)) {
          this.clearRLDByLevel(RLDLevel.Orginization);
        } else {
          if(this.isAgencyVisibilityFlagEnabled){
            let filteredOrg = this.partneredOrganizations.filter(el => {
              return value.find(element => {
                return element == el.organizationId;
              });
            });
            const regions =  getRegionsFromOrganizationStructure(filteredOrg);
            this.filterColumns.regionIds.dataSource = sortByField(regions, 'name');
          }else{
             this.store.dispatch(new GetOrganizationStructure(value));
          }

        }
        this.cd.detectChanges();
      })
    );
  }

  private onRegionIdsControlChange(): Observable<number[]> {
    return this.regionIdsControl.valueChanges.pipe(
      tap((value: number[]) => {
        if (isEmpty(value)) {
          this.clearRLDByLevel(RLDLevel.Region);
        } else {
          const regions: OrganizationRegion[] = this.filterColumns.regionIds.dataSource.filter(
            ({ id }: { id: number }) => value.includes(id)
          );
          this.filterColumns.locationIds.dataSource = sortByField(getLocationsFromRegions(regions), 'name');
        }
        this.cd.detectChanges();
      })
    );
  }

  private onLocationIdsControlChange(): Observable<number[]> {
    return this.locationIdsControl.valueChanges.pipe(
      tap((value: number[]) => {
        if (isEmpty(value)) {
          this.clearRLDByLevel(RLDLevel.Location);
        } else {
          const locations: OrganizationLocation[] = this.filterColumns.locationIds.dataSource.filter(
            ({ id }: { id: number }) => value.includes(id)
          );
          this.filterColumns.departmentsIds.dataSource = sortByField(getDepartmentFromLocations(locations), 'name');
        }
        this.cd.detectChanges();
      })
    );
  }

  private onGridFilterRegions(): Observable<unknown> {
    return this.actions$.pipe(
      ofActionSuccessful(GetOrganizationStructure),
      tap(() => {
        const regions = this.store.selectSnapshot(OrderManagementState.gridFilterRegions);
        this.filterColumns.regionIds.dataSource = sortByField(regions, 'name');
        this.cd.detectChanges();
      })
    );
  }

  private onShowFilterDialog(): Observable<unknown> {
    return this.actions$.pipe(
      ofActionSuccessful(ShowFilterDialog),
      debounceTime(100),
      tap(() => {
        this.organizationMultiselect.refresh();
        this.locationMultiselect.refresh();
        this.orderStatusFilter.refresh();
        this.regionMultiselect.refresh();
      })
    );
  }

  private clearRLDByLevel(level: RLDLevel): void {
    this.departmentsIdsControl.reset();
    this.filterColumns.departmentsIds.dataSource = [];

    if (level === RLDLevel.Orginization || level === RLDLevel.Region) {
      this.locationIdsControl.reset();
      this.filterColumns.locationIds.dataSource = [];
    }

    if (level === RLDLevel.Orginization) {
      this.regionIdsControl.reset();
      this.filterColumns.regionIds.dataSource = [];
    }
  }

  private onOrderFilteringOptionsChange(): void {
    this.orderFilteringOptions$
      .pipe(
        filter((options) => !!options),
        takeUntil(this.destroy$)
      )
      .subscribe(({
                    candidateStatuses,
                    masterSkills,
                    orderStatuses,
                    partneredOrganizations,
                    poNumbers,
                    projectNames,
                    specialProjectCategories,
                    reorderStatuses
                  }) => {
        let statuses = [];
        let candidateStatusesData = [];
        const statusesByDefault = [
          CandidatStatus.Applied,
          CandidatStatus.Shortlisted,
          CandidatStatus.Offered,
          CandidatStatus.Accepted,
          CandidatStatus.OnBoard,
          CandidatStatus.Withdraw,
          CandidatStatus.Offboard,
          CandidatStatus.Rejected,
          CandidatStatus.Cancelled,
        ];
        if (this.activeTab === AgencyOrderManagementTabs.ReOrders) {
          statuses = orderStatuses.filter((status) =>
          [FilterOrderStatusText.Open, FilterOrderStatusText['In Progress'], FilterOrderStatusText.Filled, FilterOrderStatusText.Closed].includes(status.status)
          ).map(data => data.status);
          candidateStatusesData = candidateStatuses.filter((status) =>
            [
              CandidatesStatusText['Bill Rate Pending'],
              CandidatesStatusText['Offered Bill Rate'],
              CandidatesStatusText.Onboard,
              CandidatesStatusText.Rejected,
              CandidatStatus.Cancelled,
            ].includes(status.status)
          );
        } else if (this.activeTab === AgencyOrderManagementTabs.PerDiem) {
          statuses = orderStatuses.filter((status) =>
            ![FilterOrderStatusText['In Progress'], FilterOrderStatusText.Filled,FilterOrderStatusText.OrdersOpenPositions].includes(status.status)
          ).map(data => data.status);
          candidateStatusesData = candidateStatuses.filter((status) => statusesByDefault.includes(status.status));
        }
        else if (this.activeTab === AgencyOrderManagementTabs.PermPlacement) {
          statuses = orderStatuses.filter((status) =>
            ![FilterOrderStatusText.OrdersOpenPositions].includes(status.status)
          ).map(data => data.status);
          candidateStatusesData = candidateStatuses.filter((status) => statusesByDefault.includes(status.status));
        }
         else {
          statuses = orderStatuses;
          candidateStatusesData = candidateStatuses.filter((status) => !AllCandidateStatuses.includes(status.status)).sort((a, b) => a.filterStatus && b.filterStatus ? a.filterStatus.localeCompare(b.filterStatus) : a.statusText.localeCompare(b.statusText));
        }
        if(!this.isAgencyVisibilityFlagEnabled){
           this.filterColumns.organizationIds.dataSource = partneredOrganizations;
        }
        this.filterColumns.skillIds.dataSource = masterSkills;
        this.filterColumns.candidateStatuses.dataSource = candidateStatusesData;
        this.filterColumns.orderStatuses.dataSource = statuses;
        this.filterColumns.reorderStatuses.dataSource = reorderStatuses;
        this.filterColumns.projectTypeIds.dataSource = specialProjectCategories;
        this.filterColumns.projectNameIds.dataSource = projectNames;
        this.filterColumns.poNumberIds.dataSource = poNumbers;
        this.filterColumns.shift.dataSource = this.shift;
        this.setDefaultFilter();
        this.cd.detectChanges();
      });
  }

  private agencyOrganizations(): void{
    this.organizations$.pipe(takeUntil(this.destroy$)).subscribe((data) => {
      this.filterColumns.organizationIds.dataSource = [];
      if (data != null && data.length > 0) {
        let modifedOrgStructure =data.map(({ organizationId, name, regions }) => ({ organizationId: organizationId, organizationName: name, regions:regions }));
        this.filterColumns.organizationIds.dataSource = uniqBy(modifedOrgStructure, 'organizationId');
        this.partneredOrganizations = uniqBy(modifedOrgStructure, 'organizationId');
      }
    });
  }

  private getReorderStatusLists(): string[] {
    if (this.activeTab === AgencyOrderManagementTabs.PerDiem) {
      const reorderStatusList = this.filterColumns.reorderStatuses.dataSource
        .filter((source: {status: string}) => {
          return source.status !== FilterOrderStatusText.Closed;
        }).map((source: {status: string}) => source.status);
      this.form.get('reorderStatuses')?.setValue(reorderStatusList);
      return reorderStatusList;
    }

    return [];
  }

  private setDefaultFilter(): void {
    const { selectedOrderAfterRedirect } = this.orderManagementAgencyService;
    if (!this.activeTab) {
      return;
    }
    if (!selectedOrderAfterRedirect) {
      const statusFields: OrderStatusesList = {
        orderStatuses: [],
        reorderStatuses: [],
      }

      const orderStatuses = this.filterColumns.orderStatuses.dataSource.filter((data:any) => data !== FilterOrderStatusText["Closed"]);

      const reorderStatuses = this.getReorderStatusLists();
      statusFields.reorderStatuses = reorderStatuses;
      this.form.get('orderStatuses')?.setValue(orderStatuses);
      statusFields.orderStatuses = orderStatuses;
      this.setDefault.emit(statusFields);
    } else {
      this.setDefault.emit({
        orderStatuses: [],
        reorderStatuses: [],
      });
    }
    this.mappedOrganizations.emit(this.filterColumns.organizationIds.dataSource)
  }

  static generateFiltersForm(): FormGroup {
    return new FormGroup({
      orderPublicId: new FormControl(null),
      organizationIds: new FormControl([]),
      regionIds: new FormControl([]),
      locationIds: new FormControl([]),
      departmentsIds: new FormControl([]),
      skillIds: new FormControl([]),
      orderTypes: new FormControl([]),
      candidateStatuses: new FormControl([]),
      candidatesCountFrom: new FormControl(null),
      candidatesCountTo: new FormControl(null),
      orderStatuses: new FormControl([]),
      reorderStatuses: new FormControl([]),
      billRateFrom: new FormControl(null),
      jobTitle: new FormControl(null),
      reOrderDate: new FormControl(null),
      billRateTo: new FormControl(null),
      openPositions: new FormControl(null),
      jobStartDate: new FormControl(null),
      jobEndDate: new FormControl(null),
      annualSalaryRangeFrom: new FormControl(null),
      annualSalaryRangeTo: new FormControl(null),
      clearedToStart: new FormControl(null),
      creationDateFrom: new FormControl(null),
      creationDateTo: new FormControl(null),
      distributedOnFrom: new FormControl(null),
      distributedOnTo: new FormControl(null),
      firstNamePattern: new FormControl(null),
      lastNamePattern: new FormControl(null),
      projectTypeIds: new FormControl(null),
      projectNameIds: new FormControl(null),
      poNumberIds: new FormControl(null),
      shift: new FormControl(null),
      orderLocked: new FormControl(null),
    });
  }

  static generateFilterColumns(isAgencyVisibilityFlag:boolean = false): any {
    return {
      orderPublicId: { type: ControlTypes.Text, valueType: ValueType.Text },
      organizationIds: {
        type: ControlTypes.Multiselect,
        valueType: ValueType.Id,
        dataSource: [],
        valueField: !isAgencyVisibilityFlag ? 'name' : 'organizationName',
        valueId: !isAgencyVisibilityFlag ? 'id' : 'organizationId',
      },
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
      departmentsIds: {
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
      orderTypes: {
        type: ControlTypes.Multiselect,
        valueType: ValueType.Id,
        dataSource: OrderTypeOptions,
        valueField: 'name',
        valueId: 'id',
      },
      candidateStatuses: {
        type: ControlTypes.Multiselect,
        valueType: ValueType.Id,
        dataSource: [],
        valueField: 'filterStatus',
        valueId: 'filterStatus',
      },
      candidatesCountFrom: { type: ControlTypes.Text, valueType: ValueType.Text },
      candidatesCountTo: { type: ControlTypes.Text, valueType: ValueType.Text },
      orderStatuses: {
        type: ControlTypes.Multiselect,
        valueType: ValueType.Id,
        dataSource: [],
        valueField: 'statusText',
        valueId: 'status',
      },
      reorderStatuses: {
        type: ControlTypes.Multiselect,
        valueType: ValueType.Id,
        dataSource: [],
        valueField: 'statusText',
        valueId: 'status',
      },
      jobStartDate: { type: ControlTypes.Date, valueType: ValueType.Text },
      jobTitle: { type: ControlTypes.Text, valueType: ValueType.Text },
      billRateFrom: { type: ControlTypes.Text, valueType: ValueType.Text },
      billRateTo: { type: ControlTypes.Text, valueType: ValueType.Text },
      openPositions: { type: ControlTypes.Text, valueType: ValueType.Text },
      reOrderDate: { type: ControlTypes.Date, valueType: ValueType.Text },
      jobEndDate: { type: ControlTypes.Date, valueType: ValueType.Text },
      annualSalaryRangeFrom: { type: ControlTypes.Text, valueType: ValueType.Text },
      annualSalaryRangeTo: { type: ControlTypes.Text, valueType: ValueType.Text },
      creationDateFrom: { type: ControlTypes.Date, valueType: ValueType.Text },
      creationDateTo: { type: ControlTypes.Date, valueType: ValueType.Text },
      distributedOnFrom: { type: ControlTypes.Date, valueType: ValueType.Text },
      distributedOnTo: { type: ControlTypes.Date, valueType: ValueType.Text },
      firstNamePattern: { type: ControlTypes.TextOrNull, valueType: ValueType.Text },
      lastNamePattern: { type: ControlTypes.TextOrNull, valueType: ValueType.Text },
      projectTypeIds: {
        type: ControlTypes.Multiselect,
        valueType: ValueType.Id,
        dataSource: [],
        valueField: 'projectType',
        valueId: 'id',
      },
      projectNameIds: {
        type: ControlTypes.Multiselect,
        valueType: ValueType.Id,
        dataSource: [],
        valueField: 'projectName',
        valueId: 'id',
      },
      poNumberIds: {
        type: ControlTypes.Multiselect,
        valueType: ValueType.Id,
        dataSource: [],
        valueField: 'poNumber',
        valueId: 'id',
      },
      shift: {
        type: ControlTypes.Multiselect,
        valueType: ValueType.Id,
        dataSource: [],
        valueField: 'name',
        valueId: 'id',
      },
      orderLocked: {
        type: ControlTypes.Dropdown,
        valueType: ValueType.Id,
        dataSource: filterOrderLockList,
        valueField: 'name',
        valueId: 'id',
      },
      clearedToStart: {
        type: ControlTypes.Dropdown,
        valueType: ValueType.Id,
        dataSource: filterClearedToStartList,
        valueField: 'name',
        valueId: 'id',
      },
    };
  }
  public onSelect(args:any) {
    if (args.itemData.status == 'OrdersOpenPositions') {
      var liCollections = document.querySelectorAll(
        '.e-popup.custom .e-list-item'
      );
      for (var i = 0; i < liCollections.length; i++) {
        if ((liCollections[i] as any).innerText != 'Order(s) - Open Positions') {
          liCollections[i].classList.add('e-disabled');
          liCollections[i].classList.add('e-overlay');
        }
      }
    }
    else{
      var liCollections = document.querySelectorAll(
        '.e-popup.custom .e-list-item'
      );
      for (var i = 0; i < liCollections.length; i++) {
        if ((liCollections[i] as any).innerText == 'Order(s) - Open Positions') {
          liCollections[i].classList.add('e-disabled');
          liCollections[i].classList.add('e-overlay');
        }
      }
    }
  }
  public orderStatusSelect(){
    let orderStatus = this.form.get("orderStatuses")?.value;
    if (orderStatus == 'OrdersOpenPositions') {
      var liCollections = document.querySelectorAll(
        '.e-popup.custom .e-list-item'
      );
      for (var i = 0; i < liCollections.length; i++) {
        if ((liCollections[i] as any).innerText != 'Order(s) - Open Positions') {
          liCollections[i].classList.add('e-disabled');
          liCollections[i].classList.add('e-overlay');
        }
      }
    }
    else if (orderStatus != 'OrdersOpenPositions' && orderStatus.length != 0) {
      var liCollections = document.querySelectorAll(
        '.e-popup.custom .e-list-item'
      );
      for (var i = 0; i < liCollections.length; i++) {
        if ((liCollections[i] as any).innerText == 'Order(s) - Open Positions') {
          liCollections[i].classList.add('e-disabled');
          liCollections[i].classList.add('e-overlay');
        }
      }
    }
  }
}
