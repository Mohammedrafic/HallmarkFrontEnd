import { Component, Input, OnDestroy } from '@angular/core';
import { Order, OrderContactDetails, OrderWorkLocation } from '@shared/models/order-management.model';
import { Subject } from 'rxjs';
import { OrderType } from '@shared/enums/order-type';

type ContactDetails = Partial<OrderContactDetails> & Partial<OrderWorkLocation>;
@Component({
  selector: 'app-order-details',
  templateUrl: './order-details.component.html',
  styleUrls: ['./order-details.component.scss'],
})
export class OrderDetailsComponent implements OnDestroy {
  @Input() set currentOrder(value: Order) {
    this.order = value;
    this.getContactDetails();
  }

  public order: Order;
  public orderType = OrderType;
  public contactDetails: ContactDetails;

  private unsubscribe$: Subject<void> = new Subject();

  public ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  private getContactDetails(): void {
    if (!this.order) {
      return;
    }
    const { contactDetails, workLocations, reOrderFrom } = this.order || {};
    const contact = contactDetails?.length ? contactDetails.filter((contact) => contact.isPrimaryContact) : reOrderFrom?.contactDetails!;
    const location = workLocations?.length ? workLocations : reOrderFrom?.workLocations!;
    this.contactDetails = {
      name: contact?.[0]?.name,
      email: contact?.[0]?.email,
      address: location?.[0]?.address,
      city: location?.[0]?.city,
      state: location?.[0]?.state,
      zipCode: location?.[0]?.zipCode,
    };
  }
}
