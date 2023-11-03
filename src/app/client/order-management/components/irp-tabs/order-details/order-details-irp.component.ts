/* eslint-disable max-lines-per-function */
/* eslint-disable max-len */
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  TrackByFunction,
} from '@angular/core';
import { AbstractControl,FormGroup } from '@angular/forms';

import { combineLatest, distinctUntilChanged, filter, forkJoin, map, Observable, Subject, switchMap, take, takeUntil, tap } from 'rxjs';
import { Select, Store } from '@ngxs/store';
import { FieldSettingsModel } from '@syncfusion/ej2-angular-dropdowns';

import { OptionFields } from '@client/order-management/constants';
import {
  ContactDetailsUser,
  DataSourceContainer,
  OrderDataSourceContainer,
  OrderFormInput,
  OrderFormsArrayConfig,
  OrderFormsConfig,
  OrderTypes,
  PoNumbers,
  ProjectNames,
  SelectedDistributionState,
  SelectedStructureState,
  SelectSystem,
  SpecialProjectCategories,
  SpecialProjectStructure,
  StateList,
} from '@client/order-management/interfaces';
import {
  AllInternalJob,
  ContactDetailsList,
  DateFormat,
  DateMask,
  GeneralInformationForm,
  Incomplete,
  InternalTieringError,
  JobDescriptionForm,
  JobDistributionForm,
  OrderTypeList,
  SpecialProjectForm,
  TierInternal,
  TimeMask,
  WorkLocationList,
} from '@client/order-management/components/irp-tabs/order-details/constants/order-details.constant';
import {
  ContactDetailsConfig,
  ContactDetailsForm,
  LongTermAssignmentConfig,
  perDiemConfig,
  WorkLocationConfig,
  WorkLocationFrom,
} from '@client/order-management/components/irp-tabs/order-details/constants';
import { FieldType, UserPermissions } from '@core/enums';
import PriceUtils from '@shared/utils/price.utils';
import { DateTimeHelper, Destroyable } from '@core/helpers';
import { OrganizationManagementState } from '@organization-management/store/organization-management.state';
import { Region } from '@shared/models/region.model';
import { SystemType } from '@shared/enums/system-type.enum';
import { SkillsService } from '@shared/services/skills.service';
import { Location } from '@shared/models/location.model';
import {
  adaptOrder,
  changeTypeEditButton,
  changeTypeField,
  getDataSourceForJobDistribution,
  mapAssociateAgencyStructure,
  mapperForContactDetail,
  mapReasonsStructure,
  mapSpecialProjectStructure,
  mapStatesStructure,
  removeFields,
  setDataSource,
  setDefaultPrimaryContact,
  showHideFormAction,
  updateJobDistributionForm,
  viewDistributiondelay,
  viewDistributiontoVMS,
} from '@client/order-management/components/irp-tabs/order-details/helpers';
import { Department } from '@shared/models/department.model';
import { AssignedSkillsByOrganization, ListOfSkills } from '@shared/models/skill.model';
import { DurationService } from '@shared/services/duration.service';
import { Duration } from '@shared/enums/durations';
import { RejectReasonState } from '@organization-management/store/reject-reason.state';
import {
  OrderRequisitionReason,
  RejectReason,
  RejectReasonPage,
  RejectReasonwithSystem,
} from '@shared/models/reject-reason.model';
import {
  OrderDetailsIrpService,
} from '@client/order-management/components/irp-tabs/services/order-details-irp.service';
import { ButtonType } from '@client/order-management/components/irp-tabs/order-details/order-details-irp.enum';
import { ORDER_CONTACT_DETAIL_TITLES, OrganizationalHierarchy, OrganizationSettingKeys } from '@shared/constants';
import { OrderManagementContentState } from '@client/store/order-managment-content.state';
import { AssociateAgency } from '@shared/models/associate-agency.model';
import { ProjectSpecialData } from '@shared/models/project-special-data.model';
import { Document } from '@shared/models/document.model';
import {
  IrpContainerStateService,
} from '@client/order-management/containers/irp-container/services/irp-container-state.service';
import { JobDistributionfilters, Order, OrderContactDetails, OrderWorkLocation, OrgStructureDto, SuggestedDetails } from '@shared/models/order-management.model';
import { UserState } from '../../../../../store/user.state';
import { Organization, OrganizationRegion, OrganizationStructure } from '@shared/models/organization.model';
import {
  GetAllShifts,
  GetContactDetails,
  GetJobDistributionValues,
  GetOrganizationStatesWithKeyCode,
  GetProjectSpecialData,
  GetSuggestedDetails,
} from '@client/store/order-managment-content.actions';
import { OrganizationStructureService, SettingsViewService } from '@shared/services';
import { ShowToast } from '../../../../../store/app.actions';
import { MessageTypes } from '@shared/enums/message-types';
import { IrpOrderType, OrderType } from '@shared/enums/order-type';
import { Comment } from '@shared/models/comment.model';
import { CommentsService } from '@shared/services/comments.service';
import { ScheduleShift } from '@shared/models/schedule-shift.model';
import { getHoursMinutesSeconds } from '@shared/utils/date-time.utils';
import { Permission } from '@core/interface/permission.interface';
import { GetPredefinedCredentials } from '@order-credentials/store/credentials.actions';
import { OrderManagementService } from '../../order-management-content/order-management.service';
import { Configuration } from '@shared/models/organization-settings.model';
import { SettingsHelper } from '@core/helpers/settings.helper';
import { SettingsKeys } from '@shared/enums/settings';
import {
  GetOrganizationSettings,
} from '@organization-management/store/organization-management.actions';
import { MenuEventArgs } from '@syncfusion/ej2-angular-navigations';
import { Router } from '@angular/router';
import { OrderStatus } from '@shared/enums/order-management';
import { IrpOrderJobDistribution } from '@shared/enums/job-distibution';
import { SubmitButtonItem } from '@client/order-management/components/irp-tabs/order-details/enums';

@Component({
  selector: 'app-order-details-irp',
  templateUrl: './order-details-irp.component.html',
  styleUrls: ['./order-details-irp.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderDetailsIrpComponent extends Destroyable implements OnInit {
  @Input() set system(value: SelectSystem) {
    this.selectedSystem = value;

    if (!this.selectedOrder) {
      this.organization$
        .pipe(
          filter((organisation: Organization) => !!organisation && !this.selectedOrder),
          takeUntil(this.componentDestroy())
        )
        .subscribe((organisation: Organization) => {
          this.isDistributionActivate = organisation.isDistributionActivate ? true : false;
        });
      this.orderFormsConfig = LongTermAssignmentConfig(this.selectedSystem);
      this.setConfigDataSources();
    }
  }
  public saveEvents: Subject<void | MenuEventArgs> = new Subject<void | MenuEventArgs>();
  public userPermission: Permission = {};
  public readonly userPermissions = UserPermissions;
  public orderTypeForm: FormGroup;
  public generalInformationForm: FormGroup;
  public jobDistributionForm: FormGroup;
  public jobDescriptionForm: FormGroup;
  public contactDetailsForm: FormGroup;
  public workLocationForm: FormGroup;
  public specialProjectForm: FormGroup;
  public isShow: boolean | undefined;
  public isDeptShow: boolean | undefined;
  public distributionFilter: JobDistributionfilters;
  public isDistributionActivate: boolean = false;
  public distributionIds: number[] | null;
  public isEdit: boolean = false;
  private selectedDistributionState: SelectedDistributionState;
  public readonly optionFields: FieldSettingsModel = OptionFields;
  public readonly orderTypesDataSource: OrderTypes[] = OrderTypeList;
  public readonly FieldTypes = FieldType;
  public readonly priceUtils = PriceUtils;
  public order: Order | null;
  public readonly dateFormat = DateFormat;
  public readonly dateMask = DateMask;
  public readonly timeMask = TimeMask;
  //TODO: Remove any (ListOfKeyForms)
  public listOfKeyForms: any;
  public orderFormsConfig: OrderFormsConfig[];
  public orderFormsArrayConfig: OrderFormsArrayConfig[] =
    [...ContactDetailsConfig(ContactDetailsForm()), ...WorkLocationConfig(WorkLocationFrom())];
  public contactDetailsFormsList: FormGroup[] = [];
  public workLocationFormsList: FormGroup[] = [];
  public documents: Blob[] = [];
  public deleteDocumentsGuids: string[] = [];
  public orderStatus = Incomplete;
  public selectedOrder: Order;
  public comments: Comment[] = [];
  public commentContainerId = 0;
  public isTemplate : boolean=false;
  @Input() public externalCommentConfiguration?: boolean | null;

  private specialProjectConfigurationSettings = false;
  private dataSourceContainer: OrderDataSourceContainer = {};
  private selectedSystem: SelectSystem;
  private isTieringLogicLoad = true;
  public AutopopulateId: number | undefined;
  private reason: OrderRequisitionReason[] = [];
  private unsubscribe$: Subject<void> = new Subject();
  public allShifts: any[];
  private selectedStructureState: SelectedStructureState;
  public filterType = 'Contains';
  public disabledIrp = false;
  public settings: { [key in SettingsKeys]?: Configuration };

  @Select(RejectReasonState.sortedOrderRequisition)
  private reasons$: Observable<RejectReasonPage>;
  @Select(OrderManagementContentState.associateAgencies)
  private associateAgencies$: Observable<AssociateAgency[]>;
  @Select(OrderManagementContentState.organizationStatesWithKeyCode)
  private organizationStatesWithKeyCode$: Observable<StateList[]>;
  @Select(OrderManagementContentState.projectSpecialData)
  private projectSpecialData$: Observable<ProjectSpecialData>;
  @Select(OrderManagementContentState.selectedOrder)
  private selectedOrder$: Observable<Order>;
  @Select(UserState.organizationStructure)
  private organizationStructure$: Observable<OrganizationStructure>;
  @Select(OrderManagementContentState.contactDetails)
  private contactDetails$: Observable<Department>;
  @Select(OrderManagementContentState.suggestedDetails)
  private suggestedDetails$: Observable<SuggestedDetails | null>;
  @Select(OrganizationManagementState.organization)
  private readonly organization$: Observable<Organization>;
  @Select(OrderManagementContentState.getAllShifts)
  private getAllShifts$: Observable<ScheduleShift[]>;
  @Select(OrganizationManagementState.organizationSettings)
  private organizationSettings$: Observable<Configuration[]>;
  @Select(OrderManagementContentState.selectedDistribution)
  private selectedDistribution$: Observable<OrgStructureDto>;

  constructor(
    private router: Router,
    private orderDetailsService: OrderDetailsIrpService,
    private changeDetection: ChangeDetectorRef,
    private store: Store,
    private durationService: DurationService,
    private irpStateService: IrpContainerStateService,
    private commentsService: CommentsService,
    private organizationStructureService: OrganizationStructureService,
    private settingsViewService: SettingsViewService,
    private skillsService: SkillsService,
    private orderManagementService: OrderManagementService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.isTemplate = this.router.url.includes('fromTemplate');
    this.getPermission();
    this.initOrderTypeForm();
    this.initForms(IrpOrderType.LongTermAssignment);
    this.watchForOrderTypeControl();
    this.store.dispatch(new GetAllShifts());
    this.watchForDataSources();
    this.watchForSaveAction();
    this.watchForSelectOrder();
    this.watchForOrganizationStructure();
    this.watchForSpecialProjectCategory();
    this.setReasonAutopopulate();
    this.subscribeForSettings();
  }

  private subscribeForSettings() {
    this.store.dispatch(new GetOrganizationSettings());
    this.organizationSettings$.pipe(filter((settings: Configuration[]) => !!settings.length), takeUntil(this.componentDestroy())).subscribe((settings: Configuration[]) => {
      this.settings = SettingsHelper.mapSettings(settings);

      const settingValue = this.settings[SettingsKeys.AllowDocumentUpload]?.children?.find(f => f.isIRPConfigurationValue == true)?.value;

      settingValue=="false"?  this.disabledIrp = true : this.disabledIrp = false;
    });
  }

  private getPermission(): void {
    this.store.select(UserState.userPermission).pipe(
      filter((permissions: Permission) => !!Object.keys(permissions).length),
      take(1)
    ).subscribe((permissions: Permission) => {
      this.userPermission = permissions;
    });
  }

  public changeOrderType(): void {
    const { regionId, locationId, departmentId, skillId } = this.generalInformationForm.getRawValue();
    const { distributionDelay, distributeToVMS } = this.jobDescriptionForm.getRawValue();
    this.selectedStructureState = { regionId, locationId, departmentId, skillId };
    this.selectedDistributionState = { distributionDelay, distributeToVMS };
  }

  public addFields(config: OrderFormsArrayConfig): void {
    const selectedConfig = this.getSelectedArrayFormsConfig(config);

    if (config.buttonType === ButtonType.addContact) {
      selectedConfig?.forms.push(ContactDetailsForm());
      this.contactDetailsFormsList.push(
        this.orderDetailsService.createContactDetailsForm(this.contactDetailsFormsList.length)
      );
      showHideFormAction(selectedConfig, this.contactDetailsFormsList);
    } else {
      selectedConfig?.forms.push(WorkLocationFrom(this.dataSourceContainer.state));
      this.workLocationFormsList.push(this.orderDetailsService.createWorkLocationForm());
      showHideFormAction(selectedConfig, this.workLocationFormsList);
    }
  }

  public selectDocument(documents: Blob[]): void {
    this.documents = documents;
  }

  public deleteSelectDocument(document: Document): void {
    this.deleteDocumentsGuids.push(document.documentId);
  }

  public handleActionForm(config: OrderFormsArrayConfig, item: OrderFormInput, index: number): void {
    const selectedConfig = this.getSelectedArrayFormsConfig(config);

    switch (item.buttonType) {
      case ButtonType.RemoveContact:
        removeFields(selectedConfig, index, this.contactDetailsFormsList);
        setDefaultPrimaryContact(this.contactDetailsFormsList);
        break;
      case ButtonType.RemoveWorkLocation:
        removeFields(selectedConfig, index, this.workLocationFormsList);
        break;
      case ButtonType.Edit:
        changeTypeEditButton(selectedConfig, index);
        break;
    }
  }

  public trackByField(index: number, config: OrderFormInput): string {
    return config.field;
  }

  public trackByFormTitle: TrackByFunction<OrderFormsConfig> = (index: number, item: OrderFormsConfig) => item.title;

  public selectPrimaryContact(formIndex: number): void {
    this.contactDetailsFormsList.forEach((contact: FormGroup, index: number) => {
      if (formIndex !== index) {
        contact.get('isPrimaryContact')?.patchValue(false);
      }
    });
  }

  private initForms(value: number): void {
    const isLongTermAssignment = value === IrpOrderType.LongTermAssignment;

    this.initGeneralForms(isLongTermAssignment);
    this.contactDetailsForm = this.orderDetailsService.createContactDetailsForm();
    this.specialProjectForm = this.orderDetailsService.createSpecialProject();
    this.workLocationForm = this.orderDetailsService.createWorkLocationForm();

    if (!this.selectedOrder) {
      this.contactDetailsFormsList.push(this.contactDetailsForm);
      this.workLocationFormsList.push(this.workLocationForm);
    }

    this.listOfKeyForms = {
      generalInformationForm: this.generalInformationForm,
      jobDistributionForm: this.jobDistributionForm,
      jobDescriptionForm: this.jobDescriptionForm,
      contactDetailsList: this.contactDetailsFormsList,
      specialProjectForm: this.specialProjectForm,
      workLocationList: this.workLocationFormsList,
    };

    this.watchForFormValueChanges();
  }

  private initGeneralForms(isLongTermAssignment: boolean): void {
    if (isLongTermAssignment) {
      this.jobDistributionForm = this.orderDetailsService.createJobDistributionForm();
      this.generalInformationForm = this.orderDetailsService.createGeneralInformationForm();
      this.jobDescriptionForm = this.orderDetailsService.createJobDescriptionForm();
    } else {
      this.generalInformationForm = this.orderDetailsService.createGeneralInformationPOForm();
      this.jobDistributionForm = this.orderDetailsService.createJobDistributionPOForm();
      this.jobDescriptionForm = this.orderDetailsService.createJobDescriptionPOForm();
    }
  }

  public onSplitButtonSelect(args: MenuEventArgs): void {
    switch (args.item.id) {
      case SubmitButtonItem.Save:
        break;
      case SubmitButtonItem.SaveForLater:
        break;
      case SubmitButtonItem.SaveAsTemplate:
        break;
    }
  }
  public selectTypeSave(saveType: MenuEventArgs): void {
    this.saveEvents.next(saveType);
  }

  private watchForOrderTypeControl(): void {
    this.orderTypeForm.get('orderType')?.valueChanges.pipe(
      takeUntil(this.componentDestroy())
    ).subscribe((value: number) => {
      this.generalInformationForm.get('shiftStartTime')?.reset({ emitEvent: false });
      this.generalInformationForm.get('shiftEndTime')?.reset({ emitEvent: false });
      this.changeDetection.markForCheck();
      this.clearFormLists();
      if (value === IrpOrderType.LongTermAssignment) {
        this.orderFormsArrayConfig =
          [...ContactDetailsConfig(ContactDetailsForm()), ...WorkLocationConfig(WorkLocationFrom())];
        this.orderFormsConfig = LongTermAssignmentConfig(this.selectedSystem);
      } else {
        this.orderFormsArrayConfig =
          [...ContactDetailsConfig(ContactDetailsForm()), ...WorkLocationConfig(WorkLocationFrom())];
        this.orderFormsConfig = perDiemConfig(this.selectedSystem);
      }

      this.initForms(value);
      this.setConfigDataSources();
      this.getAllShifts();
      this.setReasonAutopopulate();
      this.populateSelectedOrganizationStructure();
      this.watchForSpecialProjectCategory();
      this.orderDetailsService.disableFieldsForNotEditableOrder(
        this.selectedOrder,
        this.generalInformationForm
      );
      this.updateSpecialProjectValidation(this.specialProjectConfigurationSettings);
      this.changeDetection.markForCheck();
    });
  }

  private populateSelectedOrganizationStructure(): void {
    if (!this.selectedOrder && this.selectedStructureState) {
      this.setStructureFormValue();
    }
  }

  private setStructureFormValue(): void {
    Object.keys(this.selectedStructureState).forEach((key: string) => {
      const value = (this.selectedStructureState)[key as keyof SelectedStructureState];

      if (value) {
        this.generalInformationForm.controls[key].patchValue(value);
      }
    });
    Object.keys(this.selectedDistributionState).forEach((key: string) => {
      const value = this.selectedDistributionState[key as keyof SelectedDistributionState];

      if (value) {
        this.jobDistributionForm.controls[key].patchValue(value);
      }
    });
  }

  private getAllShifts(): void {
    this.getAllShifts$.pipe(
      filter(Boolean),
      takeUntil(this.componentDestroy())
    ).subscribe((state: ScheduleShift[]) => {

      const selectedForm = this.getSelectedFormConfig(GeneralInformationForm);

      this.updateDataSourceFormList('shift', [{ name: 'Custom', id: 0 }, ...state]);
      setDataSource(selectedForm.fields, 'shift', [{ name: 'Custom', id: 0 }, ...state]);

      this.allShifts = [{ name: 'Custom', id: 0 }, ...state];
      this.changeDetection.markForCheck();
    });
  }

  private setConfigDataSources(): void {
    const generalInformationForm = this.getSelectedFormConfig(GeneralInformationForm);
    setDataSource(generalInformationForm.fields, 'regionId', this.dataSourceContainer.regions as Region[]);
    setDataSource(generalInformationForm.fields, 'locationId', this.dataSourceContainer.locations as Location[]);
    setDataSource(generalInformationForm.fields, 'departmentId', this.dataSourceContainer.departments as Department[]);
    setDataSource(generalInformationForm.fields, 'skillId', this.dataSourceContainer.skills as ListOfSkills[]);

    const jobDistributionForm = this.getSelectedFormConfig(JobDistributionForm);
    setDataSource(jobDistributionForm.fields, 'agencyId', this.dataSourceContainer.associateAgency as AssociateAgency[]);

    const jobDescriptionForm = this.getSelectedFormConfig(JobDescriptionForm);

    if (this.dataSourceContainer.reasons != undefined) {
      setDataSource(jobDescriptionForm.fields, 'orderRequisitionReasonId',
        this.getIRPOrderRequisition(this.dataSourceContainer.reasons as RejectReasonwithSystem[]));
    }

    this.setDataSourceForSpecialProject();
    this.setDataSourceForWorkLocationList();

    this.changeDetection.markForCheck();
  }

  private setReasonAutopopulate() {
    if (this.jobDescriptionForm != undefined && this.AutopopulateId != undefined) {
      this.jobDescriptionForm.controls["orderRequisitionReasonId"].patchValue(this.AutopopulateId);
      this.changeDetection.detectChanges();
    }
  }

  private getIRPOrderRequisition(orderRequisition: RejectReasonwithSystem[]): OrderRequisitionReason[] {
    this.reason = [];
    if (orderRequisition.length > 0) {
      orderRequisition.forEach(element => {
        if (element.includeInIRP === true) {
          this.reason.push(
            {
              id: element.id,
              name: element.reason,
              businessUnitId: element.businessUnitId,
            }
          );
        }
        if (element.isAutoPopulate === true) {
          this.AutopopulateId = element.id;
        }
      });
    }
    return this.reason;
  }
  private watchForDataSources(): void {
    this.reasons$.pipe(
      filter(Boolean),
      map((reasons: RejectReasonPage) => mapReasonsStructure(reasons.items)),
      takeUntil(this.componentDestroy())
    ).subscribe((reasons: RejectReason[]) => {
      this.updateDataSourceFormList('reasons', reasons);
      const selectedForm = this.getSelectedFormConfig(JobDescriptionForm);
      setDataSource(selectedForm.fields, 'orderRequisitionReasonId', reasons);
      this.changeDetection.markForCheck();
    });

    this.associateAgencies$.pipe(
      filter(Boolean),
      map((associateAgency: AssociateAgency[]) => mapAssociateAgencyStructure(associateAgency)),
      takeUntil(this.componentDestroy())
    ).subscribe((associateAgency: AssociateAgency[]) => {
      this.updateDataSourceFormList('associateAgency', associateAgency);
      const selectedForm = this.getSelectedFormConfig(JobDistributionForm);
      setDataSource(selectedForm.fields, 'agencyId', associateAgency);
      this.changeDetection.markForCheck();
    });

    this.projectSpecialData$.pipe(
      filter(Boolean),
      map((data: ProjectSpecialData) => mapSpecialProjectStructure(data)),
      takeUntil(this.componentDestroy())
    ).subscribe((data: SpecialProjectStructure) => {
      this.updateDataSourceFormList('specialProjectCategories', data.specialProjectCategories.filter(f => f.includeInIRP == true));
      this.updateDataSourceFormList('poNumbers', data.poNumbers);
      this.setDataSourceForSpecialProject(data);
      this.changeDetection.markForCheck();
    });

    this.organizationStatesWithKeyCode$.pipe(
      filter(Boolean),
      map((state: StateList[]) => mapStatesStructure(state)),
      takeUntil(this.componentDestroy())
    ).subscribe((state: StateList[]) => {
      this.updateDataSourceFormList('state', state);
      this.setDataSourceForWorkLocationList(state);
      this.changeDetection.markForCheck();
    });

    this.contactDetails$.pipe(
      filter(Boolean),
      map((contactDetails: Department) => mapperForContactDetail(contactDetails)),
      takeUntil(this.componentDestroy())
    ).subscribe((contactDetails: ContactDetailsUser) => {
      this.contactDetailsForm.patchValue(contactDetails);
    });

    this.suggestedDetails$.pipe(
      filter(Boolean),
      takeUntil(this.componentDestroy())
    ).subscribe((suggestedDetails: SuggestedDetails) => {
      const { address, state, city, zipCode } = suggestedDetails.workLocation;
      this.workLocationForm.patchValue({ address, state, city, zipCode });
    });

    this.getAllShifts();
  }

  private watchForFormValueChanges(): void {
    this.watchForCredentialsControls();

    this.generalInformationForm.get('regionId')?.valueChanges.pipe(
      filter(Boolean),
      takeUntil(this.componentDestroy())
    ).subscribe((value: number) => {
      const startDate = this.generalInformationForm.get('jobStartDate')?.value ? this.generalInformationForm.get('jobStartDate')?.value : this.generalInformationForm.get('jobDates')?.value;
      const locations = this.generalInformationForm.get('jobDates')?.value ? this.organizationStructureService.getLocationsByIdSet(value, startDate ?? new Date) : this.organizationStructureService.getLocationsById(value, startDate ?? new Date);
      this.generalInformationForm.get('locationId')?.reset();
      this.generalInformationForm.get('departmentId')?.reset();

      this.updateDataSourceFormList('locations', locations);
      const selectedForm = this.getSelectedFormConfig(GeneralInformationForm);
      setDataSource(selectedForm.fields, 'locationId', locations);

      this.changeDetection.markForCheck();
    });

    this.generalInformationForm.get('locationId')?.valueChanges.pipe(
      filter(Boolean),
      takeUntil(this.componentDestroy())
    ).subscribe((value: number) => {
      const startDate = this.generalInformationForm.get('jobStartDate')?.value ? this.generalInformationForm.get('jobStartDate')?.value : this.generalInformationForm.get('jobDates')?.value;
      const departments = this.generalInformationForm.get('jobDates')?.value ? this.organizationStructureService.getDepartmentByIdSet(value, startDate ?? new Date) : this.organizationStructureService.getDepartmentsById(value, startDate ?? new Date);
      this.generalInformationForm.get('departmentId')?.reset();

      this.updateDataSourceFormList('departments', departments);
      const selectedForm = this.getSelectedFormConfig(GeneralInformationForm);
      setDataSource(selectedForm.fields, 'departmentId', departments);
      if (!this.selectedOrder) {
        this.store.dispatch(new GetSuggestedDetails(value));
      }
      this.changeDetection.markForCheck();
    });

    this.generalInformationForm.get('departmentId')?.valueChanges
      .pipe(
        tap((departmentsId: number) => {
          if (this.isDistributionActivate && departmentsId && this.jobDistributionForm.get('jobDistribution')?.value) {
            this.distributionFilter = {
              regionId: departmentsId ? this.generalInformationForm.get('regionId')?.value : null,
              locationId: departmentsId ? this.generalInformationForm.get('locationId')?.value : null,
              departmentId: departmentsId ? this.generalInformationForm.get('departmentId')?.value : null,
            };

            this.store.dispatch(new GetJobDistributionValues(this.distributionFilter));

            this.selectedDistribution$.pipe(takeUntil(this.unsubscribe$)).subscribe((orgStructure: OrgStructureDto) => {
              if (orgStructure != null) {
                this.jobDistributionForm.get('distributeToVMS')?.setValue(orgStructure.distributionConfigs.value);
                this.jobDistributionForm.get('distributionDelay')?.setValue(orgStructure.distributionConfigs.isEnabled);
              }
              this.changeDetection.markForCheck();
            });
          } else {
            this.jobDistributionForm.get('distributeToVMS')?.setValue(null);
            this.jobDistributionForm.get('distributionDelay')?.setValue(false);
          }
          if (!departmentsId && this.generalInformationForm.get('skillId')?.value) {
            this.setSkillFilters([]);
          }
        }),
        filter(Boolean),
        switchMap((departmentsId: number) => {
          const params = { SystemType: SystemType.IRP, DepartmentIds: [departmentsId] };
          return this.skillsService.getAssignedSkillsByOrganization({ params });
        }),
        map((skills: AssignedSkillsByOrganization[]) => {
          return skills.map((skill: AssignedSkillsByOrganization) => {
            return { ...skill, id: skill.masterSkillId, name: skill.skillDescription };
          });
        }),
        takeUntil(this.componentDestroy())
      ).subscribe((skills: ListOfSkills[]) => {
        this.setSkillFilters(skills);

        if (!this.selectedOrder && this.selectedStructureState.skillId !=null && this.selectedStructureState.skillId) {
          this.generalInformationForm.controls['skillId'].patchValue(this.selectedStructureState.skillId);
        }
      });


    this.generalInformationForm.get('duration')?.valueChanges.pipe(
      takeUntil(this.componentDestroy())
    ).subscribe((value: number) => {
      const jobStartDate = this.generalInformationForm.get('jobStartDate')?.value;
      if (!(jobStartDate instanceof Date)) {
        return;
      }

      this.autoSetupJobEndDateControl(value, jobStartDate);
      this.changeDetection.markForCheck();
    });

    this.generalInformationForm.get('jobStartDate')?.valueChanges.pipe(
      takeUntil(this.componentDestroy())
    ).subscribe((value: Date) => {
      const duration = this.generalInformationForm.get('duration')?.value;

      if (isNaN(parseInt(duration)) || !(value instanceof Date)) {
        return;
      }

      this.autoSetupJobEndDateControl(duration, value);
      this.changeDetection.markForCheck();
    });
    this.jobDistributionForm
    .get('distributionDelay')
    ?.valueChanges.pipe(distinctUntilChanged(), takeUntil(this.componentDestroy()))
    .subscribe((value: boolean) => {
      const Distributiondelay = this.getSelectedFormConfig(JobDistributionForm);
      if (value) {
if(!this.isEdit){
        viewDistributiontoVMS(true, Distributiondelay);
        if (this.isDistributionActivate) {
          this.distributionFilter = {
            regionId: this.generalInformationForm.get('departmentId')?.value
              ? this.generalInformationForm.get('regionId')?.value
              : null,
            locationId: this.generalInformationForm.get('departmentId')?.value
              ? this.generalInformationForm.get('locationId')?.value
              : null,
            departmentId: this.generalInformationForm.get('departmentId')?.value
              ? this.generalInformationForm.get('departmentId')?.value
              : null,
          };

          this.store.dispatch(new GetJobDistributionValues(this.distributionFilter));
          this.selectedDistribution$.pipe(takeUntil(this.unsubscribe$)).subscribe((orgStructure: OrgStructureDto) => {
            if (orgStructure != null) {
              this.jobDistributionForm.get('distributeToVMS')?.setValue(orgStructure.distributionConfigs.value);
              this.jobDistributionForm.get('distributeToVMS')?.enable();
              this.jobDistributionForm.get('distributionDelay')?.setValue(true);
            }
            this.changeDetection.markForCheck();
          });
        } else {
          this.jobDistributionForm.get('distributeToVMS')?.setValue(null);
          this.jobDistributionForm.get('distributeToVMS')?.disable();
          this.jobDistributionForm.get('distributionDelay')?.setValue(false);
        }
      }
      } else if (!value) {
        this.jobDistributionForm.get('distributeToVMS')?.setValue(null);
        this.jobDistributionForm.get('distributeToVMS')?.disable();
      }
      this.changeDetection.markForCheck();
    });

    this.generalInformationForm.get('departmentId')?.valueChanges.pipe(
      filter((id) => !!id),
      map((id: number) => this.getContactDetailsById(id)),
      switchMap((id: number) => {
        return forkJoin([
          this.settingsViewService.getViewSettingKey(
            OrganizationSettingKeys.TieringLogic,
            OrganizationalHierarchy.Department,
            id, undefined, true),
            this.settingsViewService.getViewSettingKey(
              OrganizationSettingKeys.TieringLogic,
              OrganizationalHierarchy.Department,
              id, undefined, false),
        ]);
      }),
      takeUntil(this.componentDestroy())
    ).subscribe((logic) => {
      const jobDistributionForm = this.getSelectedFormConfig(JobDistributionForm);
      const sourceForJobDistribution = getDataSourceForJobDistribution(this.selectedSystem, logic[0]['TieringLogic'] === 'true', false, logic[1]['TieringLogic'] === 'true');
      setDataSource(jobDistributionForm.fields, 'jobDistribution', sourceForJobDistribution);

      this.setJobDistributionValue();
      this.changeDetection.markForCheck();
    });

    this.jobDistributionForm.get('jobDistribution')?.valueChanges.pipe(
      filter((id) => !!id),
      takeUntil(this.componentDestroy())
    ).subscribe((value: number[]) => {
      this.distributionIds = this.jobDistributionForm.get('jobDistribution')?.value;
        const selecteddistributiondelay = this.getSelectedFormConfig(JobDistributionForm);
        if (
          this.distributionIds?.includes(IrpOrderJobDistribution.AllExternal) ||
          this.distributionIds?.includes(IrpOrderJobDistribution.SelectedExternal)
        ) {
          if (this.isDistributionActivate) {
            if(!this.isEdit)
            {
            viewDistributiondelay(true, selecteddistributiondelay);
            this.distributionFilter = {
              regionId: this.generalInformationForm.get('departmentId')?.value
                ? this.generalInformationForm.get('regionId')?.value
                : null,
              locationId: this.generalInformationForm.get('departmentId')?.value
                ? this.generalInformationForm.get('locationId')?.value
                : null,
              departmentId: this.generalInformationForm.get('departmentId')?.value
                ? this.generalInformationForm.get('departmentId')?.value
                : null,
            };

            this.store.dispatch(new GetJobDistributionValues(this.distributionFilter));
            this.selectedDistribution$.pipe(takeUntil(this.unsubscribe$)).subscribe((orgStructure: OrgStructureDto) => {
              if (orgStructure != null) {
                this.jobDistributionForm.get('distributeToVMS')?.setValue(orgStructure.distributionConfigs.value);
                this.jobDistributionForm.get('distributionDelay')?.setValue(true);
              }
              this.changeDetection.markForCheck();
            });
          }
          }
        } else {
          viewDistributiondelay(false, selecteddistributiondelay);
        }
      const internalLogicIncompatible = value.includes(TierInternal.id)
      && this.selectedOrder?.jobDistributionValue?.includes(AllInternalJob.id);

      if (internalLogicIncompatible) {
        this.store.dispatch(new ShowToast(MessageTypes.Error, InternalTieringError));
        const filteredValues = this.setCorrectDistributions(value);

        this.jobDistributionForm.get('jobDistribution')?.patchValue(filteredValues,
        { emitEvent: false });
      } else {
        const selectedConfig = this.getSelectedFormConfig(JobDistributionForm);
        const agencyFormControl = this.jobDistributionForm.get('agencyId') as AbstractControl;
        updateJobDistributionForm(value, selectedConfig, this.orderTypeForm, agencyFormControl);
        agencyFormControl?.updateValueAndValidity();
        this.showDistributionErrorMessage();
      }

      this.changeDetection.markForCheck();
    });

    this.generalInformationForm.get('shift')?.valueChanges.pipe(
      filter(() => true),
      takeUntil(this.componentDestroy())
    ).subscribe((value: number) => {
      this.generalInformationForm.get('shiftStartTime')?.reset({ emitEvent: false });
      this.generalInformationForm.get('shiftEndTime')?.reset({ emitEvent: false });
      this.changeDetection.markForCheck();
      if (value != null) {
        const shiftDetails = this.allShifts.find(f => f.id == value);
        if (shiftDetails != null && shiftDetails.id != 0) {
          const [startH, startM, startS] = getHoursMinutesSeconds(shiftDetails.startTime);
          const [endH, endM, endS] = getHoursMinutesSeconds(shiftDetails.endTime);
          const startDate = new Date();
          const endDate = new Date();
          startDate.setHours(startH, startM, startS);
          endDate.setHours(endH, endM, endS);
          this.generalInformationForm.controls['shiftStartTime'].setValue(startDate, { emitEvent: false });
          this.generalInformationForm.controls['shiftEndTime'].setValue(endDate, { emitEvent: false });
          this.changeDetection.markForCheck();
        } else {
          this.generalInformationForm.get('shiftStartTime')?.reset();
          this.generalInformationForm.get('shiftEndTime')?.reset();
          this.changeDetection.markForCheck();
        }
      }
    });

    this.generalInformationForm.get('shiftStartTime')?.valueChanges.pipe(
      filter(() => true),
      takeUntil(this.componentDestroy())
    ).subscribe((value: Date) => {
      if (value instanceof Date) {
        this.generalInformationForm.get('shift')?.setValue(0, { emitEvent: false });
      }

    });

    this.generalInformationForm.get('shiftEndTime')?.valueChanges.pipe(
      filter(() => true),
      takeUntil(this.componentDestroy())
    ).subscribe((value: Date) => {
      if (value instanceof Date) {
        this.generalInformationForm.get('shift')?.setValue(0, { emitEvent: false });
      }
    });
    this.generalInformationForm
      .get('jobStartDate')
      ?.valueChanges.pipe(filter(Boolean), takeUntil(this.componentDestroy()))
      .subscribe((value: any | undefined) => {
        const regionID = this.generalInformationForm.get('regionId')?.value;
        const locations = this.organizationStructureService.getLocationsById(regionID, value);
        const locID = this.generalInformationForm.get('locationId')?.value;
        const deparment = this.organizationStructureService.getDepartmentsById(locID, value);
        const deptID = this.generalInformationForm.get('departmentId')?.value;
        this.isDeptShow = deparment.some((deparment) => deparment.id == deptID);
        this.isShow = locations.some((location) => location.id == locID);
        if (!this.isShow) {
          this.generalInformationForm.get('locationId')?.reset();
          this.generalInformationForm.get('departmentId')?.reset();
        }
        if (!this.isDeptShow) {
          this.generalInformationForm.get('departmentId')?.reset();
        }
        this.updateDataSourceFormList('locations', locations);
        this.updateDataSourceFormList('departments', deparment);
        const selectedForm = this.getSelectedFormConfig(GeneralInformationForm);
        setDataSource(selectedForm.fields, 'locationId', locations);
        setDataSource(selectedForm.fields, 'departmentId', deparment);
        this.changeDetection.markForCheck();
      });

    this.generalInformationForm
      .get('jobDates')
      ?.valueChanges.pipe(filter(() => true), takeUntil(this.componentDestroy()))
      .subscribe((value: any | undefined) => {
        if (value.length > 0) {
          const regionID = this.generalInformationForm.get('regionId')?.value;
          const locations = this.organizationStructureService.getLocationsByIdSet(regionID, value);
          const locID = this.generalInformationForm.get('locationId')?.value;
          const deparment = this.organizationStructureService.getDepartmentByIdSet(locID, value);
          const deptID = this.generalInformationForm.get('departmentId')?.value;
          this.isDeptShow = deparment.some((deparment) => deparment.id == deptID);
          this.isShow = locations.some((location) => location.id == locID);
          if (!this.isShow) {
            this.generalInformationForm.get('locationId')?.reset();
            this.generalInformationForm.get('departmentId')?.reset();
          }
          if (!this.isDeptShow) {
            this.generalInformationForm.get('departmentId')?.reset();
          }
          this.updateDataSourceFormList('locations', locations);
          this.updateDataSourceFormList('departments', deparment);
          const selectedForm = this.getSelectedFormConfig(GeneralInformationForm);
          setDataSource(selectedForm.fields, 'locationId', locations);
          setDataSource(selectedForm.fields, 'departmentId', deparment);
          this.changeDetection.markForCheck();
        }
      });
  }

  private showDistributionErrorMessage(): void {
    const distributionControl = this.jobDistributionForm.get('jobDistribution');
    if (distributionControl?.errors && !this.isTemplate) {
      distributionControl.markAsTouched();
      this.store.dispatch(new ShowToast(MessageTypes.Error, distributionControl?.errors['errorMessage']));
    }
  }

  private updateDataSourceFormList(name: string, value: DataSourceContainer): void {
    this.dataSourceContainer = {
      ...this.dataSourceContainer,
      [name]: value,
    };
  }

  private getSelectedArrayFormsConfig(config: OrderFormsArrayConfig): OrderFormsArrayConfig {
    return this.orderFormsArrayConfig.find((arrayConfig: OrderFormsArrayConfig) => {
      return arrayConfig.formList === config.formList;
    }) as OrderFormsArrayConfig;
  }

  private getSelectedFormConfig(formName: string): OrderFormsConfig {
    return this.orderFormsConfig.find((config: OrderFormsConfig) => config.formName === formName) as OrderFormsConfig;
  }

  private autoSetupJobEndDateControl(duration: Duration, jobStartDate: Date): void {
    const jobStartDateValue = new Date(jobStartDate.getTime());
    const jobEndDateControl = this.generalInformationForm.get('jobEndDate') as AbstractControl;

    const jobEndDate: Date = this.durationService.getEndDate(duration, jobStartDateValue);
    jobEndDateControl.patchValue(jobEndDate);
  }

  private initOrderTypeForm(): void {
    this.orderTypeForm = this.orderDetailsService.createOrderTypeForm();
  }

  private getSelectedConfigFromList(formName: string): OrderFormsArrayConfig {
    return this.orderFormsArrayConfig.find(
      (config: OrderFormsArrayConfig) => config.formList === formName
    ) as OrderFormsArrayConfig;
  }

  private watchForSaveAction(): void {
    this.irpStateService.saveEvents.pipe(
      takeUntil(this.componentDestroy())
    ).subscribe(() => {
      if (this.selectedOrder) {
        this.irpStateService.deleteDocuments(this.deleteDocumentsGuids);
      }

      this.irpStateService.setFormState({
        orderType: this.orderTypeForm,
        internalDistributionChanged: this.checkIfInternalDistributionChanged(),
        ...this.listOfKeyForms,
      });

      this.irpStateService.setDocuments(this.documents);
      this.changeDetection.markForCheck();
    });
  }

  private clearFormLists(): void {
    this.contactDetailsFormsList = [];
    this.workLocationFormsList = [];
  }

  private getComments(): void {
    this.commentsService.getComments(this.commentContainerId, null)
      .pipe(takeUntil(this.componentDestroy()))
      .subscribe((comments: Comment[]) => {
        this.comments = comments;
      });
  }

  private watchForSelectOrder(): void {
    this.selectedOrder$.pipe(
      filter(Boolean),
      map((selectedOrder: Order) => {
        this.selectedOrder = adaptOrder(selectedOrder);
        return selectedOrder.organizationId as number;
      }),
      switchMap((id: number) => {
        return this.settingsViewService.getViewSettingKey(
          OrganizationSettingKeys.MandatorySpecialProjectDetails,
          OrganizationalHierarchy.Organization,
          id,
          id,
          true
        );
      }),
      takeUntil(this.componentDestroy())
    ).subscribe(({MandatorySpecialProjectDetails}) => {
      this.specialProjectConfigurationSettings = JSON.parse(MandatorySpecialProjectDetails);
      this.orderTypeForm.disable();
      this.commentContainerId = this.selectedOrder.commentContainerId as number;
      this.getComments();
      this.orderStatus = this.selectedOrder.statusText;
      this.getAllShifts();
      this.setConfigType(this.selectedOrder);
      this.patchFormValues(this.selectedOrder);
      this.createPatchContactDetails(this.selectedOrder);
      this.createPatchWorkLocation(this.selectedOrder);
      this.updateSpecialProjectValidation(this.specialProjectConfigurationSettings);
    });
  }

  private patchFormValues(selectedOrder: Order): void {
    this.isEdit=true;
    this.orderTypeForm.patchValue(selectedOrder);
    this.generalInformationForm.patchValue({
      jobStartDate: selectedOrder.jobStartDate,
      jobEndDate: selectedOrder.jobEndDate,
      regionId: selectedOrder.regionId,
      locationId: selectedOrder.locationId,
      departmentId: selectedOrder.departmentId,
      skillId: selectedOrder.skillId,
      openPositions: selectedOrder.openPositions,
      linkedId: selectedOrder.linkedId
    });
    setTimeout(() => {
      this.generalInformationForm.patchValue({
        shift: selectedOrder.shift,
        shiftStartTime: selectedOrder.shiftStartTime? DateTimeHelper.setCurrentTimeZone(selectedOrder.shiftStartTime.toString()): null,
        shiftEndTime: selectedOrder.shiftEndTime?  DateTimeHelper.setCurrentTimeZone(selectedOrder.shiftEndTime.toString()) : null,
        duration: selectedOrder.duration,
      }, { emitEvent: false });
    }, 1000);

    this.jobDistributionForm.patchValue(selectedOrder);
    this.jobDescriptionForm.patchValue(selectedOrder);
    this.specialProjectForm.patchValue(selectedOrder);

    if (selectedOrder.orderType === IrpOrderType.PerDiem as unknown as OrderType) {
      this.generalInformationForm.patchValue({
        jobDates: selectedOrder.jobDates,
      });

      const isPerDiemOrderEditable = this.orderDetailsService.hasEditablePerDiemOrder(this.selectedOrder);
      const generalInformationConfig = this.getSelectedFormConfig(GeneralInformationForm);
      changeTypeField(generalInformationConfig.fields, 'jobDates', FieldType.Date);

      if (isPerDiemOrderEditable) {
        this.generalInformationForm.controls['jobDates'].disable();
      }
    }

    if (selectedOrder.status === OrderStatus.Filled || selectedOrder.status === OrderStatus.Closed) {
      this.generalInformationForm.get('openPositions')?.disable();
    }
    this.generalInformationForm.patchValue({
      distributionDelay: selectedOrder.distributionDelay,
      distributeToVMS: selectedOrder.distributeToVMS,
    });

    if (selectedOrder.distributeToVMS !=null) {
      const Distributiondelay = this.getSelectedFormConfig(JobDistributionForm);
      viewDistributiontoVMS(true, Distributiondelay);
      this.jobDistributionForm.get('distributionDelay')?.disable();
      this.jobDistributionForm.get('distributeToVMS')?.disable();
    }
  }

  private setConfigType(selectedOrder: Order): void {
    if (selectedOrder.orderType === IrpOrderType.PerDiem as unknown as OrderType) {
      this.orderFormsConfig = perDiemConfig(this.selectedSystem);
    } else {
      this.orderFormsConfig = LongTermAssignmentConfig(this.selectedSystem, this.isDistributionActivate);
    }
  }

  private createPatchContactDetails(selectedOrder: Order): void {
    const selectedConfig = this.getSelectedArrayFormsConfig({ formList: ContactDetailsList } as OrderFormsArrayConfig);

    selectedOrder.contactDetails.forEach((contact: OrderContactDetails, index: number) => {
      if (!ORDER_CONTACT_DETAIL_TITLES.includes(contact.name)) {
        changeTypeEditButton(selectedConfig, index);
      }

      const contactForm = this.orderDetailsService.createContactDetailsForm(this.contactDetailsFormsList.length);
      contactForm.patchValue(contact);
      selectedConfig?.forms.push(ContactDetailsForm());
      this.contactDetailsFormsList.push(contactForm);
    });

    showHideFormAction(selectedConfig, this.contactDetailsFormsList);
  }

  private createPatchWorkLocation(selectedOrder: Order): void {
    const selectedConfig = this.getSelectedArrayFormsConfig({ formList: WorkLocationList } as OrderFormsArrayConfig);

    selectedOrder.workLocations.forEach((workLocation: OrderWorkLocation) => {
      const workLocationForm = this.orderDetailsService.createWorkLocationForm();
      workLocationForm.patchValue(workLocation);
      selectedConfig?.forms.push(WorkLocationFrom(this.dataSourceContainer.state));
      this.workLocationFormsList.push(workLocationForm);
    });

    showHideFormAction(selectedConfig, this.contactDetailsFormsList);
  }

  private setDataSourceForSpecialProject(data?: SpecialProjectStructure): void {
    const specialProjectForm = this.getSelectedFormConfig(SpecialProjectForm);
    setDataSource(
      specialProjectForm.fields,
      'projectTypeId',
      data?.specialProjectCategories.filter(f => f.includeInIRP == true) ?? this.dataSourceContainer.specialProjectCategories as SpecialProjectCategories[]
    );
    setDataSource(
      specialProjectForm.fields,
      'poNumberId',
      data?.poNumbers ?? this.dataSourceContainer.poNumbers as PoNumbers[]
    );
  }

  private setDataSourceForWorkLocationList(state?: StateList[]): void {
    const workLocationForm = this.getSelectedConfigFromList(WorkLocationList);
    workLocationForm.forms.forEach((form: OrderFormInput[]) => {
      setDataSource(form, 'state', state ?? this.dataSourceContainer.state as StateList[]);
    });
  }

  private watchForOrganizationStructure(): void {
    this.organizationStructure$
      .pipe(
        filter(Boolean),
        map((structure: OrganizationStructure) =>
          this.organizationStructureService.getOrgStructureForIrp(structure.regions)
        ),
        takeUntil(this.componentDestroy())
      ).subscribe((structure: OrganizationRegion[]) => {
        if (!this.selectedOrder) {
          this.generalInformationForm.get('regionId')?.reset();
        }
        this.updateDataSourceFormList('regions', structure);
        const selectedForm = this.getSelectedFormConfig(GeneralInformationForm);
        setDataSource(selectedForm.fields, 'regionId', structure);
        this.changeDetection.markForCheck();
      });

    this.organization$.pipe(
      filter((organisation: Organization) => !!organisation && !this.selectedOrder),
      map((organisation: Organization) => {
        this.isDistributionActivate = !!organisation.isDistributionActivate;
        return organisation.organizationId as number;
      }),
      switchMap((id: number) => {
        return this.settingsViewService.getViewSettingKey(
          OrganizationSettingKeys.MandatorySpecialProjectDetails,
          OrganizationalHierarchy.Organization,
          id,
          id,
          true
        );
      }),
      takeUntil(this.componentDestroy())
    ).subscribe(({MandatorySpecialProjectDetails}) => {
      this.specialProjectConfigurationSettings = JSON.parse(MandatorySpecialProjectDetails);
      const orderTypeToPrePopulate =
        this.orderManagementService.getOrderTypeToPrePopulate() || IrpOrderType.LongTermAssignment;
      this.orderManagementService.clearOrderTypeToPrePopulate();
      this.orderTypeForm.get('orderType')?.patchValue(orderTypeToPrePopulate);
      this.store.dispatch([
        new GetProjectSpecialData(),
        new GetOrganizationStatesWithKeyCode(),
      ]);

      this.generalInformationForm.reset();
      this.jobDistributionForm.reset();
      this.jobDescriptionForm.reset();
      this.specialProjectForm.reset();

      this.updateSpecialProjectValidation(this.specialProjectConfigurationSettings);
      this.changeDetection.markForCheck();
    });
  }

  private updateSpecialProjectValidation(projectSetting = false): void {
    const specialProjectConfig = this.getSelectedFormConfig(SpecialProjectForm);
    const specialProjectControls = this.listOfKeyForms.specialProjectForm.controls;

    this.orderDetailsService.updateSpecialProjectValidation(
      specialProjectConfig,
      specialProjectControls,
      projectSetting
    );
  }

  private getContactDetailsById(id: number): number {
    if (!this.selectedOrder) {
      this.store.dispatch(new GetContactDetails(id));
    }
    return id;
  }

  private setJobDistributionValue(): void {
    if (this.isTieringLogicLoad && this.selectedOrder) {
      this.jobDistributionForm.get('jobDistribution')?.patchValue(this.selectedOrder.jobDistributionValue);
      this.isTieringLogicLoad = false;
    }
  }

  private setSkillFilters(skills: ListOfSkills[]): void {
    this.updateDataSourceFormList('skills', skills);
    const selectedForm = this.getSelectedFormConfig(GeneralInformationForm);
    setDataSource(selectedForm.fields, 'skillId', skills);

    if (!this.selectedOrder) {
      this.generalInformationForm.get('skillId')?.reset();
    } else {
      this.generalInformationForm.get('skillId')?.setValue(this.selectedOrder.skillId);
    }

    this.changeDetection.markForCheck();
  }

  private watchForSpecialProjectCategory(): void {
    this.specialProjectForm.get('projectTypeId')?.valueChanges.pipe(takeUntil(this.componentDestroy())).subscribe((id: any) => {
      if (id) {
        this.specialProjectForm.controls['projectNameId'].reset();
        this.updateDataSourceFormList('projectNames', []);
        const specialProjectForm = this.getSelectedFormConfig(SpecialProjectForm);
        setDataSource(
          specialProjectForm.fields,
          'projectNameId',
          []
        );
        this.projectSpecialData$.pipe(
          filter(Boolean),
          map((data: ProjectSpecialData) => mapSpecialProjectStructure(data)),
          takeUntil(this.componentDestroy())
        ).subscribe((data: SpecialProjectStructure) => {
          this.updateDataSourceFormList('projectNames', data.projectNames.filter(f => f.includeInIRP == true && f.projectTypeId == id));
          const specialProjectForm = this.getSelectedFormConfig(SpecialProjectForm);
          setDataSource(
            specialProjectForm.fields,
            'projectNameId',
            data?.projectNames.filter(f => f.includeInIRP == true && f.projectTypeId == id) ?? this.dataSourceContainer.projectNames as ProjectNames[]
          );
          this.changeDetection.markForCheck();
        });
      } else {
        this.specialProjectForm.controls['projectNameId'].reset();
        this.updateDataSourceFormList('projectNames', []);
        const specialProjectForm = this.getSelectedFormConfig(SpecialProjectForm);
        setDataSource(
          specialProjectForm.fields,
          'projectNameId',
          []
        );
      }

      this.changeDetection.markForCheck();
    });
  }

  private watchForCredentialsControls(): void {
    const departmentControl = this.generalInformationForm.get('departmentId');
    const skillControl = this.generalInformationForm.get('skillId');

    if (!departmentControl || !skillControl || this.selectedOrder) {
      return;
    }

    combineLatest([departmentControl.valueChanges, skillControl.valueChanges])
      .pipe(takeUntil(this.componentDestroy()))
      .subscribe(([departmentId, skillId]) => {
        if (departmentId && skillId && !this.selectedOrder) {
          this.store.dispatch(new GetPredefinedCredentials(departmentId, skillId, SystemType.IRP));
        }
      });
  }

  private setCorrectDistributions(values: number[]): number[] {
    const filteredValues = values.filter((item) => item !== TierInternal.id);

    if (!filteredValues.includes(AllInternalJob.id)) {
      filteredValues.push(AllInternalJob.id);
    }

    return filteredValues;
  }

  private checkIfInternalDistributionChanged(): boolean {
    const internalTieringWasSelected = this.selectedOrder
    && this.selectedOrder.jobDistributionValue?.includes(TierInternal.id);
    const allInternalSelected = this.jobDistributionForm.get('jobDistribution')?.value?.includes(AllInternalJob.id);

    return internalTieringWasSelected && allInternalSelected;
  }
}
