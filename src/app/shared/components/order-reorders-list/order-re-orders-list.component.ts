import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { AbstractGridConfigurationComponent } from "@shared/components/abstract-grid-configuration/abstract-grid-configuration.component";
import { Store } from "@ngxs/store";
import { debounceTime, Subject } from "rxjs";
import { AgencyOrderManagement, Order, OrderManagement, ReOrder } from "@shared/models/order-management.model";
import { Router } from "@angular/router";

@Component({
  selector: 'app-order-reorders-list',
  templateUrl: './order-re-orders-list.component.html',
  styleUrls: ['./order-re-orders-list.component.scss'],
})
export class OrderReOrdersListComponent extends AbstractGridConfigurationComponent implements OnInit {
  private pageSubject = new Subject<number>();

  public currentReOrders: ReOrder[] | undefined;
  @Input() set reOrders(value: ReOrder[] | any) {
    this.currentReOrders = value;
  }
  @Input() isAgency: boolean = false;
  @Input() order: Order | OrderManagement | AgencyOrderManagement;
  @Output() selectReOrder = new EventEmitter<{ reOrder: OrderManagement | AgencyOrderManagement, order: Order | OrderManagement | AgencyOrderManagement }>()

  constructor(private store: Store, private router: Router) {
    super();
  }

  ngOnInit() {
    this.subscribeOnPageChanges();
  }

  private subscribeOnPageChanges(): void {
    this.pageSubject.pipe(debounceTime(1)).subscribe((page) => {
      this.currentPage = page;
    });
  }

  public onRowsDropDownChanged(): void {
    this.pageSize = parseInt(this.activeRowsPerPageDropDown);
    this.pageSettings = { ...this.pageSettings, pageSize: this.pageSize };
  }

  public onGoToClick(event: any): void {
    if (event.currentPage || event.value) {
      this.pageSubject.next(event.currentPage || event.value);
    }
  }

  onViewNavigation(reOrder: OrderManagement): void {
    this.selectReOrder.emit({reOrder: reOrder, order: this.order});
  }

  edit(order: OrderManagement): void {
    const parentRoute = this.isAgency ? 'agency' : 'client';
    this.router.navigate([`${parentRoute}/order-management/edit/${order?.id}`])
  }
}
