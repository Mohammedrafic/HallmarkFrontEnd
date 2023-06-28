import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  TrackByFunction,
} from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup } from '@angular/forms';

import { filter, Observable, of, Subject, switchMap, take, takeUntil } from 'rxjs';
import { MenuEventArgs } from '@syncfusion/ej2-angular-splitbuttons';
import { Actions, ofActionDispatched, Select, Store } from '@ngxs/store';

import { OrderCandidatesCredentialsState } from '@order-credentials/store/credentials.state';
import { IrpTabConfig } from '@client/order-management/containers/irp-container/irp-container.constant';
import { IrpTabs } from '@client/order-management/enums';
import { ListOfKeyForms, SelectSystem, TabsConfig } from '@client/order-management/interfaces';
import { Destroyable } from '@core/helpers';
import { OrderCredentialsService } from '@client/order-management/services';
import { IrpContainerStateService } from '@client/order-management/containers/irp-container/services/irp-container-state.service';
import {
  createOrderDTO,
  getControlsList,
  getFormsList,
  getValuesFromList,
  isFormsValid,
  isFormTouched,
  showInvalidFormControl,
} from '@client/order-management/helpers';
import { SaveIrpOrder, EditIrpOrder, SaveIrpOrderSucceeded } from '@client/store/order-managment-content.actions';
import { CreateOrderDto, Order } from '@shared/models/order-management.model';
import { IOrderCredentialItem } from '@order-credentials/types';
import { ShowToast } from '../../../../store/app.actions';
import { MessageTypes } from '@shared/enums/message-types';
import {
  CONFIRM_REVOKE_ORDER,
  ERROR_CAN_NOT_REVOKED,
  INACTIVE_MESSAGE,
  INACTIVEDATE,
  INACTIVEDATE_DEPARTMENT,
} from '@shared/constants';
import { ConfirmService } from '@shared/services/confirm.service';
import { OrderType } from '@shared/enums/order-type';
import { IrpContainerApiService } from '@client/order-management/containers/irp-container/services';
import { DatePipe } from '@angular/common';
import { OrganizationStructureService } from '@shared/services/organization-structure.service';

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

  @Select(OrderCandidatesCredentialsState.predefinedCredentials)
  predefinedCredentials$: Observable<IOrderCredentialItem[]>;

  public tabsConfig: TabsConfig[] = IrpTabConfig;
  public tabs = IrpTabs;
  public orderCredentials: IOrderCredentialItem[] = [];
  public dates: string;
  public locationdates: string;
  public departmentdates: string;
  public isLocation : boolean=false;
  public isLocationAndDepartment : boolean=false;
  private isCredentialsChanged = false;


  constructor(
    private orderCredentialsService: OrderCredentialsService,
    private irpStateService: IrpContainerStateService,
    private store: Store,
    private actions$: Actions,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private confirmService: ConfirmService,
    private irpContainerApiService: IrpContainerApiService,
    private organizationStructureService: OrganizationStructureService,
    private datePipe: DatePipe
  ) {
    super();
  }

  ngOnInit(): void {
    this.watchForSaveEvents();
    this.watchForSucceededSaveOrder();
    this.watchForPredefinedCredentials();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['selectedOrder']?.currentValue) {
      this.orderCredentials = [...(this.selectedOrder.credentials ?? [])];
    }
  }

  public trackByFn: TrackByFunction<TabsConfig> = (_: number, tab: TabsConfig) => tab.id;

  public updateOrderCredentials(credential: IOrderCredentialItem): void {
    this.isCredentialsChanged = true;
    this.orderCredentialsService.updateOrderCredentials(this.orderCredentials, credential);
  }

  public deleteOrderCredential(credential: IOrderCredentialItem): void {
    this.isCredentialsChanged = true;
    this.orderCredentialsService.deleteOrderCredential(this.orderCredentials, credential);
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

  private watchForSaveEvents(): void {
    this.handleSaveEvents$.pipe(takeUntil(this.componentDestroy())).subscribe((saveType: MenuEventArgs | void) => {
      this.irpStateService.saveEvents.next();
      const formState = this.irpStateService.getFormState();
      const formGroupList = getFormsList(formState);

      if (isFormsValid(formGroupList)) {
        this.saveOrder(formState, saveType);
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

    if (this.selectedOrder) {
      this.showRevokeMessageForEditOrder(createdOrder);
    } else {
      let regionid = createdOrder.regionId;
      let locationid = createdOrder.locationId;
      let jobEndate = createdOrder.jobEndDate ? createdOrder.jobEndDate : null;
      let jobstartdate = createdOrder.jobStartDate ? createdOrder.jobStartDate : createdOrder.jobDates;
      let departmentID = createdOrder.departmentId;

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

      let locationreactivateDate = createdOrder.jobDates ? createdOrder.jobDates : null;
      let departmentreactivateDate = createdOrder.jobDates ? createdOrder.jobDates : null;
      let isPerDiem =
        createdOrder.jobDates &&
        (location?.isInActivate ||
          department?.isInActivate);
      if ((ltaInActivelocations!=null && ltaInActivelocations.isInActivate) ||(ltaInactiveAndDweactivatelocations!=null && (ltaInactiveAndDweactivatelocations.isFInActivate || ltaInactiveAndDweactivatelocations.isCInActivate))) 
      {
       
        let dates = ltaInActivelocations!=null ? this.datePipe.transform(ltaInActivelocations.inActiveDate,"MM/dd/yyyy"):this.datePipe.transform(ltaInactiveAndDweactivatelocations?.inActiveDate,"MM/dd/yyyy");
        this.confirmService
          .confirm(INACTIVEDATE + dates + INACTIVE_MESSAGE, {
            title: 'Confirm',
            okButtonLabel: 'Yes',
            okButtonClass: '',
          })
          .pipe(filter(Boolean), takeUntil(this.componentDestroy()))
          .subscribe(() => {
            this.store.dispatch(new SaveIrpOrder(createdOrder, this.irpStateService.getDocuments(), this.dates));
          });
      } 
      else if((ltaInActiveDeparment!=null && ltaInActiveDeparment.isInActivate) ||(ltaInactiveAndReactivatedepartment!=null && (ltaInactiveAndReactivatedepartment.isFInActivate || ltaInactiveAndReactivatedepartment.isCInActivate)))
      {
        let dates = ltaInActiveDeparment!=null ? this.datePipe.transform(ltaInActiveDeparment.inActiveDate,"MM/dd/yyyy"):this.datePipe.transform(ltaInactiveAndReactivatedepartment?.inActiveDate,"MM/dd/yyyy");
        this.confirmService
          .confirm(INACTIVEDATE_DEPARTMENT + dates + INACTIVE_MESSAGE, {
            title: 'Confirm',
            okButtonLabel: 'Yes',
            okButtonClass: '',
          })
          .pipe(filter(Boolean), takeUntil(this.componentDestroy()))
          .subscribe(() => {
            this.store.dispatch(new SaveIrpOrder(createdOrder, this.irpStateService.getDocuments(), this.dates));
          });
      }
      else if (isPerDiem && (location.isInActivate || department.inActiveDate)) {
        if (location.isInActivate && location.reActiveDate) {
          createdOrder.jobDates = createdOrder.jobDates.filter(
            (f: Date) =>
              new Date(f) < new Date(location.inActiveDate ?? '') || new Date(f) >= new Date(location.reActiveDate ?? '')
          );
          
          locationreactivateDate = locationreactivateDate.filter((f: Date) => 
             new Date(f) >=  new Date(location.inActiveDate ?? '') &&
               new Date(f) < new Date(location.reActiveDate ?? ''));
          this.dates = locationreactivateDate
            .map((m: string | number | Date) => this.datePipe.transform(m, 'MM/dd/yyyy'))
            .join(', ');
        } else {
          createdOrder.jobDates = createdOrder.jobDates.filter(
            (f: Date) => new Date(f) < new Date(location.inActiveDate ?? '')
          );
          locationreactivateDate = locationreactivateDate.filter((f: Date) => 
             new Date(f) >= new Date(location.inActiveDate ?? ''));
          
          this.locationdates = locationreactivateDate
            .map((m: string | number | Date) => this.datePipe.transform(m, 'MM/dd/yyyy'))
            .join(', ');
        }
        if (department.isInActivate && department.reActiveDate) {
          createdOrder.jobDates = createdOrder.jobDates.filter(
            (f: Date) =>
              new Date(f) < new Date(department.inActiveDate ?? '') || new Date(f) >= new Date(department.reActiveDate ?? '')
          );
          
          departmentreactivateDate = departmentreactivateDate.filter((f: Date) => 
             new Date(f) >=  new Date(department.inActiveDate ?? '') &&
               new Date(f) < new Date(department.reActiveDate ?? ''));
          this.dates = departmentreactivateDate
            .map((m: string | number | Date) => this.datePipe.transform(m, 'MM/dd/yyyy'))
            .join(', ');
        } else {
          createdOrder.jobDates = createdOrder.jobDates.filter(
            (f: Date) => new Date(f) < new Date(department.inActiveDate ?? '')
          );
          departmentreactivateDate = departmentreactivateDate.filter((f: Date) => 
             new Date(f) >= new Date(department.inActiveDate ?? ''));
          
          this.departmentdates = departmentreactivateDate
            .map((m: string | number | Date) => this.datePipe.transform(m, 'MM/dd/yyyy'))
            .join(', ');
        }
        this.isLocationAndDepartment = this.locationdates && this.departmentdates ? true : false
        this.isLocation = this.locationdates ? true : false
        this.dates= this.locationdates +' '+ this.departmentdates;
        this.store.dispatch(new SaveIrpOrder(createdOrder, this.irpStateService.getDocuments(), this.dates,this.isLocation,this.isLocationAndDepartment));
      }
      else {
        this.store.dispatch(new SaveIrpOrder(createdOrder, this.irpStateService.getDocuments()));
      }
    }
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
    if (this.selectedOrder.orderType === OrderType.Traveler) {
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
        this.irpStateService.getDocuments()
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
