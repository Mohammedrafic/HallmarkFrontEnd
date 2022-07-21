import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

import { Select, Store } from '@ngxs/store';
import { debounceTime, Observable, Subject } from 'rxjs';
import { GridComponent } from '@syncfusion/ej2-angular-grids';
import { DialogComponent } from '@syncfusion/ej2-angular-popups';

import { AbstractGridConfigurationComponent } from '@shared/components/abstract-grid-configuration/abstract-grid-configuration.component';
import { DialogNextPreviousOption } from '@shared/components/dialog-next-previous/dialog-next-previous.component';
import { BusinessUnitType } from '@shared/enums/business-unit-type';
import {
  AgencyOrder,
  CandidateListEvent,
  Order,
  OrderCandidatesList,
  OrderCandidatesListPage,
} from '@shared/models/order-management.model';
import { disabledBodyOverflow } from '@shared/utils/styles.utils';
import { OrderManagementState } from '@agency/store/order-management.state';
import { SetLastSelectedOrganizationAgencyId } from 'src/app/store/user.actions';
import { UserState } from 'src/app/store/user.state';

@Component({
  selector: 'app-order-per-diem-candidates-list',
  templateUrl: './order-per-diem-candidates-list.component.html',
  styleUrls: ['./order-per-diem-candidates-list.component.scss'],
})
export class OrderPerDiemCandidatesListComponent extends AbstractGridConfigurationComponent implements OnInit {
  @ViewChild('orderCandidatesGrid') grid: GridComponent;
  @ViewChild('sideDialog') sideDialog: DialogComponent;

  @Input() candidatesList: OrderCandidatesListPage | null;
  @Input() order: AgencyOrder;

  @Output() getCandidatesList = new EventEmitter<CandidateListEvent>();

  @Select(OrderManagementState.selectedOrder)
  public selectedOrder$: Observable<Order>;

  public templateState: Subject<any> = new Subject();
  public includeDeployedCandidates: boolean = true;
  public targetElement: HTMLElement | null = document.body.querySelector('#main');
  public dialogNextPreviousOption: DialogNextPreviousOption = { next: false, previous: false };
  public candidate: OrderCandidatesList;
  public isAgency: boolean;

  private pageSubject = new Subject<number>();

  constructor(private store: Store, private router: Router) {
    super();
  }

  ngOnInit() {
    this.isAgency = this.router.url.includes('agency');
    this.subscribeOnPageChanges();
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

  public onViewNavigation(data: any): void {
    const user = this.store.selectSnapshot(UserState.user);
    const url = user?.businessUnitType === BusinessUnitType.Organization ? '/agency/candidates' : '/agency/candidates/edit';
    if (user?.businessUnitType === BusinessUnitType.Hallmark) {
      this.store.dispatch(
        new SetLastSelectedOrganizationAgencyId({
          lastSelectedAgencyId: data.agencyId,
          lastSelectedOrganizationId: null,
        })
      );
    }
    const pageToBack = this.router.url;
    this.router.navigate([url, data.candidateId], { state: { orderId: this.order.orderId, pageToBack } });
    disabledBodyOverflow(false);
  }

  public onEdit(data: OrderCandidatesList, event: MouseEvent): void {
    this.candidate = { ...data };
    this.addActiveCssClass(event);

    if (this.order && this.candidate) {
      if (this.isAgency) {
          // this.openDialog();
      } else {
        // this.openDialog();
      }
    }
  }

  public onCloseDialog(): void {
    this.sideDialog.hide();
    this.removeActiveCssClass();
  }

  private subscribeOnPageChanges(): void {
    this.pageSubject.pipe(debounceTime(1)).subscribe((page) => {
      this.currentPage = page;
      this.getCandidatesList.emit({
        orderId: this.order.orderId,
        organizationId: this.order.organizationId,
        currentPage: this.currentPage,
        pageSize: this.pageSize,
        excludeDeployed: false,
      });
    });
  }

  private openDialog(template: any): void {
    this.templateState.next(template);
    this.sideDialog.show();
  }
}
