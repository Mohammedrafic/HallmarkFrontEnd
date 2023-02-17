import { ChangeDetectorRef, Component, Input, OnChanges, OnDestroy, SimpleChanges, ViewChild } from '@angular/core';
import { Order, OrderContactDetails, OrderWorkLocation } from '@shared/models/order-management.model';
import { filter, Observable, Subject, switchMap, takeUntil, takeWhile, throttleTime } from 'rxjs';
import { OrderType } from '@shared/enums/order-type';
import { Select, Store } from '@ngxs/store';
import { CommentsService } from '@shared/services/comments.service';
import { Comment } from '@shared/models/comment.model';
import { SetIsDirtyOrderForm } from '@client/store/order-managment-content.actions';
import { HistoricalEventsService } from '@shared/services/historical-events.service';
import { OrderHistoricalEvent } from '@shared/models';
import { AppState } from '../../../store/app.state';
import { AccordionComponent, ExpandedEventArgs } from '@syncfusion/ej2-angular-navigations';
import { OrganizationManagementState } from '../../../organization-management/store/organization-management.state';
import { OrganizationSettingsGet } from '../../models/organization-settings.model';
import { SettingsKeys } from '../../enums/settings';
import { SettingsHelper } from '../../../core/helpers/settings.helper';
import { UserState } from '../../../store/user.state';
import { BusinessUnitType } from '../../enums/business-unit-type';
import { OrganizationalHierarchy, OrganizationSettingKeys } from '../../constants/organization-settings';
import { SettingsViewService } from '../../services/settings-view.service';

type ContactDetails = Partial<OrderContactDetails> & Partial<OrderWorkLocation>;
@Component({
  selector: 'app-order-details',
  templateUrl: './order-details.component.html',
  styleUrls: ['./order-details.component.scss'],
})
export class OrderDetailsComponent implements OnChanges, OnDestroy {
  @ViewChild('accrdDescription') private readonly accrdDescription: AccordionComponent;
  @ViewChild('accrdHistorical') private readonly accrdHistorical: AccordionComponent;

  @Input() isPosition: boolean = false;
  @Input() jobId: number;
  @Input() set currentOrder(value: Order) {
    this.order = value;
    this.getContactDetails();
  }

  public order: Order;
  public orderType = OrderType;
  public contactDetails: ContactDetails;
  public comments: Comment[] = [];
  public events: OrderHistoricalEvent[];
  public isHideContactDetailsOfOrderInAgencyLogin: boolean;

  private unsubscribe$: Subject<void> = new Subject();
  private eventsHandler: Subject<void> = new Subject();
  
    constructor(
    private store: Store,
    private commentsService: CommentsService,
    private cdr: ChangeDetectorRef,
    private historicalEventsService: HistoricalEventsService,
    private settingsViewService: SettingsViewService
  ) {
    this.eventsHandler.pipe(takeUntil(this.unsubscribe$), throttleTime(500))
      .subscribe(() => {
        this.getHistoricalEvents();
      });

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
        })
      }
    
    } else {
      this.isHideContactDetailsOfOrderInAgencyLogin = false;
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
      this.getComments();
      this.subscribeForSettings();
    }
  }

  public onExpanded(event: ExpandedEventArgs): void {
    if (event.isExpanded) {
      this.eventsHandler.next();
    }
  }

  private getHistoricalEvents(): void {
    const { isAgencyArea } = this.store.selectSnapshot(AppState.isOrganizationAgencyArea);
    const organizationId = isAgencyArea ? this.order.organizationId : null;
    this.historicalEventsService.getEvents(this.order.id, organizationId, this.jobId).subscribe(data => {
      this.events = data;
      this.cdr.markForCheck();
    });
  }

  private getComments(): void {
    this.commentsService
      .getComments(this.order.commentContainerId as number, null)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((comments: Comment[]) => {
        this.comments = comments;
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
