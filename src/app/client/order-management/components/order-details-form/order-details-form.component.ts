import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AbstractControl, FormArray, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { Select, Store } from '@ngxs/store';
import {
  combineLatest,
  debounceTime,
  filter,
  Observable,
  skip,
  switchMap,
  take,
  takeUntil,
  tap,
  throttleTime,
} from 'rxjs';
import { ChangeEventArgs, FieldSettingsModel, FilteringEventArgs, highlightSearch } from '@syncfusion/ej2-angular-dropdowns';

import {
  GetDepartmentsByLocationId,
  GetLocationsByRegionId,
  GetOrganizationSettings,
} from '@organization-management/store/organization-management.actions';
import {
  ClearSelectedOrder,
  ClearSuggestions,
  GetContactDetails,
  GetSuggestedDetails,
  SetIsDirtyOrderForm,
  SetPredefinedBillRatesData,
} from '@client/store/order-managment-content.actions';

import { OrganizationManagementState } from '@organization-management/store/organization-management.state';
import { OrderManagementContentState } from '@client/store/order-managment-content.state';

import { SystemType } from '@shared/enums/system-type.enum';
import { Location } from '@shared/models/location.model';
import { Region } from '@shared/models/region.model';
import { Department } from '@shared/models/department.model';
import { ListOfSkills } from '@shared/models/skill.model';
import { AssociateAgency } from '@shared/models/associate-agency.model';
import { JobDistributionModel } from '@shared/models/job-distribution.model';
import { Order, OrderContactDetails, OrderWorkLocation, SuggestedDetails } from '@shared/models/order-management.model';
import { Document } from '@shared/models/document.model';
import { AbstractPermission } from '@shared/helpers/permissions';
import { OrderType, OrderTypeOptions } from '@shared/enums/order-type';
import { Duration } from '@shared/enums/durations';
import { OrderJobDistribution } from '@shared/enums/job-distibution';

import {
  datepickerMask,
  ORDER_CONTACT_DETAIL_TITLES,
  ORDER_EDITS,
  ORDER_PER_DIEM_EDITS,
  OrganizationalHierarchy,
  OrganizationSettingKeys,
} from '@shared/constants';
import PriceUtils from '@shared/utils/price.utils';
import { MaskedDateTimeService } from '@syncfusion/ej2-angular-calendars';
import { SkillCategory } from '@shared/models/skill-category.model';
import { ProjectSpecialData } from '@shared/models/project-special-data.model';
import { OrderStatus } from '@shared/enums/order-management';
import { disableControls } from '@shared/utils/form.utils';
import { AlertService } from '@shared/services/alert.service';
import { GetPredefinedCredentials } from '@order-credentials/store/credentials.actions';
import { Comment } from '@shared/models/comment.model';
import { ChangeArgs } from '@syncfusion/ej2-angular-buttons';
import { BillRate } from '@shared/models';
import { OrderManagementContentService } from '@shared/services/order-management-content.service';
import { OrganizationSettingsGet } from '@shared/models/organization-settings.model';
import { CommentsService } from '@shared/services/comments.service';
import { SettingsHelper } from '@core/helpers/settings.helper';
import { SettingsKeys } from '@shared/enums/settings';
import { RejectReasonState } from '@organization-management/store/reject-reason.state';
import { RejectReasonPage, RejectReasonwithSystem } from '@shared/models/reject-reason.model';
import { ORDER_DURATION_LIST } from '@shared/constants/order-duration-list';
import { distributionSource, ORDER_JOB_DISTRIBUTION } from '@shared/constants/order-job-distribution-list';
import { ORDER_MASTER_SHIFT_NAME_LIST } from '@shared/constants/order-master-shift-name-list';
import { DurationService } from '@shared/services/duration.service';
import { UserState } from 'src/app/store/user.state';
import { DateTimeHelper } from '@core/helpers';
import { MasterShiftName } from '@shared/enums/master-shifts-id.enum';
import { OrderDetailsService } from '@client/order-management/components/order-details-form/services';
import {
  AssociateAgencyFields,
  ControlsForDisable,
  DepartmentField,
  DepartmentFields,
  ExtensionControls,
  GeneralInfoControls,
  JobDistributionControls,
  ListOfGeneralOrderControls,
  ListOfPermPlacementControls,
  LocationField,
  OrderTypeControls,
  OrganizationStateWithKeyCodeFields,
  PoNumberFields,
  ProjectNameFields,
  ReasonRequisitionFields,
  RegionField,
  SkillFields,
  SkillsField,
  SpecialProjectCategoriesFields,
} from '@client/order-management/components/order-details-form/constants/order-details.constant';
import { isNil } from 'lodash';
import { SettingsViewService } from '@shared/services';
import { TierLogic } from '@shared/enums/tier-logic.enum';
import {
  ControlsConfig,
  ExtensionsControlConfig,
  SpecialProject,
} from '@client/order-management/components/order-details-form/interfaces';
import {
  clearValidatorsToForm,
  generateControlsConfig, getFilteredJobDistribution,
  setValidatorsToForm, updateValidationToForm, valueMapperForGeneralInformation,
} from '@client/order-management/components/order-details-form/order-details.helper';
import {
  GeneralInformationControlsConfig,
  GeneralInformationControlsConfigForPerDiem,
  SpecialProjectControlsConfig,
} from '@client/order-management/components/order-details-form/constants';
import { JobClassifications, OptionFields } from '@client/order-management/constants';
import { PartialSearchService } from '@shared/services/partial-search.service';
import { PartialSearchDataType } from '@shared/models/partial-search-data-source.model';
import { PermissionService } from '../../../../security/services/permission.service';

@Component({
  selector: 'app-order-details-form',
  templateUrl: './order-details-form.component.html',
  styleUrls: ['./order-details-form.component.scss'],
  providers: [MaskedDateTimeService],
})
export class OrderDetailsFormComponent extends AbstractPermission implements OnInit {
  @Input() isActive = false;

  @Input() set disableOrderType(value: boolean) {
    if (value) {
      this.orderTypeForm.controls['orderType'].disable();
    }
  }

  @Output() orderTypeChanged = new EventEmitter<OrderType>();
  @Output() hourlyRateSync = new EventEmitter<string>();
  @Input() public externalCommentConfiguration?: boolean | null;

  public orderTypeForm: FormGroup;
  public generalInformationForm: FormGroup;
  public jobDistributionForm: FormGroup;
  public jobDescriptionForm: FormGroup;
  public contactDetailsForm: FormGroup;
  public workLocationForm: FormGroup;
  public specialProject: FormGroup;
  public contactDetailsFormArray: FormArray;
  public workLocationsFormArray: FormArray;
  public locationIdControl: AbstractControl;
  public departmentIdControl: AbstractControl;
  public canCreateOrder:boolean;
  public isEditContactTitle: boolean[] = [];
  public contactDetailTitles = ORDER_CONTACT_DETAIL_TITLES;
  public isJobEndDateControlEnabled = false;
  public agencyControlEnabled = false;
  public orderStatus = 'Incomplete';
  public order: Order | null;
  public documents: Blob[] = [];
  public deleteDocumentsGuids: string[] = [];
  public priceUtils = PriceUtils;
  public orderTypes = OrderTypeOptions;
  public distribution = ORDER_JOB_DISTRIBUTION;
  public durations = ORDER_DURATION_LIST;
  public masterShiftNames = ORDER_MASTER_SHIFT_NAME_LIST;
  public jobClassifications = JobClassifications;
  public selectedLocation: Location;
  public selectedDepartment: Department;
  public orderTypesDataSource: { id: number; name: string }[];
  public isEditMode: boolean;
  public isPerDiem = false;
  public isPermPlacementOrder = false;
  public commentContainerId = 0;
  public orderId: string | null;
  public comments: Comment[] = [];
  public isShiftTimeRequired = true;
  private filterQueryString: string;
  private readonly highlightDropdownSearchString = {
    itemCreated: (e: { item: HTMLElement; }) => {
      highlightSearch(e.item, this.filterQueryString, true, 'Contains')
    }
  }
  public optionFields: FieldSettingsModel = { ...OptionFields, ...this.highlightDropdownSearchString };
  public departmentFields: FieldSettingsModel = { ...DepartmentFields, ...this.highlightDropdownSearchString };
  public reasonForRequisitionFields: FieldSettingsModel = ReasonRequisitionFields;
  public associateAgencyFields: FieldSettingsModel = AssociateAgencyFields;
  public organizationStateWithKeyCodeFields: FieldSettingsModel = OrganizationStateWithKeyCodeFields;
  public specialProjectCategoriesFields: FieldSettingsModel = SpecialProjectCategoriesFields;
  public projectNameFields: FieldSettingsModel = ProjectNameFields;
  public poNumberFields: FieldSettingsModel = PoNumberFields;
  public skillFields: FieldSettingsModel = { ...SkillFields, ...this.highlightDropdownSearchString };
  public isSpecialProjectFieldsRequired: boolean;
  public settings: { [key in SettingsKeys]?: OrganizationSettingsGet };
  public SettingsKeys = SettingsKeys;
  public specialProjectCategories: SpecialProject[];
  public projectNames: SpecialProject[];
  public poNumbers: SpecialProject[];
  public readonly datepickerMask = datepickerMask;

  private selectedRegion: Region;
  private selectedSkills: SkillCategory;
  private alreadyShownDialog = false;
  private touchedFields: Set<string> = new Set();
  private orderControlsConfig: ControlsConfig;
  private filteredJobDistributionValue: number | null = null;

  @Select(OrganizationManagementState.sortedRegions)
  public regions$: Observable<Region[]>;
  @Select(OrganizationManagementState.sortedLocationsByRegionId)
  public locations$: Observable<Location[]>;
  @Select(OrganizationManagementState.sortedDepartments)
  public departments$: Observable<Department[]>;
  @Select(OrganizationManagementState.assignedSkillsByOrganization)
  public skills$: Observable<ListOfSkills[]>;
  @Select(RejectReasonState.sortedOrderRequisition)
  public reasons$: Observable<RejectReasonPage>;
  public reasons: RejectReasonwithSystem[] = [];
  @Select(OrderManagementContentState.associateAgencies)
  public associateAgencies$: Observable<AssociateAgency[]>;
  @Select(OrderManagementContentState.organizationStatesWithKeyCode)
  public organizationStatesWithKeyCode$: Observable<AssociateAgency[]>;

  @Select(OrderManagementContentState.projectSpecialData)
  private projectSpecialData$: Observable<ProjectSpecialData>;
  @Select(OrderManagementContentState.suggestedDetails)
  private suggestedDetails$: Observable<SuggestedDetails | null>;
  @Select(OrderManagementContentState.contactDetails)
  private contactDetails$: Observable<Department>;
  @Select(OrganizationManagementState.organizationSettings)
  private organizationSettings$: Observable<OrganizationSettingsGet[]>;
  @Select(UserState.lastSelectedOrganizationId)
  private organizationId$: Observable<number>;
  @Select(OrderManagementContentState.selectedOrder)
  private selectedOrder$: Observable<Order | null>;

  constructor(
    protected override store: Store,
    private route: ActivatedRoute,
    private alertService: AlertService,
    private orderManagementService: OrderManagementContentService,
    private commentsService: CommentsService,
    private durationService: DurationService,
    private settingsViewService: SettingsViewService,
    private orderDetailsService: OrderDetailsService,
    private cd: ChangeDetectorRef,
    private partialSearchService: PartialSearchService,
    private permissionService: PermissionService,
  ) {
    super(store);
    this.initOrderForms();
    this.getSettings();
    this.watchForOrderFormsChanges();
    this.createJobDistributionForm();
    this.watchForJobDistribution();
    this.initControls();
    this.watchForControlsChanges();
    this.setShiftsValidation(this.orderControlsConfig.shiftStartTimeControl, this.orderControlsConfig.shiftEndTimeControl);
    this.subscribeOnPermissions();
  }

  public override ngOnInit(): void {
    super.ngOnInit();
    this.getFormData();
    this.setOrderId();
    this.resetFormAfterSwichingOrganization();
    this.watchForSelectOrder();
    this.watchForSuggestedDetails();
    this.watchForDepartmentId();
    this.watchForSpecialProjectCategory();
    this.getVMSOrderRequisition();
  }

  public override ngOnDestroy(): void {
    super.ngOnDestroy();
    this.store.dispatch([new ClearSelectedOrder(), new ClearSuggestions()]);
  }

  public onRequisitionChange(event: any): void {
    this.jobDescriptionForm.controls['orderRequisitionReasonName'].patchValue(event.itemData.reason);
  }

  private resetFormAfterSwichingOrganization(): void {
    this.organizationId$.pipe(
      skip(1),
      takeUntil(this.componentDestroy())
    ).subscribe((id: number) => {
      this.setOrderId();
      this.getFormData(Boolean(id));
    });
  }

  private getFormData(force = false): void {
    this.generalInformationForm.reset();
    this.jobDescriptionForm.reset();
    this.contactDetailsForm.reset();
    this.workLocationForm.reset();
    this.specialProject.reset();
    if (force) {
      this.populateNewOrderForm();
    }
  }
  public getVMSOrderRequisition() {
    this.reasons$
      .pipe(takeUntil(this.componentDestroy()))
      .subscribe(data => {
        this.reasons = [];
        data.items.forEach(item => {
          if (item.includeInVMS === true) {
            this.reasons.push({
              id: item.id,
              reason: item.reason,
              businessUnitId: item.businessUnitId,
              isAutoPopulate: item.isAutoPopulate,
            });
          }
          if (item.isAutoPopulate === true) {
            this.jobDescriptionForm.controls['orderRequisitionReasonId'].setValue(item.id);
          }
        });
      });
  }

  private getSettings(): void {
    this.store.dispatch(new GetOrganizationSettings());
  }

  private getComments(): void {
    this.commentsService.getComments(this.commentContainerId, null)
      .pipe(takeUntil(this.componentDestroy()))
      .subscribe((comments: Comment[]) => {
        this.comments = comments;
      });
  }

  private populateContactDetailsForm(name: string, email: string, mobilePhone: string): void {
    const contactDetailsFormArray = this.contactDetailsForm.controls['contactDetails'] as FormArray;
    const firstContactDetailsControl = contactDetailsFormArray.at(0) as FormGroup;
    firstContactDetailsControl.controls['name'].patchValue(name);
    firstContactDetailsControl.controls['email'].patchValue(email);
    firstContactDetailsControl.controls['mobilePhone'].patchValue(mobilePhone);
  }

  private populateHourlyRateField(
    orderType: OrderType,
    departmentId: number,
    skillId: number,
    jobStartDate: Date,
    jobEndDate: Date
  ): void {
    if (orderType === OrderType.PermPlacement) {
      return;
    }
    const startDate = DateTimeHelper.setUtcTimeZone(jobStartDate);
    const endDate = DateTimeHelper.setUtcTimeZone(jobEndDate);

    this.orderManagementService
      .getRegularBillRate(orderType, departmentId, skillId, startDate, endDate)
      .pipe(takeUntil(this.componentDestroy()))
      .subscribe((billRate: BillRate) => {
        const billRateValue = billRate?.rateHour.toFixed(2) || '';
        this.generalInformationForm.controls['hourlyRate'].patchValue(billRateValue, { emitEvent: false });
      });
  }

  public onRegionDropDownChanged(event: ChangeEventArgs): void {
    this.userEditsOrder(this.isFieldTouched(RegionField));
    this.selectedRegion = event.itemData as Region;
    if (this.selectedRegion.id) {
      this.markTouchedField(RegionField);
      this.store.dispatch(new GetLocationsByRegionId(this.selectedRegion.id, undefined, true));
      this.resetLocation();
      this.resetDepartment();
    }
  }

  public onLocationDropDownChanged(event: ChangeEventArgs): void {
    this.userEditsOrder(this.isFieldTouched(LocationField));
    this.selectedLocation = event.itemData as Location;
    if (this.selectedLocation?.id) {
      this.markTouchedField(LocationField);
      this.store.dispatch(new GetDepartmentsByLocationId(this.selectedLocation.id, undefined, true));
      this.resetDepartment();
    }
  }

  public onDepartmentDropDownChanged(event: ChangeEventArgs): void {
    this.userEditsOrder(this.isFieldTouched(DepartmentField));
    this.selectedDepartment = event.itemData as Department;
    this.markTouchedField(DepartmentField);
  }

  public onSkillsDropDownChanged(event: ChangeEventArgs): void {
    this.userEditsOrder(this.isFieldTouched(SkillsField));
    this.selectedSkills = event.itemData as SkillCategory;
    this.markTouchedField(SkillsField);
  }

  private handlePerDiemOrder(): void {
    if (this.isPerDiem) {
      setValidatorsToForm(this.generalInformationForm, GeneralInformationControlsConfigForPerDiem);
    } else {
      setValidatorsToForm(this.generalInformationForm, GeneralInformationControlsConfig);
    }

    this.updateGeneralInformationControls();
  }

  private userEditsOrder(fieldIsTouched: boolean): void {
    if (!fieldIsTouched && this.isEditMode && !this.alreadyShownDialog) {
      this.alreadyShownDialog = true;
      const message = this.orderTypeForm.controls['orderType'].value === OrderType.OpenPerDiem ?
        ORDER_PER_DIEM_EDITS : ORDER_EDITS;
      this.alertService
        .alert(message, {
          title: 'Warning',
          okButtonClass: 'ok-button',
        }).pipe(
          takeUntil(this.componentDestroy())
        ).subscribe();
    }
  }

  private orderTypeDataSourceHandler(): void {
    if (this.orderId) {
      this.setDataSourceForOrderTypes(
        this.settings[SettingsKeys.IsReOrder]?.value ||
        (!this.settings[SettingsKeys.IsReOrder]?.value && this.order?.orderType === OrderType.OpenPerDiem)
      );
    } else {
      this.setDataSourceForOrderTypes(this.settings[SettingsKeys.IsReOrder]?.value);
    }
  }

  private setDataSourceForOrderTypes(condition: boolean) {
    if (condition) {
      this.orderTypesDataSource = this.orderTypes;
    } else {
      this.orderTypesDataSource = this.orderTypes.filter((orderType) => orderType.id !== OrderType.OpenPerDiem);
    }
  }

  private subscribeForSettings(): Observable<ProjectSpecialData> {
    return this.organizationSettings$
      .pipe(
        filter((settings: OrganizationSettingsGet[]) => !!settings.length),
        switchMap((settings: OrganizationSettingsGet[]) => {
          this.settings = SettingsHelper.mapSettings(settings);
          this.isSpecialProjectFieldsRequired = this.settings[SettingsKeys.MandatorySpecialProjectDetails]?.value;
          return this.projectSpecialData$;
        }),
        tap((data: ProjectSpecialData) => {
          this.setProjectSpecialData(data);
          this.orderTypeDataSourceHandler();

          if (this.specialProject != null) {
            this.setRequiredFieldsForSpecialProject();
            updateValidationToForm(this.specialProject, SpecialProjectControlsConfig);
          }
          this.cd.markForCheck();
        }),
        takeUntil(this.componentDestroy()),
      );
  }

  private setProjectSpecialData(data: ProjectSpecialData): void {
    if (data != null) {
      this.specialProjectCategories = this.isSpecialProjectFieldsRequired
        ? data.specialProjectCategories.filter(f => f.includeInVMS == true)
        : [{ id: null, projectType: '' }, ...data.specialProjectCategories.filter(f => f.includeInVMS == true)];

      // this.projectNames = this.isSpecialProjectFieldsRequired
      //   ? data.projectNames.filter(f => f.includeInVMS == true)
      //   : [{ id: null, projectName: '' }, ...data.projectNames.filter(f => f.includeInVMS == true)];

      this.poNumbers = this.isSpecialProjectFieldsRequired
        ? data.poNumbers
        : [{ id: null, poNumber: '' }, ...data.poNumbers];
    }
  }

  private setRequiredFieldsForSpecialProject(): void {
    if (this.isSpecialProjectFieldsRequired) {
      setValidatorsToForm(this.specialProject, SpecialProjectControlsConfig);
    } else {
      clearValidatorsToForm(this.specialProject, SpecialProjectControlsConfig);
    }
  }

  private isFieldTouched(field: string): boolean {
    return this.touchedFields.has(field);
  }

  private markTouchedField(field: string) {
    this.touchedFields.add(field);
  }

  public addContact(): void {
    if (this.contactDetailsFormArray.invalid) {
      return;
    }

    this.createContactForm();
  }

  public removeContact(index: number): void {
    const isPrimaryContact = this.contactDetailsFormArray.controls[index].get('isPrimaryContact')?.value;
    this.isEditContactTitle.splice(index, 1);
    this.contactDetailsFormArray.removeAt(index);

    if (isPrimaryContact) {
      this.setDefaultPrimaryContact();
    }
  }

  private setDefaultPrimaryContact(): void {
    this.contactDetailsFormArray.controls[0].get('isPrimaryContact')?.patchValue(true);
  }

  public editContactTitleHandler(i: number): void {
    this.isEditContactTitle[i] = !this.isEditContactTitle[i];
  }

  public addWorkLocation(): void {
    if (this.workLocationsFormArray.invalid) {
      return;
    }

    this.createWorkLocationForm();
  }

  public removeWorkLocation(index: number): void {
    this.workLocationsFormArray.removeAt(index);
  }

  public onDocumentsSelected(documents: Blob[]): void {
    this.documents = documents;
    this.store.dispatch(new SetIsDirtyOrderForm(true));
  }

  public onDocumentDeleted(document: Document): void {
    this.deleteDocumentsGuids.push(document.documentId);
    this.store.dispatch(new SetIsDirtyOrderForm(true));
  }

  private handlePermPlacementOrder(): void {
    if (this.isPermPlacementOrder) {
      this.addPermPlacementControls(ListOfPermPlacementControls);
      this.removeValidators(ListOfGeneralOrderControls);
    } else {
      this.removePermPlacementControls(ListOfPermPlacementControls);
    }
  }

  private populatePermPlacementControls(order: Order): void {
    this.handlePermPlacementOrder();

    if (this.isPermPlacementOrder) {
      this.generalInformationForm.patchValue(valueMapperForGeneralInformation(order));
    }
  }

  private removePermPlacementControls(controls: string[]): void {
    controls.forEach((control: string) => {
      this.generalInformationForm.contains(control) &&
        this.generalInformationForm.removeControl(control, { emitEvent: false });
    });
  }

  private removeValidators(controls: string[]): void {
    controls.forEach((controlName: string) => {
      if (this.generalInformationForm.contains(controlName)) {
        const control = this.generalInformationForm.get(controlName);
        control?.clearValidators();
        control?.updateValueAndValidity();
      }
    });
  }

  private addPermPlacementControls(controlNames: string[]): void {
    controlNames.forEach((controlName: string) => {
      const formControl = this.orderDetailsService.createPermPlacementControls();
      this.generalInformationForm.addControl(controlName, formControl, { emitEvent: false });
    });
  }

  //TODO: refactor this method
  private populateForms(order: Order): void {
    this.isPerDiem = order.orderType === OrderType.OpenPerDiem;
    this.isPermPlacementOrder = order.orderType === OrderType.PermPlacement;
    this.orderTypeChanged.emit(order.orderType);
    const hourlyRate = (this.isPermPlacementOrder || order.isTemplate)
      ? null
      : order.hourlyRate
        ? parseFloat(order.hourlyRate.toString()).toFixed(2)
        : '0.00';

    const linkedId = order.irpOrderMetadata && !order.isIRPOnly
      ? order.irpOrderMetadata?.linkedId
      : order.linkedId;
    const joiningBonus = order.joiningBonus ? parseFloat(order.joiningBonus.toString()).toFixed(2) : '';
    const compBonus = order.compBonus ? parseFloat(order.compBonus.toString()).toFixed(2) : '';
    this.orderStatus = order.statusText;
    this.orderTypeForm.controls['orderType'].patchValue(order.orderType);
    this.orderTypeForm.controls['title'].patchValue(order.title);

    this.skills$
      .pipe(takeUntil(this.componentDestroy()))
      .subscribe(() => {
        this.generalInformationForm.controls['skillId'].patchValue(order.skillId);
      });

    this.generalInformationForm.controls['shift'].patchValue(order.shift, { emitEvent: false });
    this.updateShiftValidators(order.shift);

    this.regions$
      .pipe(takeUntil(this.componentDestroy()))
      .subscribe(() => {
        const regionFormControl = this.generalInformationForm.get('regionId');

        if (order.regionId && !regionFormControl?.value) {
          regionFormControl?.patchValue(order.regionId);
        }
      });

    this.generalInformationForm.controls['hourlyRate'].patchValue(hourlyRate);
    this.generalInformationForm.controls['openPositions'].patchValue(order.openPositions);
    this.generalInformationForm.controls['minYrsRequired'].patchValue(order.minYrsRequired);
    this.generalInformationForm.controls['joiningBonus'].patchValue(joiningBonus);
    this.generalInformationForm.controls['compBonus'].patchValue(compBonus);
    this.generalInformationForm.controls['duration'].patchValue(order.duration);
    this.generalInformationForm.controls['shiftStartTime'].patchValue(
      order.shiftStartTime ? DateTimeHelper.setCurrentTimeZone(order.shiftStartTime.toString()) : null
    );
    this.generalInformationForm.controls['shiftEndTime'].patchValue(
      order.shiftEndTime ? DateTimeHelper.setCurrentTimeZone(order.shiftEndTime.toString()) : null
    );
    this.generalInformationForm.controls['linkedId'].patchValue(linkedId);

    this.populatePermPlacementControls(order);
    this.populateProjectSpecialData(order);
    this.populateRegionLocation(order);

    if (order.jobStartDate && !order.isTemplate) {
      this.generalInformationForm.controls['jobStartDate'].patchValue(
        DateTimeHelper.setCurrentTimeZone(order.jobStartDate.toString()));
    }

    if (order.jobEndDate && !order.isTemplate) {
      this.generalInformationForm.controls['jobEndDate'].patchValue(
        DateTimeHelper.setCurrentTimeZone(order.jobEndDate.toString())
      );
    }

    const jobDistributionValues = order.jobDistributions
      .map((jobDistribution: JobDistributionModel) => jobDistribution.jobDistributionOption)
      .filter((value, i, array) => array.indexOf(value) === i); // filter duplicates

    const agencyValues = order.jobDistributions
      .filter((jobDistribution: JobDistributionModel) =>
        jobDistribution.jobDistributionOption === OrderJobDistribution.Selected)
      .map((jobDistribution: JobDistributionModel) => jobDistribution.agencyId);

    this.filteredJobDistributionValue = getFilteredJobDistribution(jobDistributionValues)[0];

    if (this.filteredJobDistributionValue && this.filteredJobDistributionValue === OrderJobDistribution.TierLogic) {
      this.distribution = distributionSource(true);
    }

    this.jobDistributionForm.controls['jobDistribution'].patchValue(this.filteredJobDistributionValue);

    this.associateAgencies$
      .pipe(
        filter((val) => !!val.length),
        takeUntil(this.componentDestroy()),
      ).subscribe(() => {
        this.jobDistributionForm.controls['agency'].patchValue(agencyValues);
      });

    this.jobDistributionForm.controls['jobDistributions'].patchValue(order.jobDistributions);
    this.jobDescriptionForm.controls['classifications'].patchValue(order.classifications);
    this.jobDescriptionForm.controls['onCallRequired'].patchValue(order.onCallRequired);
    this.jobDescriptionForm.controls['asapStart'].patchValue(order.asapStart);
    this.jobDescriptionForm.controls['criticalOrder'].patchValue(order.criticalOrder);
    this.jobDescriptionForm.controls['jobDescription'].patchValue(order.jobDescription);
    this.jobDescriptionForm.controls['unitDescription'].patchValue(order.unitDescription);
    this.jobDescriptionForm.controls['orderRequisitionReasonId'].patchValue(order.orderRequisitionReasonId);
    this.jobDescriptionForm.controls['orderRequisitionReasonName'].patchValue(order.orderRequisitionReasonName);

    this.contactDetailsFormArray.clear();
    this.workLocationsFormArray.clear();

    if (order.contactDetails.length) {
      order.contactDetails.forEach((contactDetail: OrderContactDetails, i: number) => {
        this.contactDetailsFormArray.push(this.newContactDetailsFormGroup(contactDetail));
        this.isEditContactTitle[i] =
          Boolean(contactDetail.title) && !this.contactDetailTitles.includes(contactDetail.title);
      });
    } else {
      this.contactDetailsFormArray.push(this.newContactDetailsFormGroup());
    }

    if (order.workLocations.length) {
      order.workLocations.forEach((workLocation: OrderWorkLocation) => {
        this.workLocationsFormArray.push(this.newWorkLocationFormGroup(workLocation));
      });
    } else {
      this.workLocationsFormArray.push(this.newWorkLocationFormGroup());
    }
    this.disableFormControls(order);
    this.handlePerDiemOrder();
    this.handlePermPlacementOrder();
  }

  private populateProjectSpecialData(order: Order): void {
    this.projectSpecialData$.pipe(
      takeUntil(this.componentDestroy())
    ).subscribe(() => {
      this.specialProject.controls['projectTypeId'].patchValue(order.projectTypeId);
      this.specialProject.controls['projectNameId'].patchValue(order.projectNameId);
      this.specialProject.controls['poNumberId'].patchValue(order.poNumberId);
    });
  }

  private populateRegionLocation(order: Order): void {
    if (order.regionId) {
      this.store
        .dispatch(new GetLocationsByRegionId(order.regionId, undefined, true, order.locationId))
        .pipe(
          take(1),
        ).subscribe((data) => {
          this.selectedLocation = data.organizationManagement.locations?.find(
            (location: Location) => location.id === order.locationId
          );
          this.generalInformationForm.controls['locationId'].patchValue(order.locationId);
        });
    }

    if (order.locationId) {
      this.store
        .dispatch(new GetDepartmentsByLocationId(order.locationId, undefined, true, order.departmentId))
        .pipe(
          take(1),
        ).subscribe((data) => {
          this.selectedDepartment = data.organizationManagement.departments?.find(
            (department: Department) => department.departmentId === order.departmentId
          );
          this.generalInformationForm.controls['departmentId'].patchValue(order.departmentId, { emitEvent: false });
        });
    }
  }

  private autoSetupJobEndDateControl(duration: Duration, jobStartDate: Date): void {
    /** Clone Date object to avoid modifying */
    const jobStartDateValue = new Date(jobStartDate.getTime());
    const jobEndDateControl = this.generalInformationForm.get('jobEndDate') as AbstractControl;

    const jobEndDate: Date = this.durationService.getEndDate(duration, jobStartDateValue);
    jobEndDateControl.patchValue(jobEndDate);
  }

  private createContactForm(): void {
    this.contactDetailsFormArray.push(this.newContactDetailsFormGroup());
  }

  private createWorkLocationForm(): void {
    this.workLocationsFormArray.push(this.newWorkLocationFormGroup());
  }

  private newContactDetailsFormGroup(orderContactDetails?: OrderContactDetails): FormGroup {
    return this.orderDetailsService.createContactDetailsForm(orderContactDetails, this.contactDetailsFormArray?.length);
  }

  private newWorkLocationFormGroup(orderWorkLocation?: OrderWorkLocation): FormGroup {
    return this.orderDetailsService.createLocationFrom(orderWorkLocation);
  }

  /** During editing order (in progress or filled), some fields have to be disabled */
  private disableFormControls(order: Order): void {
    if (order.status === OrderStatus.Incomplete || order.status === OrderStatus.Open) {
      ControlsForDisable.forEach((control) => this.generalInformationForm.controls[control].enable({ emitEvent: false }));
    }

    if (order.status === OrderStatus.InProgress || order.status === OrderStatus.Filled) {
      this.generalInformationForm = disableControls(this.generalInformationForm, ControlsForDisable, false);
    }

    if (order.orderType === OrderType.OpenPerDiem && order.status === OrderStatus.Open) {
      this.handlePerDiemOrder();
      this.orderTypeForm.get('title')?.disable();
      this.generalInformationForm = disableControls(
        this.generalInformationForm,
        [...ControlsForDisable], false
      );
    }

    if (order.extensionFromId && this.isEditMode) {
      this.disableExtensionControls();
    }

    Object.keys(this.generalInformationForm.controls).forEach((key: string) => {
      this.generalInformationForm.controls[key].updateValueAndValidity({ onlySelf: false, emitEvent: false });
    });
  }

  private disableExtensionControls(): void {
    const extensionControlsConfig: ExtensionsControlConfig = {
      ...generateControlsConfig(['openPositions'], this.generalInformationForm),
      ...generateControlsConfig(ExtensionControls, this.jobDistributionForm),
    } as unknown as ExtensionsControlConfig;

    for (const key in extensionControlsConfig) {
      (extensionControlsConfig[key as keyof ExtensionsControlConfig])?.disable();
      extensionControlsConfig[key as keyof ExtensionsControlConfig]?.updateValueAndValidity(
        { onlySelf: false, emitEvent: false }
      );
    }
  }

  private resetLocation(): void {
    this.locationIdControl.reset(null, { emitValue: false });
    this.locationIdControl.markAsUntouched();
  }

  private resetDepartment(): void {
    this.departmentIdControl.reset(null, { emitValue: false });
    this.departmentIdControl.markAsUntouched();
  }

  private populateNewOrderForm(): void {
    this.orderTypeForm.controls['orderType'].patchValue(OrderType.Traveler);
    this.generalInformationForm.controls['duration'].patchValue(Duration.ThirteenWeeks);
    this.jobDistributionForm.controls['jobDistribution'].patchValue(OrderJobDistribution.All);

    const contactDetails = (this.contactDetailsForm.controls['contactDetails'] as FormArray).at(0) as FormGroup;
    contactDetails.controls['isPrimaryContact'].patchValue(true);
    let unitDescriptionValue: string | null = '';

    this.generalInformationForm.controls['departmentId'].valueChanges
      .pipe(
        filter(Boolean),
        switchMap((d) => {
          unitDescriptionValue = unitDescriptionValue === null ?
            unitDescriptionValue : this.jobDescriptionForm.get('unitDescription')?.value;
          return this.contactDetails$;
        }),
        filter(Boolean),
        takeUntil(this.componentDestroy())
      )
      .subscribe((contactDetails) => {
        const { facilityContact, facilityPhoneNo, facilityEmail, unitDescription } = contactDetails;
        this.populateContactDetailsForm(facilityContact, facilityEmail, facilityPhoneNo);
        this.jobDescriptionForm.get('unitDescription')?.setValue(
          unitDescriptionValue ? unitDescriptionValue : unitDescription
        );
        unitDescriptionValue = null;
      });
  }

  public selectPrimaryContact(event: ChangeArgs): void {
    const checkedValue = Number(event.value);
    this.contactDetailsFormArray.controls.forEach((control, index) => {
      const primaryContact = control.get('isPrimaryContact');
      if (primaryContact) {
        index !== checkedValue ? primaryContact.patchValue(false) : primaryContact.patchValue(true);
      }
    });
  }

  updateShiftValidators(value: MasterShiftName): void {
    const shiftStartTimeControl = this.generalInformationForm.get('shiftStartTime') as AbstractControl;
    const shiftEndTimeControl = this.generalInformationForm.get('shiftEndTime') as AbstractControl;

    if (value === MasterShiftName.Rotating) {
      this.clearShiftsValidation(shiftStartTimeControl, shiftEndTimeControl);
      this.isShiftTimeRequired = false;
    } else {
      this.setShiftsValidation(shiftStartTimeControl, shiftEndTimeControl);
      this.isShiftTimeRequired = true;
    }

    this.updateShifts(shiftStartTimeControl, shiftEndTimeControl);

    this.cd.markForCheck();
  }

  setShiftsValidation(shiftStart: AbstractControl, shiftEnd: AbstractControl): void {
    shiftStart.addValidators([Validators.required]);
    shiftEnd.addValidators([Validators.required]);
  }

  clearShiftsValidation(shiftStart: AbstractControl, shiftEnd: AbstractControl): void {
    shiftStart.clearValidators();
    shiftEnd.clearValidators();
  }

  updateShifts(shiftStart: AbstractControl, shiftEnd: AbstractControl): void {
    shiftStart.updateValueAndValidity();
    shiftEnd.updateValueAndValidity();
  }

  private createJobDistributionForm(): void {
    this.jobDistributionForm = this.orderDetailsService.createJobDistributionForm();
  }

  private watchForJobDistribution(): void {
    this.jobDistributionForm.valueChanges.pipe(
      debounceTime(500),
      takeUntil(this.componentDestroy()),
    ).subscribe(() => {
      this.store.dispatch(new SetIsDirtyOrderForm(this.jobDistributionForm.dirty));
    });
  }

  private watchForSelectOrder(): void {
    this.selectedOrder$.pipe(takeUntil(this.componentDestroy())).subscribe((order) => {
      const isEditMode = this.route.snapshot.data['isEditing'];
      if (order && isEditMode) {
        this.isPerDiem = order.orderType === OrderType.OpenPerDiem;
        this.isEditMode = true;
        this.order = order;
        this.commentContainerId = order.commentContainerId as number;
        this.getComments();
        this.subscribeForSettings().pipe(takeUntil(this.componentDestroy())).subscribe(() => {
          this.populateForms(order);
        });
      } else if (order?.isTemplate) {
        this.order = order;
        this.subscribeForSettings().pipe(takeUntil(this.componentDestroy())).subscribe(() => {
          this.populateForms(order);
        });
      } else if (!isEditMode) {
        this.subscribeForSettings().pipe(takeUntil(this.componentDestroy())).subscribe();
        this.isEditMode = false;
        this.order = null;
        this.populateNewOrderForm();
      }
    });
  }

  private watchForSuggestedDetails(): void {
    this.suggestedDetails$.pipe(
      filter((suggestedDetails) => !isNil(suggestedDetails)),
      takeUntil(this.componentDestroy())
    ).subscribe((suggestedDetails) => {
      const { address, state, city, zipCode } = suggestedDetails!.workLocation;

      const workLocationsFormArray = this.workLocationForm.controls['workLocations'] as FormArray;
      const firstWorlLocationsControl = workLocationsFormArray.at(0) as FormGroup;

      firstWorlLocationsControl.patchValue({ address, state, city, zipCode });
    });
  }

  private watchForDepartmentId(): void {
    this.generalInformationForm.get('departmentId')?.valueChanges
      .pipe(
        filter(Boolean),
        switchMap((id: number) => {
          return this.settingsViewService.getViewSettingKey(
            OrganizationSettingKeys.TieringLogic,
            OrganizationalHierarchy.Department,
            id);
        }),
        takeUntil(this.componentDestroy())
      ).subscribe(({ TieringLogic }) => {
        this.distribution = distributionSource(TieringLogic === TierLogic.Show);
        this.patchJobDistributionValue();

        this.cd.markForCheck();
      });
  }
  private watchForSpecialProjectCategory(): void {
    this.specialProject.get('projectTypeId')?.valueChanges.pipe(takeUntil(this.componentDestroy())).subscribe((id: any) => {
      if(id){
        this.specialProject.controls['projectNameId'].reset();
        this.projectNames=[];
        this.projectSpecialData$.pipe(takeUntil(this.componentDestroy())).subscribe((data: ProjectSpecialData) => {
          this.projectNames = this.isSpecialProjectFieldsRequired
            ? data.projectNames.filter(f => f.includeInVMS == true && f.projectTypeId ==id)
            : [{ id: null, projectName: '' }, ...data.projectNames.filter(f => f.includeInVMS == true && f.projectTypeId ==id)];

        })
        this.cd.markForCheck();
      }else{
        this.specialProject.controls['projectNameId'].reset();
        this.projectNames=[];
      }

    })
  }

  private patchJobDistributionValue(): void {
    if (this.order && this.filteredJobDistributionValue) {
      this.jobDistributionForm.controls['jobDistribution'].patchValue(
        this.filteredJobDistributionValue
      );
      this.filteredJobDistributionValue = null;
    }
  }

  private initOrderForms(): void {
    this.orderTypeForm = this.orderDetailsService.createOrderTypeForm();
    this.generalInformationForm = this.orderDetailsService.createGeneralInformationForm();
    this.jobDescriptionForm = this.orderDetailsService.createJobDescriptionFrom();
    this.specialProject = this.orderDetailsService.createSpecialProjectFrom(this.isSpecialProjectFieldsRequired);
    this.contactDetailsForm = this.orderDetailsService.createFormArrays('contactDetails', this.newContactDetailsFormGroup());
    this.workLocationForm = this.orderDetailsService.createFormArrays('workLocations', this.newWorkLocationFormGroup());
  }

  private watchForOrderFormsChanges(): void {
    this.orderTypeForm.valueChanges.pipe(
      throttleTime(500),
      takeUntil(this.componentDestroy())
    ).subscribe((val) => {
      const hourlyRate = this.generalInformationForm.value.hourlyRate;
      this.hourlyRateSync.emit(hourlyRate);
      this.isPerDiem = val.orderType === OrderType.OpenPerDiem;
      this.isPermPlacementOrder = val.orderType === OrderType.PermPlacement;
      this.orderTypeChanged.emit(val.orderType);
      this.store.dispatch(new SetIsDirtyOrderForm(this.orderTypeForm.dirty));

      this.handlePerDiemOrder();
      this.handlePermPlacementOrder();
      this.updateGeneralInformationControls();
    });

    this.generalInformationForm.valueChanges.pipe(
      debounceTime(500),
      takeUntil(this.componentDestroy())
    ).subscribe(() => {
      this.store.dispatch(new SetIsDirtyOrderForm(this.generalInformationForm.dirty));
    });

    this.jobDescriptionForm.valueChanges.pipe(
      debounceTime(500),
      takeUntil(this.componentDestroy())
    ).subscribe(() => {
      this.store.dispatch(new SetIsDirtyOrderForm(this.jobDescriptionForm.dirty));
    });

    this.contactDetailsForm.valueChanges.pipe(
      debounceTime(500),
      takeUntil(this.componentDestroy())
    ).subscribe(() => {
      this.store.dispatch(new SetIsDirtyOrderForm(this.contactDetailsForm.dirty));
    });

    this.workLocationForm.valueChanges.pipe(
      debounceTime(500),
      takeUntil(this.componentDestroy())
    ).subscribe(() => {
      this.store.dispatch(new SetIsDirtyOrderForm(this.workLocationForm.dirty));
    });

    this.specialProject.valueChanges.pipe(
      debounceTime(500),
      takeUntil(this.componentDestroy()),
    ).subscribe(() => {
      this.store.dispatch(new SetIsDirtyOrderForm(this.specialProject.dirty));
    });
  }

  private updateGeneralInformationControls(): void {
    Object.keys(this.generalInformationForm.controls).forEach((key: string) => {
      this.generalInformationForm.controls[key].updateValueAndValidity({ onlySelf: false, emitEvent: false });
    });
  }

  private initControls(): void {
    this.locationIdControl = this.generalInformationForm.get('locationId') as AbstractControl;
    this.departmentIdControl = this.generalInformationForm.get('departmentId') as AbstractControl;
    this.contactDetailsFormArray = this.contactDetailsForm.get('contactDetails') as FormArray;
    this.workLocationsFormArray = this.workLocationForm.get('workLocations') as FormArray;
    this.orderControlsConfig = {
      ...generateControlsConfig(OrderTypeControls, this.orderTypeForm),
      ...generateControlsConfig(GeneralInfoControls, this.generalInformationForm),
      ...generateControlsConfig(JobDistributionControls, this.jobDistributionForm),
    };
  }

  private watchForControlsChanges(): void {
    this.contactDetailsFormArray.valueChanges.pipe(
      debounceTime(500),
      takeUntil(this.componentDestroy())
    ).subscribe(() => {
      this.store.dispatch(new SetIsDirtyOrderForm(this.contactDetailsFormArray.dirty));
    });

    this.workLocationsFormArray.valueChanges.pipe(
      debounceTime(500),
      takeUntil(this.componentDestroy())
    ).subscribe(() => {
      this.store.dispatch(new SetIsDirtyOrderForm(this.workLocationsFormArray.dirty));
    });

    //TODO: move logic from if to filter
    this.departmentIdControl.valueChanges.pipe(
      takeUntil(this.componentDestroy())
    ).subscribe((departmentId: number) => {
      if (!departmentId || this.isEditMode) {
        return;
      }
      this.store.dispatch(new GetContactDetails(departmentId));
    });

    this.locationIdControl.valueChanges.pipe(
      takeUntil(this.componentDestroy())
    ).subscribe((locationId: number) => {
      if (!locationId || this.isEditMode) {
        return;
      }
      this.store.dispatch(new GetSuggestedDetails(locationId));
    });

    combineLatest([
      this.orderControlsConfig.orderTypeControl.valueChanges,
      this.orderControlsConfig.departmentIdControl.valueChanges,
      this.orderControlsConfig.skillIdControl.valueChanges,
      this.orderControlsConfig.jobStartDateControl.valueChanges,
    ]).pipe(
      debounceTime(50),
      takeUntil(this.componentDestroy())
    ).subscribe(([orderType, departmentId, skillId, jobStartDate]) => {
      const departmentIdValue = departmentId;
      if (this.isPermPlacementOrder || isNaN(parseInt(orderType)) || !departmentIdValue || !skillId || !jobStartDate) {
        return;
      }

      this.store.dispatch(
        new SetPredefinedBillRatesData(
          orderType,
          departmentIdValue,
          skillId,
          DateTimeHelper.setUtcTimeZone(jobStartDate),
          DateTimeHelper.setUtcTimeZone(this.orderControlsConfig.jobEndDateControl.value)
        )
      );
    });

    combineLatest([
      this.orderControlsConfig.orderTypeControl.valueChanges,
      this.orderControlsConfig.departmentIdControl.valueChanges,
      this.orderControlsConfig.skillIdControl.valueChanges,
      this.orderControlsConfig.jobStartDateControl.valueChanges,
    ]).pipe(
      debounceTime(50),
      takeUntil(this.componentDestroy())
    ).subscribe(([orderType, departmentId, skillId, jobStartDate]) => {
      if (isNaN(parseInt(orderType)) || !departmentId || !skillId || !jobStartDate) {
        return;
      }

      if (!this.isEditMode) {
        this.populateHourlyRateField(
          orderType, departmentId, skillId, jobStartDate, this.orderControlsConfig.jobEndDateControl.value
        );
      }
    });

    this.subscribeOnPredefinedCredentialsUpdate();

    this.orderControlsConfig.durationControl.valueChanges.pipe(
      takeUntil(this.componentDestroy())
    ).subscribe((duration: Duration) => {
      this.isJobEndDateControlEnabled = duration === Duration.Other;
      const jobStartDate = this.orderControlsConfig.jobStartDateControl.value as Date | null;

      this.cd.markForCheck();

      if (!(jobStartDate instanceof Date) || this.isPermPlacementOrder) {
        return;
      }

      this.autoSetupJobEndDateControl(duration, jobStartDate);
    });

    this.orderControlsConfig.jobStartDateControl.valueChanges.pipe(
      takeUntil(this.componentDestroy())
    ).subscribe((jobStartDate: Date | null) => {
      const duration = this.orderControlsConfig.durationControl.value;

      if (
        isNaN(parseInt(duration)) ||
        !(jobStartDate instanceof Date) ||
        this.orderControlsConfig.orderTypeControl.value === OrderType.PermPlacement
      ) {
        return;
      }

      this.autoSetupJobEndDateControl(duration, jobStartDate);
    });

    this.orderControlsConfig.shiftControl.valueChanges.pipe(
      filter((value: number) => !isNil(value)),
      takeUntil(this.componentDestroy())
    ).subscribe((value: number) => {
      this.updateShiftValidators(value);
    });

    //TODO: Refactor and rewrite
    this.orderControlsConfig.jobDistributionControl.valueChanges
      .pipe(
        debounceTime(600),
        takeUntil(this.componentDestroy())
      ).subscribe((jobDistributionId: OrderJobDistribution) => {
        if (jobDistributionId === OrderJobDistribution.All) {
          this.orderControlsConfig.jobDistributionControl.patchValue(OrderJobDistribution.All, { emitEvent: false });
        }

        const getAgencyId = (id: number) =>
          this.jobDistributionForm.controls['jobDistributions'].value.find(
            (item: JobDistributionModel) => item.agencyId === id
          )?.id || 0;
        this.agencyControlEnabled = jobDistributionId === OrderJobDistribution.Selected;
        const selectedJobDistributions: JobDistributionModel[] = [];
        if (this.agencyControlEnabled) {
          this.orderControlsConfig.agencyControl.addValidators(Validators.required);
          const agencyIds = this.orderControlsConfig.agencyControl.value;
          if (agencyIds) {
            agencyIds.forEach((agencyId: number) => {
              selectedJobDistributions.push({
                id: getAgencyId(agencyId),
                orderId: this.order?.id || 0,
                jobDistributionOption: OrderJobDistribution.Selected,
                agencyId,
              });
            });
          }
        } else {
          this.orderControlsConfig.agencyControl.removeValidators(Validators.required);
          this.orderControlsConfig.agencyControl.reset();
        }
        const getJobDistId = (id: number) =>
          this.jobDistributionForm.controls['jobDistributions'].value.find(
            (item: JobDistributionModel) => item.jobDistributionOption === id
          )?.id || 0;
        this.orderControlsConfig.agencyControl.updateValueAndValidity();

        const jobDistributions = {
          id: getJobDistId(jobDistributionId),
          orderId: this.order?.id || 0,
          jobDistributionOption: jobDistributionId,
          agencyId: null,
        };

        this.orderControlsConfig.jobDistributionsControl.patchValue(
          [jobDistributions, ...selectedJobDistributions], { emitEvent: false }
        );

        this.cd.markForCheck();
      });

    this.orderControlsConfig.agencyControl.valueChanges.pipe(
      takeUntil(this.componentDestroy())
    ).subscribe((agencyIds: number[] | null) => {
      const jobDistributions = (this.orderControlsConfig.jobDistributionsControl.value as JobDistributionModel[]).filter(
        (i: JobDistributionModel) => {
          return i.jobDistributionOption !== OrderJobDistribution.Selected;
        });

      if (agencyIds) {
        agencyIds.forEach((agencyId: number) => {
          jobDistributions.push({
            id: 0,
            orderId: this.order?.id || 0,
            jobDistributionOption: OrderJobDistribution.Selected,
            agencyId,
          });
        });
      }

      this.orderControlsConfig.jobDistributionsControl.patchValue(jobDistributions, { emitEvent: false });
    });

    this.orderControlsConfig.hourlyRateControl.valueChanges.pipe(
      takeUntil(this.componentDestroy())
    ).subscribe((value) => {
      this.hourlyRateSync.emit(value);
    });
  }

  private setOrderId(): void {
    this.orderId = this.route.snapshot.paramMap.get('orderId') || null;
  }

  private subscribeOnPredefinedCredentialsUpdate(): void {
    combineLatest([
      this.orderControlsConfig.departmentIdControl.valueChanges,
      this.orderControlsConfig.skillIdControl.valueChanges,
    ]).pipe(
      filter(([departmentId, skillId]) => {
        return departmentId && skillId;
      }),
      takeUntil(this.componentDestroy())
    ).subscribe(([departmentId, skillId]) => {
      this.store.dispatch(new GetPredefinedCredentials(departmentId, skillId, SystemType.VMS));
    });
  }

  public filterItemsBySubString<T>(
    event: FilteringEventArgs,
    dataSource: T[],
    options: FieldSettingsModel
  ) {
    const queryString = event.text.trim();
    this.partialSearchService
      .searchDropdownItems(dataSource, queryString, options)
      .pipe(takeUntil(this.componentDestroy()))
      .subscribe((data) => {
        this.filterQueryString = queryString;
        event.updateData(data as PartialSearchDataType[]);
      });
  }

  private subscribeOnPermissions(): void {
    this.permissionService.getPermissions().pipe(
      takeUntil(this.componentDestroy())
    ).subscribe(({ canCreateOrder}) => {
      this.canCreateOrder = canCreateOrder;
    });
  }

  public closeDropdown(): void {
    this.filterQueryString = '';
  }
}
