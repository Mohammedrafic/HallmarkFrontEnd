import { ChangeDetectorRef, Component, Input, OnChanges, OnDestroy, SimpleChanges, ViewChild } from '@angular/core';

import { Store } from '@ngxs/store';
import { Subject, takeUntil, throttleTime } from 'rxjs';

import { SetIsDirtyOrderForm } from '@client/store/order-managment-content.actions';
import { OrderManagementIRPSystemId } from '@shared/enums/order-management-tabs.enum';
import { OrderType } from '@shared/enums/order-type';
import { OrderHistoricalEvent } from '@shared/models';
import { Comment } from '@shared/models/comment.model';
import { Order, OrderContactDetails, OrderWorkLocation } from '@shared/models/order-management.model';
import { CommentsService } from '@shared/services/comments.service';
import { HistoricalEventsService } from '@shared/services/historical-events.service';
import { AccordionComponent, ExpandedEventArgs } from '@syncfusion/ej2-angular-navigations';
import { AppState } from '../../../store/app.state';
import { UserState } from '../../../store/user.state';
import { OrganizationalHierarchy, OrganizationSettingKeys } from '../../constants/organization-settings';
import { BusinessUnitType } from '../../enums/business-unit-type';
import { SettingsViewService } from '../../services/settings-view.service';
import { PermissionService } from 'src/app/security/services/permission.service';

type ContactDetails = Partial<OrderContactDetails> & Partial<OrderWorkLocation>;
@Component({
  selector: 'app-order-details',
  templateUrl: './order-details.component.html',
  styleUrls: ['./order-details.component.scss'],
})
export class OrderDetailsComponent implements OnChanges, OnDestroy {
  @ViewChild('accrdDescription') private readonly accrdDescription: AccordionComponent;
  @ViewChild('accrdHistorical') private readonly accrdHistorical: AccordionComponent;

  @Input() isPosition = false;
  @Input() jobId: number;
  @Input() activeSystem: OrderManagementIRPSystemId;
  @Input() comments: Comment[] = [];
  @Input() CanOrganizationEditOrdersIRP : boolean;
  @Input() CanOrganizationViewOrdersIRP: boolean;
  @Input() set currentOrder(value: Order) {
    this.order = { ...value,
      documents: (value.documents || []).map((file) => ({...file, size: 89, createdAt: '08/08/2023'})),
      //TODO remove after BE implementation
    };
    this.getContactDetails();
  }

  public order: Order;
  public orderType = OrderType;
  public contactDetails: ContactDetails;
  public events: OrderHistoricalEvent[];
  public isHideContactDetailsOfOrderInAgencyLogin: boolean;
  public readonly systemTypes = OrderManagementIRPSystemId;
  public canCreateOrder: boolean;
  private unsubscribe$: Subject<void> = new Subject();
  private eventsHandler: Subject<void> = new Subject();

    constructor(
    private store: Store,
    private commentsService: CommentsService,
    private cdr: ChangeDetectorRef,
    private historicalEventsService: HistoricalEventsService,
    private settingsViewService: SettingsViewService,
    private permissionService : PermissionService
  ) {
    this.eventsHandler.pipe(takeUntil(this.unsubscribe$), throttleTime(500))
      .subscribe(() => {
        this.getHistoricalEvents();
      });
    this.subscribeOnPermissions();
  }

  private subscribeForSettings(): void {
    const user = this.store.selectSnapshot(UserState.user);
    if (user?.businessUnitType === BusinessUnitType.Agency) {
      const organizationId = this.order?.organizationId;
      if (organizationId) {
        this.settingsViewService.getViewSettingKey(
          OrganizationSettingKeys.HideContactDetailsOfOrderInAgencyLogin,
          OrganizationalHierarchy.Organization,
          organizationId,
          organizationId
        ).pipe(
          takeUntil(this.unsubscribe$)
        ).subscribe(({ HideContactDetailsOfOrderInAgencyLogin }) => {
          this.isHideContactDetailsOfOrderInAgencyLogin = HideContactDetailsOfOrderInAgencyLogin === "true";
          this.cdr.markForCheck();
        })
      }

    } else {
      this.isHideContactDetailsOfOrderInAgencyLogin = false;
      this.cdr.markForCheck();
    }
  }

  public ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  public ngOnChanges(changes: SimpleChanges): void {
    const { currentOrder } = changes;

    if (currentOrder?.currentValue) {
      this.accrdDescription?.expandItem(true, 1);
      this.accrdHistorical?.expandItem(false);
      this.subscribeForSettings();
    }
  }

  public onExpanded(event: ExpandedEventArgs): void {
    if (event.isExpanded) {
      this.eventsHandler.next();
    }
  }

  private subscribeOnPermissions(): void {
    this.permissionService.getPermissions().subscribe(({ canCreateOrder}) => {
      this.canCreateOrder = canCreateOrder;
    });
  }

  private getHistoricalEvents(): void {
    const { isAgencyArea } = this.store.selectSnapshot(AppState.isOrganizationAgencyArea);
    const organizationId = isAgencyArea ? this.order.organizationId : null;
    this.historicalEventsService.getEvents(this.order.id, organizationId, this.jobId).pipe(
      takeUntil(this.unsubscribe$)
    ).subscribe(data => {
      this.events = data;
      this.cdr.markForCheck();
    });
  }

  public onBillRatesChanged(): void {
    this.store.dispatch(new SetIsDirtyOrderForm(true));
  }

  private getContactDetails(): void {
    if (!this.order) {
      return;
    }
    const { contactDetails, workLocations, reOrderFrom } = this.order || {};
    const contact = contactDetails?.length
      ? contactDetails.find((contact) => contact.isPrimaryContact) || contactDetails[0]
      : reOrderFrom?.contactDetails[0];
    const location = workLocations?.length ? workLocations : reOrderFrom?.workLocations!;
    this.contactDetails = {
      name: contact?.name,
      email: contact?.email,
      address: location?.[0]?.address,
      city: location?.[0]?.city,
      state: location?.[0]?.state,
      zipCode: location?.[0]?.zipCode,
    };
  }
}
