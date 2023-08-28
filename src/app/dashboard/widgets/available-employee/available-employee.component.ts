import { Component, ChangeDetectionStrategy,Input, ViewChild } from '@angular/core';
import { AvailableEmployeeModel } from '../../models/available-employee.model';
import { AgGridAngular } from '@ag-grid-community/angular';
import { DashboardService } from '../../services/dashboard.service';

@Component({
  selector: 'app-available-employee',
  templateUrl: './available-employee.component.html',
  styleUrls: ['./available-employee.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AvailableEmployeeComponent {
  @Input() public chartData:AvailableEmployeeModel[] | undefined ;
  @Input() isDarkTheme: boolean | false;
  @Input() description: string;
  @Input() public isLoading: boolean;
  @ViewChild('availableEmployees') availableEmployees:AgGridAngular

  constructor(private readonly dashboardService: DashboardService){
  }



  EmpScheduleRedirect(RowData: Object) {
    this.dashboardService.redirect_to_schedule("/client/scheduling", RowData);
  }

}
