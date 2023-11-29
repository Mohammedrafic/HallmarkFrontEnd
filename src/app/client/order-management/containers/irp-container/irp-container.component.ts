import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  TrackByFunction,
  ViewChild,
} from '@angular/core';
import { FormGroup,AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';

import { Actions, ofActionDispatched, Select, Store } from '@ngxs/store';
import { filter, Observable, of, Subject, switchMap, take, takeUntil } from 'rxjs';

import { IrpTabConfig } from '@client/order-management/containers/irp-container/irp-container.constant';
import { IrpContainerApiService } from '@client/order-management/containers/irp-container/services';
import {
  IrpContainerStateService,
} from '@client/order-management/containers/irp-container/services/irp-container-state.service';
import { FieldName, IrpTabs } from '@client/order-management/enums';
import {
  createOrderDTO,
  getControlsList,
  getFormsList,
  getSaveasTemplateFormsList,
  getValuesFromList,
  isFormsValid,
  isFormTouched,
  showInvalidFormControl,
} from '@client/order-management/helpers';
import some from 'lodash/fp/some';
import isNil from 'lodash/fp/isNil';
import { ListOfKeyForms, SelectSystem, TabsConfig } from '@client/order-management/interfaces';
import { OrderCredentialsService } from '@client/order-management/services';
import { EditIrpOrder, SaveIrpOrder, SaveIrpOrderSucceeded } from '@client/store/order-managment-content.actions';
import { Destroyable } from '@core/helpers';
import { OrderCandidatesCredentialsState } from '@order-credentials/store/credentials.state';
import { IOrderCredentialItem } from '@order-credentials/types';
import {
  CONFIRM_REVOKE_ORDER,
  DISTRIBUTETOVMS,
  ERROR_CAN_NOT_Edit_OpenPositions,
  ERROR_CAN_NOT_REVOKED,
  INACTIVE_MESSAGE,
  INACTIVEDATE,
  INACTIVEDATE_DEPARTMENT,
  INACTIVEDATE_SHIFT
} from '@shared/constants';
import { MessageTypes } from '@shared/enums/message-types';
import { IrpOrderType, OrderType } from '@shared/enums/order-type';
import { CreateOrderDto, EditOrderDto, Order } from '@shared/models/order-management.model';
import { ConfirmService } from '@shared/services/confirm.service';
import { OrganizationStructureService } from '@shared/services/organization-structure.service';
import { SetHelpSystem, ShowToast } from '../../../../store/app.actions';
import { set, template } from 'lodash';
import { SaveTemplateDialogService } from '@client/order-management/components/save-template-dialog/save-template-dialog.service';
import { Item, MenuEventArgs } from '@syncfusion/ej2-angular-navigations';
import { ToastUtility } from '@syncfusion/ej2-notifications';
import { OrderDetailsFormComponent } from '@client/order-management/components/order-details-form/order-details-form.component';
import { BillRate, OrderBillRateDto } from '@shared/models';
import { OrderDetailsIrpComponent } from '@client/order-management/components/irp-tabs/order-details/order-details-irp.component';
import { SettingsViewService } from '@shared/services';
import { OrganizationSettingKeys,OrganizationalHierarchy } from '@shared/constants';
import { UserState } from 'src/app/store/user.state';
import { OrganizationManagementState } from '@organization-management/store/organization-management.state';
import { Configuration } from '@shared/models/organization-settings.model';
import { SettingsHelper } from '@core/helpers/settings.helper';
import { SettingsKeys } from '@shared/enums/settings';
import {
  GetOrganizationSettings,
} from '@organization-management/store/organization-management.actions';
import { OrderStatus } from '@shared/enums/order-management';
import{ ShiftsService } from '@organization-management/shifts/shifts.service'
import { ScheduleShift } from '@shared/models/schedule-shift.model';
import { IrpOrderJobDistribution } from '@shared/enums/job-distibution';
export enum SubmitButton {
  SaveForLater = '0',
  Save = '1',
  SaveAsTemplate = '2',
}
@Component({
  selector: 'app-irp-container',
  templateUrl: './irp-container.component.html',
  styleUrls: ['./irp-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IrpContainerComponent extends Destroyable implements OnInit, OnChanges {
  @Input('handleSaveEvents') public handleSaveEvents$: Subject<void | MenuEventArgs>;
  @Input() public selectedOrder: Order;
  @Input() selectedSystem: SelectSystem;
  @ViewChild(OrderDetailsIrpComponent, { static: false }) orderDetailsFormComponent: OrderDetailsIrpComponent;
  @ViewChild(OrderDetailsIrpComponent, { static: false }) filterco: OrderDetailsIrpComponent;

  @Select(OrderCandidatesCredentialsState.predefinedCredentials)
  predefinedCredentials$: Observable<IOrderCredentialItem[]>;
  @Select(OrganizationManagementState.organizationSettings)
  private organizationSettings$: Observable<Configuration[]>;

  public tabsConfig: TabsConfig[] = IrpTabConfig;
  public tabs = IrpTabs;
  public orderCredentials: IOrderCredentialItem[] = [];
  public dates: string;
  public locationdates: string;
  public departmentdates: string;
  public shiftdates: string;
  public isLocation = false;
  public isLocationAndDepartment = false;
  public isSaveForTemplate = false;
  public istemp =false;
  public isIRPtab =true;
  public isAddTemplate=false;
  private isCredentialsChanged = false;
  private order: Order;
  public settings: { [key in SettingsKeys]?: Configuration };
  private IsSettingsEnabledByOrganisation=false;
  private IsSettingEnabledByRegLocDept=false;
  public ltaInactiveshift:ScheduleShift| null | undefined;


  constructor(
    private orderCredentialsService: OrderCredentialsService,
    private irpStateService: IrpContainerStateService,
    private store: Store,
    private actions$: Actions,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private saveTemplateDialogService: SaveTemplateDialogService,
    private confirmService: ConfirmService,
    private irpContainerApiService: IrpContainerApiService,
    private organizationStructureService: OrganizationStructureService,
    private datePipe: DatePipe,
    private settingsViewService: SettingsViewService,
    private shiftservice:ShiftsService
   
  ) {
    super();
  }

  ngOnInit(): void {
    this.watchForSaveEvents();
    this.watchForSucceededSaveOrder();
    this.watchForPredefinedCredentials();
    this.store.dispatch(new SetHelpSystem(true));
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['selectedOrder']?.currentValue) {
      this.orderCredentials = [...(this.selectedOrder.credentials ?? [])];
    }
  }

  public trackByFn: TrackByFunction<TabsConfig> = (_: number, tab: TabsConfig) => tab.id;

  public updateOrderCredentials(credential: IOrderCredentialItem): void {
    this.isCredentialsChanged = true;
    this.orderCredentials = this.orderCredentialsService.updateOrderCredentials(this.orderCredentials, credential);
    this.cdr.markForCheck();
  }

  public deleteOrderCredential(credential: IOrderCredentialItem): void {
    this.isCredentialsChanged = true;
    this.orderCredentials = this.orderCredentialsService.deleteOrderCredential(this.orderCredentials, credential);
    this.cdr.markForCheck();
  }

  public isOrderTouched(): boolean {
    this.irpStateService.saveEvents.next();
    const formState = this.irpStateService.getFormState();
    const formGroupList = getFormsList(formState);

    return isFormTouched(formGroupList) || this.isCredentialsChanged;
  }

  private watchForSucceededSaveOrder(): void {
    this.actions$.pipe(ofActionDispatched(SaveIrpOrderSucceeded), takeUntil(this.componentDestroy())).subscribe(() => {
      this.router.navigate(['/client/order-management']);
    });
  }
  public get generalInformationForm(): Order {
    return {
      ...this.orderDetailsFormComponent.generalInformationForm.getRawValue(),
      title:'',
    };
  }
  private saveAsTemplate(): void {
    const { regionId, locationId, departmentId, skillId } = this.filterco.generalInformationForm.getRawValue();
    const requiredFields = [regionId, locationId, departmentId, skillId];
    const isRequiredFieldsFilled = !some(isNil, requiredFields);

    if (isRequiredFieldsFilled) {
      this.isSaveForTemplate = true;
    } else {
      this.markControlsAsRequired();
      const fields = [FieldName.regionId, FieldName.locationId, FieldName.departmentId, FieldName.skillId];
      const invalidFields = fields.filter((field, i) => !requiredFields[i]).join(',\n');
      this.showOrderFormValidationMessage(invalidFields);
    }
  }

  private showOrderFormValidationMessage(fieldsString?: string): void {
    const fields = fieldsString || this.collectInvalidFields().join(',\n');

    if (fields && fields.length) {
      ToastUtility.show({
        title: 'Error',
        content: 'Please fill in the required fields in Order Details tab:\n' + fields,
        position: { X: 'Center', Y: 'Top' },
        cssClass: 'error-toast',
      });
    }
  }
  private markControlsAsRequired(): void {
    this.getOrderDetailsControl('regionId')?.markAsTouched();
    this.getOrderDetailsControl('skillId')?.markAsTouched();
    if (!this.getOrderDetailsControl('locationId')?.disabled) {
      this.getOrderDetailsControl('locationId')?.markAsTouched();
    }
    if (!this.getOrderDetailsControl('departmentId')?.disabled) {
      this.getOrderDetailsControl('departmentId')?.markAsTouched();
    }
  }
  private getOrderDetailsControl(name: string): AbstractControl {
    return this.filterco.generalInformationForm.get(name) as AbstractControl;
  }

  public closeSaveTemplateDialog(): void {
    this.isSaveForTemplate = false;
  }

  public createTemplate(event: { templateTitle: string }): void {
    const formState = this.irpStateService.getFormState();
    const saveOrderAstemplate = this.irpStateService.getOrderTemplateFormState();
    const formGroupList = getFormsList(formState);
    const saveOrderAsTemplateGrouplist = getSaveasTemplateFormsList(saveOrderAstemplate);
    let saveType: any;
    let createdOrder = {
      ...createOrderDTO(formState, this.orderCredentials),
      contactDetails: getValuesFromList(formState.contactDetailsList),
      workLocations: getValuesFromList(formState.workLocationList as FormGroup[]),
      isSubmit: false,
    };
    createdOrder.distributeToVMS = createdOrder.distributeToVMS !=null ? createdOrder.distributeToVMS.length===0 ? null : createdOrder.distributeToVMS : null;
    let location = this.organizationStructureService.getTemplateLocationsById(createdOrder.regionId,createdOrder.locationId);
    let department = this.organizationStructureService.getTemplateDepartment(createdOrder.locationId,createdOrder.departmentId);
    createdOrder.isTemplate = true;
    createdOrder.templateTitle = event.templateTitle;
    this.store.dispatch(new SaveIrpOrder(createdOrder, this.irpStateService.getDocuments(),"","",true));
    this.closeSaveTemplateDialog();
  }

  private collectOrderData(isSubmit: boolean): CreateOrderDto {
    if (this.selectedOrder.orderType == OrderType.OpenPerDiem || this.selectedOrder.orderType == OrderType.ReOrder) {
    }

    const allValues = {
      ...this.orderDetailsFormComponent.orderTypeForm.getRawValue(),
      ...this.orderDetailsFormComponent.generalInformationForm.getRawValue(),
      ...this.orderDetailsFormComponent.jobDistributionForm.getRawValue(),
      ...this.orderDetailsFormComponent.jobDescriptionForm.getRawValue(),
      ...this.orderDetailsFormComponent.contactDetailsForm.getRawValue(),
      ...this.orderDetailsFormComponent.workLocationForm.getRawValue(),
      ...{ credentials: this.orderCredentials },
    };

    const {
      orderType,
      title,
      regionId,
      locationId,
      departmentId,
      skillId,
      projectTypeId,
      projectNameId,
      poNumberId,
      hourlyRate,
      openPositions,
      minYrsRequired,
      joiningBonus,
      compBonus,
      duration,
      jobStartDate,
      jobEndDate,
      shift,
      shiftStartTime,
      shiftEndTime,
      jobDistributions,
      classifications,
      onCallRequired,
      asapStart,
      criticalOrder,
      jobDescription,
      unitDescription,
      orderRequisitionReasonId,
      orderRequisitionReasonName,
      contactDetails,
      workLocations,
      credentials,
      canApprove,
      annualSalaryRangeFrom,
      annualSalaryRangeTo,
      orderPlacementFee,
      linkedId,
      ExpectedWorkWeek,
    } = allValues;
    const billRates: OrderBillRateDto[] = (allValues.billRates as BillRate[])?.map((billRate: BillRate) => {
      const {
        id,
        billRateConfigId,
        rateHour,
        intervalMin,
        intervalMax,
        effectiveDate,
        billType,
        editAllowed,
        isPredefined,
        seventhDayOtEnabled,
        weeklyOtEnabled,
        dailyOtEnabled,
      } = billRate;
      return {
        id: id || 0,
        billRateConfigId,
        rateHour,
        intervalMin,
        intervalMax,
        effectiveDate,
        billType,
        editAllowed,
        isPredefined,
        seventhDayOtEnabled,
        weeklyOtEnabled,
        dailyOtEnabled,
      };
    });

    const order: CreateOrderDto | EditOrderDto = {
      title,
      regionId,
      locationId,
      departmentId,
      skillId,
      orderType,
      projectTypeId,
      projectNameId,
      poNumberId,
      hourlyRate,
      openPositions,
      minYrsRequired,
      joiningBonus,
      compBonus,
      duration,
      jobStartDate,
      jobEndDate,
      shift,
      shiftStartTime,
      shiftEndTime,
      classifications,
      onCallRequired,
      asapStart,
      criticalOrder,
      jobDescription,
      unitDescription,
      orderRequisitionReasonId,
      orderRequisitionReasonName,
      billRates,
      jobDistributions,
      contactDetails,
      workLocations,
      credentials,
      isSubmit,
      canApprove,
      annualSalaryRangeFrom,
      annualSalaryRangeTo,
      orderPlacementFee,
      isTemplate: false,
      linkedId,
      ExpectedWorkWeek,
    };

    if (this.orderDetailsFormComponent.order?.isTemplate) {
      order.contactDetails = order.contactDetails.map((contact) => ({ ...contact, id: 0 }));
      order.jobDistributions = order.jobDistributions.map((job) => ({ ...job, orderId: 0, id: 0 }));
      order.workLocations = order.workLocations.map((workLocation) => ({ ...workLocation, id: 0 }));
    }

    if (!order.hourlyRate) {
      order.hourlyRate = null;
    }

    if (!order.openPositions) {
      order.openPositions = null;
    }

    if (!order.minYrsRequired) {
      order.minYrsRequired = null;
    }

    if (!order.joiningBonus) {
      order.joiningBonus = null;
    }

    if (!order.compBonus) {
      order.compBonus = null;
    }

    if (order.jobStartDate) {
      order.jobStartDate.setHours(0, 0, 0, 0);
    }

    if (order.jobEndDate) {
      order.jobEndDate.setHours(0, 0, 0, 0);
    }

    return order;
  }

  private collectInvalidFields(): string[] {
    const forms = [
      this.filterco.generalInformationForm.controls,
      this.filterco.jobDistributionForm.controls,
      this.filterco.jobDescriptionForm.controls,
      this.filterco.contactDetailsForm.controls,
      this.filterco.workLocationForm.controls,
    ];

    const requiredFields = forms
      .map((controls) => {
        const invalidaControls = Object.keys(controls).filter((control) => {
          const filedHasRequiredError = !!(controls[control].invalid && controls[control].errors?.['required']);
          return filedHasRequiredError;
        });

        return invalidaControls;
      })
      .flat()
      .map((controlName) => {
        return `\u2022 ${FieldName[controlName as keyof typeof FieldName]}`;
      });

    return requiredFields;
  }
  private watchForSaveEvents(): void {
    this.handleSaveEvents$.pipe(takeUntil(this.componentDestroy())).subscribe((saveType: MenuEventArgs | void) => {
      this.irpStateService.saveEvents.next();
      const formState = this.irpStateService.getFormState();
      const saveOrderAstemplate = this.irpStateService.getOrderTemplateFormState();
      const formGroupList = getFormsList(formState);
      const saveOrderAsTemplateGrouplist = getSaveasTemplateFormsList(saveOrderAstemplate);
      let savetypes: any;
      savetypes = saveType !=null && saveType != undefined ? saveType : null;
      if(savetypes != undefined && savetypes != null)
      {
       this.istemp = SubmitButton.SaveAsTemplate == savetypes.item.id ? true : false;
      }
      if (isFormsValid(formGroupList) && !this.istemp) {
        this.saveOrder(formState, saveType);
      } else if ((savetypes != undefined || savetypes != null) && SubmitButton.SaveAsTemplate == savetypes.item.id) {
        if (this.isSaveForTemplate) {
          
        }
        this.saveAsTemplate();
       } else {
        showInvalidFormControl(getControlsList(formGroupList));
        formGroupList.forEach((form: FormGroup) => {
          form.markAllAsTouched();
        });
      }
    });
  }

  private saveOrder(formState: ListOfKeyForms, saveType: MenuEventArgs | void): void {
    let createdOrder = {
      ...createOrderDTO(formState, this.orderCredentials),
      contactDetails: getValuesFromList(formState.contactDetailsList),
      workLocations: getValuesFromList(formState.workLocationList as FormGroup[]),
      isSubmit: !saveType,
    };
    createdOrder.distributeToVMS = createdOrder.distributeToVMS !=null ? createdOrder.distributeToVMS.length===0 ? null : createdOrder.distributeToVMS : null;
    if (this.selectedOrder) {
      this.canOpenPositionsEdited(createdOrder);
    } else {
      let regionid = createdOrder.regionId;
      let locationid = createdOrder.locationId;
      let jobEndate = createdOrder.jobEndDate ? createdOrder.jobEndDate : null;
      let jobstartdate = createdOrder.jobStartDate ? createdOrder.jobStartDate : createdOrder.jobDates;
      let departmentID = createdOrder.departmentId;
      this.isAddTemplate = this.router.url.includes('fromTemplate');
      if(this.isAddTemplate && createdOrder.jobDates)
      {
      createdOrder.jobDates = [createdOrder.jobDates];
      }
      createdOrder = {
        ...this.saveTemplateDialogService.resetOrderPropertyIds(createdOrder),
      }
      const isDistributionValidation =
      (createdOrder.jobDistribution?.includes(IrpOrderJobDistribution.AllExternal) ||
        createdOrder.jobDistribution?.includes(IrpOrderJobDistribution.SelectedExternal)) &&
      !createdOrder.distributionDelay
        ? true
        : false;
      const location = this.organizationStructureService.getLocation(regionid, locationid);
      const department = this.organizationStructureService.getDepartment(locationid, departmentID);
      const ltaInactiveAndDweactivatelocations =
        location.isInActivate && location.inActiveDate && location.reActiveDate && createdOrder.jobStartDate
          ? this.organizationStructureService.getLocationsByStartandEnddate(
              regionid,
              jobstartdate,
              jobEndate,
              locationid
            )
          : null;
      const ltaInActivelocations =
        location.isInActivate && location.inActiveDate && !location.reActiveDate && createdOrder.jobStartDate
          ? this.organizationStructureService.getLocationsByStartdate(regionid, jobstartdate,jobEndate, locationid)
          : null;


      const ltaInactiveAndReactivatedepartment =
      department.isInActivate && department.inActiveDate && department.reActiveDate && createdOrder.jobStartDate
        ? this.organizationStructureService.getDepartmentByStartandEnddate(
            locationid,
            jobstartdate,
            jobEndate,
            departmentID
          )
        : null;

        const ltaInActiveDeparment =
        department.isInActivate && department.inActiveDate && !department.reActiveDate && createdOrder.jobStartDate
          ? this.organizationStructureService.getDepartmentByStartdate(locationid, jobstartdate,jobEndate, departmentID)
          : null;

        this.ltaInactiveshift = createdOrder.jobStartDate
       ?this.shiftservice.getshiftsbyStartDateAndEndDate(this.orderDetailsFormComponent.allShifts,
            createdOrder.shift,createdOrder.jobStartDate,createdOrder.jobEndDate)
            :null; 
        const perdiemInactiveshift= createdOrder.jobDates?
        this.shiftservice.getInactiveshift(this.orderDetailsFormComponent.allShifts,
          createdOrder.shift)
          :null; 

      let locationreactivateDate = createdOrder.jobDates ? createdOrder.jobDates : null;
      let departmentreactivateDate = createdOrder.jobDates ? createdOrder.jobDates : null;
      let isPerDiem =
        createdOrder.jobDates &&
        (location?.isInActivate ||
          department?.isInActivate
          || perdiemInactiveshift);
       
      if ((ltaInActivelocations!=null && ltaInActivelocations.isInActivate) ||(ltaInactiveAndDweactivatelocations!=null && (ltaInactiveAndDweactivatelocations.isFInActivate || ltaInactiveAndDweactivatelocations.isCInActivate))) 
      {
        let dates = ltaInActivelocations!=null ? this.datePipe.transform(ltaInActivelocations.inActiveDate,"MM/dd/yyyy"):this.datePipe.transform(ltaInactiveAndDweactivatelocations?.inActiveDate,"MM/dd/yyyy");
        let validationmessage=this.GenerateLocationDepartmentShiftValidationMessage(true,false,dates,'');
        this.confirmService
          .confirm(validationmessage, {
            title: 'Confirm',
            okButtonLabel: 'Yes',
            okButtonClass: '',
          })
          .pipe(filter(Boolean), takeUntil(this.componentDestroy()))
          .subscribe(() => {
            if(isDistributionValidation)
            {
              this.confirmService
              .confirm(DISTRIBUTETOVMS, {
                title: 'Confirm',
                okButtonLabel: 'Yes',
                okButtonClass: '',
              })
              .pipe(filter(Boolean), takeUntil(this.componentDestroy()))
              .subscribe(() => {
                this.store.dispatch(new SaveIrpOrder(createdOrder, this.irpStateService.getDocuments(), this.dates));
              });
            }
            else{
            this.store.dispatch(new SaveIrpOrder(createdOrder, this.irpStateService.getDocuments(), this.dates));
            }
          });
      } 
      else if((ltaInActiveDeparment!=null && ltaInActiveDeparment.isInActivate) ||(ltaInactiveAndReactivatedepartment!=null && (ltaInactiveAndReactivatedepartment.isFInActivate || ltaInactiveAndReactivatedepartment.isCInActivate)))
      {
        let dates = ltaInActiveDeparment!=null ? this.datePipe.transform(ltaInActiveDeparment.inActiveDate,"MM/dd/yyyy"):this.datePipe.transform(ltaInactiveAndReactivatedepartment?.inActiveDate,"MM/dd/yyyy");
        let validationmessage=this.GenerateLocationDepartmentShiftValidationMessage(false,true,'',dates);
        this.confirmService
          .confirm(validationmessage, {
            title: 'Confirm',
            okButtonLabel: 'Yes',
            okButtonClass: '',
          })
          .pipe(filter(Boolean), takeUntil(this.componentDestroy()))
          .subscribe(() => {
            if(isDistributionValidation)
            {
              this.confirmService
              .confirm(DISTRIBUTETOVMS, {
                title: 'Confirm',
                okButtonLabel: 'Yes',
                okButtonClass: '',
              })
              .pipe(filter(Boolean), takeUntil(this.componentDestroy()))
              .subscribe(() => {
            this.store.dispatch(new SaveIrpOrder(createdOrder, this.irpStateService.getDocuments(), this.dates));
              });
            }
            else{
              this.store.dispatch(new SaveIrpOrder(createdOrder, this.irpStateService.getDocuments(), this.dates));
            }
          });
      }
      else if(this.ltaInactiveshift!=null)
      {
        let validationmessage=this.GenerateLocationDepartmentShiftValidationMessage(false,false,'','');
        this.confirmService
          .confirm(validationmessage, {
            title: 'Confirm',
            okButtonLabel: 'Yes',
            okButtonClass: '',
          })
          .pipe(filter(Boolean), takeUntil(this.componentDestroy()))
          .subscribe(() => {
            if(isDistributionValidation)
            {
              this.confirmService
              .confirm(DISTRIBUTETOVMS, {
                title: 'Confirm',
                okButtonLabel: 'Yes',
                okButtonClass: '',
              })
              .pipe(filter(Boolean), takeUntil(this.componentDestroy()))
              .subscribe(() => {
            this.store.dispatch(new SaveIrpOrder(createdOrder, this.irpStateService.getDocuments(), this.dates))
              });    
          }
          else
          {
            this.store.dispatch(new SaveIrpOrder(createdOrder, this.irpStateService.getDocuments(), this.dates)) 
          }
          });
      }
      else if (isPerDiem && (location.isInActivate || department.inActiveDate || perdiemInactiveshift)) {
        if (location.isInActivate && location.reActiveDate) {
          createdOrder.jobDates = createdOrder.jobDates.filter(
            (f: Date) =>
              new Date(f) < new Date(location.inActiveDate ?? '') || new Date(f) >= new Date(location.reActiveDate ?? '')
          );
          
          locationreactivateDate = locationreactivateDate.filter((f: Date) => 
             new Date(f) >=  new Date(location.inActiveDate ?? '') &&
               new Date(f) < new Date(location.reActiveDate ?? ''));
          this.locationdates = locationreactivateDate
            .map((m: string | number | Date) => this.datePipe.transform(m, 'MM/dd/yyyy'))
            .join(',');
        } else if (location.isInActivate && !location.reActiveDate){
          createdOrder.jobDates = createdOrder.jobDates.filter(
            (f: Date) => new Date(f) < new Date(location.inActiveDate ?? '')
          );
          locationreactivateDate = locationreactivateDate.filter((f: Date) => 
             new Date(f) >= new Date(location.inActiveDate ?? ''));
          
          this.locationdates = locationreactivateDate
            .map((m: string | number | Date) => this.datePipe.transform(m, 'MM/dd/yyyy'))
            .join(',');
        }
        if (department.isInActivate && department.reActiveDate) {
          createdOrder.jobDates = createdOrder.jobDates.filter(
            (f: Date) =>
              new Date(f) < new Date(department.inActiveDate ?? '') || new Date(f) >= new Date(department.reActiveDate ?? '')
          );
          
          departmentreactivateDate = 
          locationreactivateDate ? 
          departmentreactivateDate.filter((f: Date) => 
             new Date(f) >=  new Date(department.inActiveDate ?? '') &&
               new Date(f) < new Date(department.reActiveDate ?? ''))
               :
          departmentreactivateDate.filter((f: Date) => 
             new Date(f) >=  new Date(department.inActiveDate ?? '') &&
               new Date(f) < new Date(department.reActiveDate ?? ''));
          this.departmentdates = departmentreactivateDate
            .map((m: string | number | Date) => this.datePipe.transform(m, 'MM/dd/yyyy'))
            .join(',');
        } else if(department.isInActivate && !department.reActiveDate){
          createdOrder.jobDates = createdOrder.jobDates.filter(
            (f: Date) => new Date(f) < new Date(department.inActiveDate ?? '')
          );
          departmentreactivateDate =
          locationreactivateDate ?
          departmentreactivateDate.filter((f: Date) => 
             new Date(f) >= new Date(department.inActiveDate ?? ''))
             : 
          departmentreactivateDate.filter((f: Date) => 
             new Date(f) >= new Date(department.inActiveDate ?? ''));
          
          this.departmentdates = departmentreactivateDate
            .map((m: string | number | Date) => this.datePipe.transform(m, 'MM/dd/yyyy'))
            .join(',');
        }
        if(perdiemInactiveshift!=null){
         
          let shiftinactivedates=createdOrder.jobDates.filter(
            (f: Date) =>
            new Date(f) >= new Date(perdiemInactiveshift.inactiveDate))
          createdOrder.jobDates = createdOrder.jobDates.filter(
            (f: Date) =>
              new Date(f) < new Date(perdiemInactiveshift.inactiveDate ?? ''));
            if(shiftinactivedates && shiftinactivedates.length>0){
            this.shiftdates = this.datePipe.transform(perdiemInactiveshift.inactiveDate, 'MM/dd/yyyy') ?? '';
          }
        }
        let expirymessage:string='';
         if(this.locationdates){
          this.dates=this.locationdates.trim();
          expirymessage='Location'
         }
         if(this.departmentdates){
          this.dates=this.dates ? this.dates + ',' + this.departmentdates.trim() : this.departmentdates;
          expirymessage=expirymessage!='' ? 'Location and Department' : 'Department'
         }
         if(this.shiftdates){
          this.dates=this.dates ? this.dates + ',' + this.shiftdates.trim() : this.shiftdates;
          expirymessage=expirymessage!='' ? expirymessage + ' and Shift': 'Shift';
         }
         if(this.dates && this.dates.indexOf(',')!=-1){
          let cancatDates= this.dates.split(",");
          cancatDates=[...new Set(cancatDates)];
          let caoncatDates= cancatDates.map((m: string|number|Date) => m.toString()).join(', ')
          this.dates= caoncatDates.toString();
         }
         if (isDistributionValidation) {
           this.confirmService
             .confirm(DISTRIBUTETOVMS, {
               title: 'Confirm',
               okButtonLabel: 'Yes',
               okButtonClass: '',
             })
             .pipe(filter(Boolean), takeUntil(this.componentDestroy()))
             .subscribe(() => {
               this.store.dispatch(
                 new SaveIrpOrder(createdOrder, this.irpStateService.getDocuments(), this.dates, expirymessage)
               );
             });
         }
         else{
          this.store.dispatch(
            new SaveIrpOrder(createdOrder, this.irpStateService.getDocuments(), this.dates, expirymessage));
         }
      }
      else {
        if(isDistributionValidation)
        {
          this.confirmService
          .confirm(DISTRIBUTETOVMS, {
            title: 'Confirm',
            okButtonLabel: 'Yes',
            okButtonClass: '',
          })
          .pipe(filter(Boolean), takeUntil(this.componentDestroy()))
          .subscribe(() => {
        this.store.dispatch(new SaveIrpOrder(createdOrder, this.irpStateService.getDocuments()));
          });
        }
        else{
          this.store.dispatch(new SaveIrpOrder(createdOrder, this.irpStateService.getDocuments()));
        }
      }
    }
  }
  private GenerateLocationDepartmentShiftValidationMessage(
    isLocationInActive: boolean, isDepartmentInActive: boolean,
    locationDate: string | null, departmentDate: string | null): string {
    let message: string = '';
    let shiftdate = this.datePipe.transform(this.ltaInactiveshift?.inactiveDate, "MM/dd/yyyy") ?? '';
    if (isLocationInActive) {
      if (shiftdate) {
        let isLocationAndShiftSame: boolean = locationDate === shiftdate;
        if (isLocationAndShiftSame) {
          message = `Location and Shift will be inactivated at ${locationDate}. Are you sure you want to proceed?`;
        }
        else {
          message = `Location will be inactivated at ${locationDate} and Shift will be inactivated at ${shiftdate}. Are you sure you want to proceed?`;
        }
      }
      else {
        message = `Location will be inactivated at ${locationDate}. Are you sure you want to proceed?`;
      }
    }
    else if (isDepartmentInActive) {
      if (shiftdate) {
        let isDepartmentAndShiftSame: boolean = departmentDate === shiftdate;
        if (isDepartmentAndShiftSame) {
          message = `Department and Shift will be inactivated at ${departmentDate}. Are you sure you want to proceed?`;
        }
        else {
          message = `Department will be inactivated at ${departmentDate} and Shift will be inactivated at ${shiftdate}. Are you sure you want to proceed?`;
        }
      }
      else {
        message = `Department will be inactivated at ${departmentDate}. Are you sure you want to proceed?`;
      }

    }
    else if (shiftdate) {
      message = `Shift will be inactivated at ${shiftdate}. Are you sure you want to proceed?`;
    }
    return message;
  }
  



private canOpenPositionsEdited(order: CreateOrderDto){
  const fixedJobStatusesIncluded: number[] = [OrderStatus.Open, OrderStatus.InProgress, OrderStatus.Filled];
  const isDistributiondelay = order.distributionDelay;
  const isDistributiondelayEdited =
    this.orderDetailsFormComponent.jobDistributionForm.get('distributionDelay')?.dirty &&
    this.orderDetailsFormComponent.jobDistributionForm.get('distributionDelay')?.touched
      ? true
      : false;
  if (
    (this.orderDetailsFormComponent.orderTypeForm.get('orderType')?.value === IrpOrderType.LongTermAssignment ||
      this.orderDetailsFormComponent.orderTypeForm.get('orderType')?.value === IrpOrderType.PerDiem) &&
    fixedJobStatusesIncluded.includes(this.selectedOrder.irpOrderMetadata?.status!)
  ) {
    if (order.openPositions != this.selectedOrder.openPositions) {
      this.getSettings(order);
      if (this.IsSettingsEnabledByOrganisation || this.IsSettingEnabledByRegLocDept) {
        this.store.dispatch(new ShowToast(MessageTypes.Error, ERROR_CAN_NOT_Edit_OpenPositions));
        return;
      }
    }
  }
  if (!isDistributiondelay && isDistributiondelayEdited) {
    this.confirmService
      .confirm(DISTRIBUTETOVMS, {
        title: 'Confirm',
        okButtonLabel: 'Yes',
        okButtonClass: '',
      })
      .pipe(filter(Boolean), takeUntil(this.componentDestroy()))
      .subscribe(() => {
        this.showRevokeMessageForEditOrder(order);
      });
  } else {
    this.showRevokeMessageForEditOrder(order);
  }
}
private getSettings(order:CreateOrderDto) {
  this.store.dispatch(new GetOrganizationSettings());
  this.organizationSettings$.pipe(filter((settings: Configuration[]) => !!settings.length), takeUntil(this.componentDestroy())).subscribe((settings: Configuration[]) => {
    
    this.settings = SettingsHelper.mapSettings(settings);
   
    this. IsSettingsEnabledByOrganisation=this.settings[SettingsKeys.DisableNumberOfOpenPositions]?.children?.find(f => f.isIRPConfigurationValue == true
      && f.departmentId === null && f.regionId === null && f.locationId === null)?.value === 'true' ;
   
    this.IsSettingEnabledByRegLocDept = this.settings[SettingsKeys.DisableNumberOfOpenPositions]?.children?.find(f => f.isIRPConfigurationValue == true
    && f.departmentId === order.departmentId && f.regionId === order.regionId && f.locationId === order.locationId)?.value === 'true';
  
   
  });
}


  private showRevokeMessageForEditOrder(order: CreateOrderDto): void {
    const isExternalLogicInclude = this.irpStateService.getIncludedExternalLogic(order);
    if (!isExternalLogicInclude && !this.selectedOrder.canRevoke) {
      this.store.dispatch(new ShowToast(MessageTypes.Error, ERROR_CAN_NOT_REVOKED));
    } else if (!isExternalLogicInclude && !this.selectedOrder.canProceedRevoke) {
      this.confirmService
        .confirm(CONFIRM_REVOKE_ORDER, {
          title: 'Confirm',
          okButtonLabel: 'Revoke',
          okButtonClass: '',
        })
        .pipe(
          filter(Boolean),
          switchMap(() => {
            return this.irpContainerApiService.checkLinkedSchedules(this.selectedOrder.id);
          }),
          switchMap(({ doesOrderHaveLinkedSchedules }) => {
            return this.checkIsLtaOrderHasSchedules(doesOrderHaveLinkedSchedules);
          }),
          take(1)
        )
        .subscribe((value: boolean | null) => {
          this.saveEditOrderWithLinkedSchedules(value, order);
        });
    } else {
      this.saveEditOrderWithoutRevoke(order);
    }
  }

  private saveEditOrderWithoutRevoke(order: CreateOrderDto): void {
    if (this.selectedOrder.orderType === OrderType.LongTermAssignment) {
      this.irpContainerApiService
        .checkLinkedSchedules(this.selectedOrder.id)
        .pipe(
          switchMap(({ doesOrderHaveLinkedSchedules }) => {
            return this.checkIsLtaOrderHasSchedules(doesOrderHaveLinkedSchedules);
          }),
          take(1)
        )
        .subscribe((value: boolean | null) => {
          this.saveEditOrderWithLinkedSchedules(value, order);
        });
    } else {
      this.saveEditedOrder(order);
    }
  }

  private saveEditedOrder(order: CreateOrderDto): void {
    this.store.dispatch(
      new EditIrpOrder(
        {
          ...order,
          id: this.selectedOrder.id,
          deleteDocumentsGuids: this.irpStateService.getDeletedDocuments(),
        },
        this.irpStateService.getDocuments(),
        this.irpStateService.getFormState().internalDistributionChanged,
      )
    );
  }

  private watchForPredefinedCredentials(): void {
    this.predefinedCredentials$
      .pipe(takeUntil(this.componentDestroy()))
      .subscribe((predefinedCredentials: IOrderCredentialItem[]) => {
        this.orderCredentials = predefinedCredentials;
        this.cdr.markForCheck();
      });
  }

  private saveEditOrderWithLinkedSchedules(value: boolean | null, order: CreateOrderDto): void {
    if (value !== null) {
      order.removeLinkedSchedulesFromLta = value;
    }

    this.saveEditedOrder(order);
  }

  private checkIsLtaOrderHasSchedules(doesOrderHaveLinkedSchedules: boolean): Observable<boolean | null> {
    if (doesOrderHaveLinkedSchedules) {
      return this.irpStateService.showScheduleBookingModal();
    }

    return of(null);
  }
}
