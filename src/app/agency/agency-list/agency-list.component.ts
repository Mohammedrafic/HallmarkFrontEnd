import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { GridComponent } from "@syncfusion/ej2-angular-grids";
import { debounceTime, Observable, Subject } from "rxjs";

import { GetAgencyByPage } from "src/app/agency/store/agency.actions";
import { AgencyState } from "src/app/agency/store/agency.state";
import { AbstractGridConfigurationComponent } from "src/app/shared/components/abstract-grid-configuration/abstract-grid-configuration.component";
import { AgencyStatus, STATUS_COLOR_GROUP } from "src/app/shared/enums/status";
import { AgencyPage } from "src/app/shared/models/agency.model";
import { SetHeaderState } from 'src/app/store/app.actions';

@Component({
  selector: 'app-agency-list',
  templateUrl: './agency-list.component.html',
  styleUrls: ['./agency-list.component.scss']
})
export class AgencyListComponent extends AbstractGridConfigurationComponent implements OnInit {
  @ViewChild('grid') grid: GridComponent;

  public readonly statusEnum = AgencyStatus;
  public initialSort = {
    columns: [
      { field: 'agencyDetails.name', direction: 'Ascending' }
    ]
  };

  private pageSubject = new Subject<number>();

  @Select(AgencyState.agencies)
  agencies$: Observable<AgencyPage>;


  constructor(private store: Store, private router: Router, private route: ActivatedRoute) {
    super();
    this.store.dispatch(new SetHeaderState({ title: 'Agency List', iconName: 'clock' }));
  }

  ngOnInit(): void {
    this.store.dispatch(new GetAgencyByPage(this.currentPage, this.pageSize));
    this.pageSubject.pipe(debounceTime(1)).subscribe((page) => {
      this.currentPage = page;
      this.store.dispatch(new GetAgencyByPage(this.currentPage, this.pageSize));
    });
  }

  public navigateToAgencyForm(): void {
    this.router.navigate(['/agency/agency-list/add']);
  }

  public dataBound(): void {
    this.grid.hideScroll();
  }

  public onRowsDropDownChanged(): void {
    this.pageSize  = parseInt(this.activeRowsPerPageDropDown);
    this.pageSettings = { ...this.pageSettings, pageSize: this.pageSize };
  }

  public onGoToClick(event: any): void {
    if (event.currentPage || event.value) {
      this.pageSubject.next(event.currentPage || event.value);
    }
  }

  public getChipCssClass(status: string): string {
    const found = Object.entries(STATUS_COLOR_GROUP).find(item => item[1].includes(status));
    return found ? found[0] : 'e-default';
  }

  public onEdit(data: any) {
    this.router.navigate(['/agency/agency-list/edit', data.agencyDetails.id]);
  }


  public onRemove(data: any) {}
}
