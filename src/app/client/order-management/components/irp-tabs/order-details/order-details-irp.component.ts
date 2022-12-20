import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, TrackByFunction } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';

import { filter, map, Observable, takeUntil } from 'rxjs';
import { Select, Store } from '@ngxs/store';
import { FieldSettingsModel } from '@syncfusion/ej2-angular-dropdowns';

import { OptionFields } from '@client/order-management/constants';
import {
  DataSourceContainer,
  OrderDataSourceContainer,
  OrderFormInput,
  OrderFormsArrayConfig,
  OrderFormsConfig,
  OrderTypes,
  PoNumbers,
  ProjectNames,
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
  OrderTypeList, SpecialProjectForm, TimeMask, TitleField, WorkLocationList,
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
  changeTypeField, getAgencyIdFiled,
  mapAssociateAgencyStructure,
  mapReasonsStructure,
  mapSpecialProjectStructure,
  mapStatesStructure,
  mapStructureToEditedOrder,
  setDataSource,
  setDefaultPrimaryContact,
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
import { ORDER_CONTACT_DETAIL_TITLES } from '@shared/constants';
import { IrpOrderJobDistribution } from '@shared/enums/job-distibution';
import { OrderManagementContentState } from '@client/store/order-managment-content.state';
import { AssociateAgency } from '@shared/models/associate-agency.model';
import { ProjectSpecialData } from '@shared/models/project-special-data.model';
import { Document } from '@shared/models/document.model';
import { IrpContainerStateService } from '@client/order-management/containers/irp-container/irp-container-state.service';
import { Order, OrderContactDetails, OrderWorkLocation } from '@shared/models/order-management.model';
import { OrderType } from '@shared/enums/order-type';
import { UserState } from '../../../../../store/user.state';
import { OrganizationRegion, OrganizationStructure } from '@shared/models/organization.model';
import { OrganizationStructureService } from '@client/order-management/components/irp-tabs/services';

@Component({
  selector: 'app-order-details-irp',
  templateUrl: './order-details-irp.component.html',
  styleUrls: ['./order-details-irp.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderDetailsIrpComponent extends Destroyable implements OnInit, OnDestroy {
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
  public orderFormsConfig: OrderFormsConfig[] = LongTermAssignmentConfig;
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
  private isLocationLoad = true;
  private isDepartmentLoad = true;

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

  constructor(
    private orderDetailsService: OrderDetailsIrpService,
    private changeDetection: ChangeDetectorRef,
    private store: Store,
    private durationService: DurationService,
    private irpStateService: IrpContainerStateService,
    private organizationStructureService: OrganizationStructureService
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

  override ngOnDestroy(): void {
    super.ngOnDestroy();

    this.clearConfigs();
  }

  public addFields(config: OrderFormsArrayConfig): void {
    const selectedConfig = this.getSelectedArrayFormsConfig(config);

    if(config.buttonType === ButtonType.addContact) {
      selectedConfig?.forms.push(ContactDetailsForm());
      this.contactDetailsFormsList.push(
        this.orderDetailsService.createContactDetailsForm(this.contactDetailsFormsList.length)
      );
      this.showHideFormAction(selectedConfig, this.contactDetailsFormsList);
    } else {
      selectedConfig?.forms.push(WorkLocationFrom(this.dataSourceContainer.state));
      this.workLocationFormsList.push(this.orderDetailsService.createWorkLocationForm());
      this.showHideFormAction(selectedConfig, this.workLocationFormsList);
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
        this.removeFields(selectedConfig, index, this.contactDetailsFormsList);
        setDefaultPrimaryContact(this.contactDetailsFormsList);
        break;
      case ButtonType.RemoveWorkLocation:
        this.removeFields(selectedConfig, index, this.workLocationFormsList);
        break;
      case ButtonType.Edit:
        this.changeTypeEditButton(selectedConfig, index);
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
    this.jobDescriptionForm =  this.orderDetailsService.createJobDescriptionForm();
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
    } else {
      this.generalInformationForm = this.orderDetailsService.createGeneralInformationPOForm();
      this.jobDistributionForm = this.orderDetailsService.createJobDistributionPOForm();
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
        this.orderFormsConfig = LongTermAssignmentConfig;
      } else {
        this.orderFormsArrayConfig =
          [...ContactDetailsConfig(ContactDetailsForm()), ...WorkLocationConfig(WorkLocationFrom())];
        this.orderFormsConfig = perDiemConfig();
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
  }

  private watchForFormValueChanges(): void {
    this.generalInformationForm.get('regionId')?.valueChanges.pipe(
      filter(Boolean),
      takeUntil(this.componentDestroy())
    ).subscribe((value: number) => {
      const locations = this.organizationStructureService.getLocationsById(value);

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

      this.updateDataSourceFormList('departments', departments);
      const selectedForm = this.getSelectedFormConfig(GeneralInformationForm);
      setDataSource(selectedForm.fields, 'departmentId', departments);

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

    //todo: uncomment logic for IRP tiers
    /*this.generalInformationForm.get('departmentId')?.valueChanges
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
        const selectedForm = this.getSelectedFormConfig(JobDistributionForm);
        setDataSource(
          selectedForm.fields,
        'jobDistribution',
          getDistributionSource(TieringLogic === TierLogic.Show)
        );

        if(this.selectedOrder) {
          this.jobDistributionForm.get('jobDistribution')?.patchValue(this.selectedOrder.jobDistributionValue);
        }
        this.changeDetection.markForCheck();
    });*/

    this.jobDistributionForm.get('jobDistribution')?.valueChanges.pipe(
      filter(Boolean),
      takeUntil(this.componentDestroy())
    ).subscribe((value: number[]) => {
      const selectedConfig = this.getSelectedFormConfig(JobDistributionForm);
      const agencyConfigControl = getAgencyIdFiled(selectedConfig);
      const rateConfigControl = this.getRateConfigControl(selectedConfig);

      if(value.includes(IrpOrderJobDistribution.SelectedExternal)) {
        agencyConfigControl.enabled = true;
        rateConfigControl.show = true;
      } else {
        agencyConfigControl.enabled = false;
        rateConfigControl.show = false;
      }

        this.changeDetection.markForCheck();
    });
  }

  private showHideFormAction(config: OrderFormsArrayConfig, list: FormGroup[]): void {
    config.forms.forEach((form: OrderFormInput[]) => {
      form.forEach((field: OrderFormInput) => {
        if (
          (field.type === FieldType.Button || field.type === FieldType.RadioButton) && field.buttonType !== ButtonType.Edit
        ) {
          field.show = list.length > 1;
        }
      });
    });
  }

  private updateDataSourceFormList(name: string, value: DataSourceContainer): void {
    this.dataSourceContainer = {
      ...this.dataSourceContainer,
      [name]: value,
    };
  }

  private removeFields(config: OrderFormsArrayConfig, index: number, form: FormGroup[]): void {
    config?.forms.splice(index, 1);
    form.splice(index, 1);

    if (form.length < 2) {
      this.showHideFormAction(config, this.contactDetailsFormsList);
    }
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

  private changeTypeEditButton(config: OrderFormsArrayConfig, index: number): void {
    config?.forms[index].forEach((field: OrderFormInput) => {
      if(field.field === TitleField) {
        field.type = field.type === FieldType.Input ? FieldType.Dropdown : FieldType.Input;
      }
    });
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
      map((selectedOrder: Order) => mapStructureToEditedOrder(selectedOrder)),
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
    this.jobDistributionForm.get('jobDistribution')?.patchValue(this.selectedOrder.jobDistributionValue);

    if(selectedOrder.orderType === OrderType.OpenPerDiem) {
      const generalInformationConfig = this.getSelectedFormConfig(GeneralInformationForm);
      changeTypeField(generalInformationConfig.fields, 'jobDates', FieldType.Date);
    }
  }

  private setConfigType(selectedOrder: Order): void {
    if(selectedOrder.orderType === OrderType.OpenPerDiem) {
      this.orderFormsConfig = perDiemConfig();
    } else {
      this.orderFormsConfig = LongTermAssignmentConfig;
    }
  }

  private createPatchContactDetails(selectedOrder: Order): void {
    const selectedConfig = this.getSelectedArrayFormsConfig({formList: ContactDetailsList} as OrderFormsArrayConfig);

    selectedOrder.contactDetails.forEach((contact: OrderContactDetails, index: number) => {
      if(!ORDER_CONTACT_DETAIL_TITLES.includes(contact.name)) {
        this.changeTypeEditButton(selectedConfig, index);
      }

      const contactForm = this.orderDetailsService.createContactDetailsForm(this.contactDetailsFormsList.length);
      contactForm.patchValue(contact);
      selectedConfig?.forms.push(ContactDetailsForm());
      this.contactDetailsFormsList.push(contactForm);
    });
    this.showHideFormAction(selectedConfig, this.contactDetailsFormsList);
  }

  private createPatchWorkLocation(selectedOrder: Order): void {
    const selectedConfig = this.getSelectedArrayFormsConfig({formList: WorkLocationList} as OrderFormsArrayConfig);

    selectedOrder.workLocations.forEach((workLocation: OrderWorkLocation) => {
      const workLocationForm = this.orderDetailsService.createWorkLocationForm();
      workLocationForm.patchValue(workLocation);
      selectedConfig?.forms.push(WorkLocationFrom(this.dataSourceContainer.state));
      this.workLocationFormsList.push(workLocationForm);
    });

    this.showHideFormAction(selectedConfig, this.contactDetailsFormsList);
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

  private getRateConfigControl(config: OrderFormsConfig): OrderFormInput {
    const orderType = this.orderTypeForm.get('orderType')?.value;
    const controlType = orderType === IrpOrderType.LongTermAssignment ? 'hourlyRate': 'billRate';

    return config?.fields.find((control: OrderFormInput) => {
      return control.field === controlType;
    }) as OrderFormInput;
  }

  private clearConfigs(): void {
    const selectedConfig = this.getSelectedFormConfig(JobDistributionForm);
    getAgencyIdFiled(selectedConfig).enabled = false;
    this.getRateConfigControl(selectedConfig).show = false;
    this.isLocationLoad = true;
    this.isDepartmentLoad = true;
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

      this.updateDataSourceFormList('regions', structure);
      const selectedForm = this.getSelectedFormConfig(GeneralInformationForm);
      setDataSource(selectedForm.fields, 'regionId', structure);
      this.changeDetection.markForCheck();
    });
  }
}
