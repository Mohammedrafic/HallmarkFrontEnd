import { AgencyOrderManagement, AgencyOrderManagementPage } from './../../../shared/models/order-management.model';
import { HttpClient } from '@angular/common/http';
import { Injectable } from "@angular/core";
import { Observable } from 'rxjs';

@Injectable()
export class DemoService {
  constructor(
    private http: HttpClient,
  ) {}

  getAgencyOrders(
    pageNumber: number,
    pageSize: number,
  ): Observable<AgencyOrderManagementPage> {
    return this.http.get<AgencyOrderManagementPage>(`/api/Orders/agencyOrders`,
    { params: { PageNumber: pageNumber, PageSize: pageSize }});
  }

  createTimeSheets(orders: AgencyOrderManagement[]): any[] {
    const selectedOrders: any[] = [];

    orders.forEach((order, idx) => {
      if (order.children.length > 0) {
          const timesheets = order.children.filter((child) => child.statusName === 'Onboard')
          .map((cand, index: number) => {
            return {
              ...cand,
              id: index + Math.random() * 7,
              department: order.department,
              startDate: new Date(order.jobStartDate),
              endDate: this.calcLastWorkDay(order.jobStartDate),
              location: order.location,
              billRate: order.billRate,
              orgName: order.organizationName,
              skill: order.skill,
              orderId: order.orderId,
              status: 'incomplete',
              weekNum: this.calcweekNum(new Date(order.jobStartDate)),
              totalDays: this.calcWeekDays(order.jobStartDate),
              jobTitle: order.jobTitle,
            }
          })
          selectedOrders.push(...timesheets);
      }
    });

    return selectedOrders;
  }

  private calcweekNum(start: Date): number {
    const firstDay = new Date(start.getFullYear(), start.getMonth(), 1).getDay();
    return Math.ceil((start.getDate() + (firstDay - 1)) / 7);

  }

  private calcWeekDays(start: string): number {
    let startDate = new Date(start);
    let calc = 0;

    while (startDate.getDay() !== 0 && startDate.getDay() !== 6) {
      calc += 1;
      startDate = new Date(startDate.setDate(startDate.getDate() + 1));
    }

    return calc;
  }

  private calcLastWorkDay(start: string): Date {
    let startDate = new Date(start);
    const days = this.calcWeekDays(start) - 1;
    return new Date(startDate.setDate(startDate.getDate() + days));
  }
}
