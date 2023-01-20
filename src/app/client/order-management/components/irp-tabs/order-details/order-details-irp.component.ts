import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  TrackByFunction,
} from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';

import { filter, map, Observable, switchMap, takeUntil } from 'rxjs';
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
  SelectSystem,
  SpecialProjectCategories,
  SpecialProjectStructure,
  StateList,
} from '@client/order-management/interfaces';
import {
  ContactDetailsList,
  DateFormat, DateMask,
  GeneralInformationForm,
  Incomplete,
  JobDescriptionForm,
  JobDistributionForm,
  OrderTypeList,
  SpecialProjectForm,
  TierExternalJob,
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
import { FieldType } from '@core/enums';
import PriceUtils from '@shared/utils/price.utils';
import { Destroyable } from '@core/helpers';
import { OrganizationManagementState } from '@organization-management/store/organization-management.state';
import { Region } from '@shared/models/region.model';
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
} from '@client/order-management/components/irp-tabs/order-details/helpers';
import { Department } from '@shared/models/department.model';
import { ListOfSkills } from '@shared/models/skill.model';
import { DurationService } from '@shared/services/duration.service';
import { Duration } from '@shared/enums/durations';
import { RejectReasonState } from '@organization-management/store/reject-reason.state';
import { RejectReason, RejectReasonPage } from '@shared/models/reject-reason.model';
import {
  OrderDetailsIrpService,
} from '@client/order-management/components/irp-tabs/services/order-details-irp.service';
import { ButtonType, IrpOrderType } from '@client/order-management/components/irp-tabs/order-details/order-details-irp.enum';
import { ORDER_CONTACT_DETAIL_TITLES, OrganizationalHierarchy, OrganizationSettingKeys } from '@shared/constants';
import { OrderManagementContentState } from '@client/store/order-managment-content.state';
import { AssociateAgency } from '@shared/models/associate-agency.model';
import { ProjectSpecialData } from '@shared/models/project-special-data.model';
import { Document } from '@shared/models/document.model';
import { IrpContainerStateService } from '@client/order-management/containers/irp-container/irp-container-state.service';
import { Order, OrderContactDetails, OrderWorkLocation, SuggestedDetails } from '@shared/models/order-management.model';
import { UserState } from '../../../../../store/user.state';
import { Organization, OrganizationRegion, OrganizationStructure } from '@shared/models/organization.model';
import { OrganizationStructureService } from '@client/order-management/components/irp-tabs/services';
import {
  GetContactDetails,
  GetOrganizationStatesWithKeyCode,
  GetProjectSpecialData,
  GetSuggestedDetails,
} from '@client/store/order-managment-content.actions';
import { SettingsViewService } from '@shared/services';
import { ShowToast } from '../../../../../store/app.actions';
import { MessageTypes } from '@shared/enums/message-types';
import { OrderType } from '@shared/enums/order-type';

@Component({
  selector: 'app-order-details-irp',
  templateUrl: './order-details-irp.component.html',
  styleUrls: ['./order-details-irp.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderDetailsIrpComponent extends Destroyable implements OnInit {
  @Input() set system(value: SelectSystem) {
    this.selectedSystem = value;

    if(!this.selectedOrder) {
      this.orderFormsConfig = LongTermAssignmentConfig(this.selectedSystem);
      this.setConfigDataSources();
    }
  }

  public orderTypeForm: FormGroup;
  public generalInformationForm: FormGroup;
  public jobDistributionForm: FormGroup;
  public jobDescriptionForm: FormGroup;
  public contactDetailsForm: FormGroup;
  public workLocationForm: FormGroup;
  public specialProjectForm: FormGroup;

  public readonly optionFields: FieldSettingsModel = OptionFields;
  public readonly orderTypesDataSource: OrderTypes[] = OrderTypeList;
  public readonly FieldTypes = FieldType;
  public readonly priceUtils = PriceUtils;
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
  public regionsStructure: OrganizationRegion[] = [];

  private dataSourceContainer: OrderDataSourceContainer = {};
  private selectedSystem: SelectSystem;
  private isTieringLogicLoad = true;

  @Select(OrganizationManagementState.assignedSkillsByOrganization)
  private skills$: Observable<ListOfSkills[]>;
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

  constructor(
    private orderDetailsService: OrderDetailsIrpService,
    private changeDetection: ChangeDetectorRef,
    private store: Store,
    private durationService: DurationService,
    private irpStateService: IrpContainerStateService,
    private organizationStructureService: OrganizationStructureService,
    private settingsViewService: SettingsViewService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initOrderTypeForm();
    this.initForms(IrpOrderType.LongTermAssignment);
    this.watchForOrderTypeControl();
    this.watchForDataSources();
    this.watchForSaveAction();
    this.watchForSelectOrder();
    this.watchForOrganizationStructure();
  }

  public addFields(config: OrderFormsArrayConfig): void {
    const selectedConfig = this.getSelectedArrayFormsConfig(config);

    if(config.buttonType === ButtonType.addContact) {
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

  public trackByTitle(index: number, config: OrderFormsArrayConfig | OrderFormsConfig): string {
    return config.title;
  }

  public trackByField(index: number, config: OrderFormInput): string {
    return config.field;
  }

  public trackByFormTitle: TrackByFunction<OrderFormsConfig> = (index: number, item: OrderFormsConfig) => item.title;

  public selectPrimaryContact(formIndex: number): void {
    this.contactDetailsFormsList.forEach((contact: FormGroup, index: number) => {
      if(formIndex !== index) {
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

   if(!this.selectedOrder) {
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
    if(isLongTermAssignment) {
      this.jobDistributionForm = this.orderDetailsService.createJobDistributionForm();
      this.generalInformationForm = this.orderDetailsService.createGeneralInformationForm();
      this.jobDescriptionForm =  this.orderDetailsService.createJobDescriptionForm();
    } else {
      this.generalInformationForm = this.orderDetailsService.createGeneralInformationPOForm();
      this.jobDistributionForm = this.orderDetailsService.createJobDistributionPOForm();
      this.jobDescriptionForm =  this.orderDetailsService.createJobDescriptionPOForm();
    }
  }

  private watchForOrderTypeControl(): void {
    this.orderTypeForm.get('orderType')?.valueChanges.pipe(
      takeUntil(this.componentDestroy())
    ).subscribe((value: number) => {
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
    setDataSource(jobDescriptionForm.fields, 'orderRequisitionReasonId', this.dataSourceContainer.reasons as RejectReason[]);

    this.setDataSourceForSpecialProject();
    this.setDataSourceForWorkLocationList();

    this.changeDetection.markForCheck();
  }

  private watchForDataSources(): void {
    this.skills$.pipe(
      filter(Boolean),
      takeUntil(this.componentDestroy())
    ).subscribe((skills: ListOfSkills[]) => {
      this.updateDataSourceFormList('skills', skills);
      const selectedForm = this.getSelectedFormConfig(GeneralInformationForm);
      setDataSource(selectedForm.fields, 'skillId', skills);
      this.changeDetection.markForCheck();
    });

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
      this.updateDataSourceFormList('specialProjectCategories', data.specialProjectCategories);
      this.updateDataSourceFormList('projectNames', data.projectNames);
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
  }

  private watchForFormValueChanges(): void {
    this.generalInformationForm.get('regionId')?.valueChanges.pipe(
      filter(Boolean),
      takeUntil(this.componentDestroy())
    ).subscribe((value: number) => {
      const locations = this.organizationStructureService.getLocationsById(value);
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
      const departments = this.organizationStructureService.getDepartmentsById(value);
      this.generalInformationForm.get('departmentId')?.reset();

      this.updateDataSourceFormList('departments', departments);
      const selectedForm = this.getSelectedFormConfig(GeneralInformationForm);
      setDataSource(selectedForm.fields, 'departmentId', departments);
      if(!this.selectedOrder) {
        this.store.dispatch(new GetSuggestedDetails(value));
      }

      this.changeDetection.markForCheck();
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

    this.generalInformationForm.get('departmentId')?.valueChanges.pipe(
      filter(Boolean),
      map((id: number) => this.getContactDetailsById(id)),
      filter((Boolean)),
      switchMap((id: number) => {
        return this.settingsViewService.getViewSettingKey(
          OrganizationSettingKeys.TieringLogic,
          OrganizationalHierarchy.Department,
          id);
      }),
      takeUntil(this.componentDestroy())
    ).subscribe(({ TieringLogic }) => {
      const jobDistributionForm = this.getSelectedFormConfig(JobDistributionForm);
      const sourceForJobDistribution = getDataSourceForJobDistribution(this.selectedSystem);

      if(TieringLogic && this.selectedSystem.isIRP && this.selectedSystem.isVMS) {
        setDataSource(jobDistributionForm.fields, 'jobDistribution', [
          sourceForJobDistribution[0],
          sourceForJobDistribution[1],
          TierExternalJob,
          sourceForJobDistribution[2],
        ]);
      } else {
        setDataSource(jobDistributionForm.fields, 'jobDistribution', sourceForJobDistribution);
      }

      this.setJobDistributionValue();
      this.changeDetection.markForCheck();
    });

    this.jobDistributionForm.get('jobDistribution')?.valueChanges.pipe(
      filter(Boolean),
      takeUntil(this.componentDestroy())
    ).subscribe((value: number[]) => {
      const selectedConfig = this.getSelectedFormConfig(JobDistributionForm);
      const agencyFormControl = this.jobDistributionForm.get('agencyId') as AbstractControl;
      updateJobDistributionForm(value, selectedConfig, this.orderTypeForm, agencyFormControl);
      agencyFormControl?.updateValueAndValidity();
      this.showDistributionErrorMessage();

      this.changeDetection.markForCheck();
    });
  }

  private showDistributionErrorMessage(): void {
    const distributionControl = this.jobDistributionForm.get('jobDistribution');
    if(distributionControl?.errors) {
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
    ) as  OrderFormsArrayConfig;
  }

  private watchForSaveAction(): void {
    this.irpStateService.saveEvents.pipe(
      takeUntil(this.componentDestroy())
    ).subscribe(() => {
      if(this.selectedOrder) {
        this.irpStateService.deleteDocuments(this.deleteDocumentsGuids);
      }

      this.irpStateService.setFormState({
        orderType: this.orderTypeForm,
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

  private watchForSelectOrder(): void {
    this.selectedOrder$.pipe(
      filter(Boolean),
      map((selectedOrder: Order) => adaptOrder(selectedOrder)),
      takeUntil(this.componentDestroy())
    ).subscribe((selectedOrder: Order) => {
      this.selectedOrder = selectedOrder;
      this.orderTypeForm.disable();
      this.orderStatus = selectedOrder.statusText;

      this.setConfigType(selectedOrder);
      this.patchFormValues(selectedOrder);
      this.createPatchContactDetails(selectedOrder);
      this.createPatchWorkLocation(selectedOrder);
    });
  }

  private patchFormValues(selectedOrder: Order): void {
    this.orderTypeForm.patchValue(selectedOrder);
    this.generalInformationForm.patchValue(selectedOrder);
    this.jobDistributionForm.patchValue(selectedOrder);
    this.jobDescriptionForm.patchValue(selectedOrder);
    this.specialProjectForm.patchValue(selectedOrder);

    if(selectedOrder.orderType === IrpOrderType.PerDiem as unknown as OrderType) {
      const generalInformationConfig = this.getSelectedFormConfig(GeneralInformationForm);
      changeTypeField(generalInformationConfig.fields, 'jobDates', FieldType.Date);
    }
  }

  private setConfigType(selectedOrder: Order): void {
    if(selectedOrder.orderType === IrpOrderType.PerDiem as unknown as OrderType) {
      this.orderFormsConfig = perDiemConfig(this.selectedSystem);
    } else {
      this.orderFormsConfig = LongTermAssignmentConfig(this.selectedSystem);
    }
  }

  private createPatchContactDetails(selectedOrder: Order): void {
    const selectedConfig = this.getSelectedArrayFormsConfig({formList: ContactDetailsList} as OrderFormsArrayConfig);

    selectedOrder.contactDetails.forEach((contact: OrderContactDetails, index: number) => {
      if(!ORDER_CONTACT_DETAIL_TITLES.includes(contact.name)) {
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
    const selectedConfig = this.getSelectedArrayFormsConfig({formList: WorkLocationList} as OrderFormsArrayConfig);

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
      data?.specialProjectCategories ?? this.dataSourceContainer.specialProjectCategories as SpecialProjectCategories[]
    );
    setDataSource(
      specialProjectForm.fields,
      'projectNameId',
      data?.projectNames ?? this.dataSourceContainer.projectNames as ProjectNames[]
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
      setDataSource(form,'state', state ?? this.dataSourceContainer.state as StateList[]);
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
        if(!this.selectedOrder) {
          this.generalInformationForm.get('regionId')?.reset();
        }
        this.updateDataSourceFormList('regions', structure);
        const selectedForm = this.getSelectedFormConfig(GeneralInformationForm);
        setDataSource(selectedForm.fields, 'regionId', structure);
        this.changeDetection.markForCheck();
    });

    this.organization$.pipe(
      filter((organisation: Organization) => !!organisation && !this.selectedOrder),
      takeUntil(this.componentDestroy())
    ).subscribe(() => {
      this.orderTypeForm.get('orderType')?.patchValue(IrpOrderType.LongTermAssignment);
      this.store.dispatch([
        new GetProjectSpecialData(),
        new GetOrganizationStatesWithKeyCode(),
      ]);

      this.generalInformationForm.reset();
      this.jobDistributionForm.reset();
      this.jobDescriptionForm.reset();
      this.specialProjectForm.reset();

      this.changeDetection.markForCheck();
    });
  }

  private getContactDetailsById(id: number): number {
    if(!this.selectedOrder) {
      this.store.dispatch(new GetContactDetails(id));
    }
    return id;
  }

  private setJobDistributionValue(): void {
    if(this.isTieringLogicLoad && this.selectedOrder) {
      this.jobDistributionForm.get('jobDistribution')?.patchValue(this.selectedOrder.jobDistributionValue);
      this.isTieringLogicLoad = false;
    }
  }
}
