import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalyticsComponent } from './analytics.component';
import { StateWiseSkillsComponent } from './state-wise-skills/state-wise-skills.component';
import { CandidateStatsComponent } from './candidate-stats/candidate-stats.component';
import { AnalyticsRoutingModule } from './analytics-routing.module';
import { LogiReportComponent } from '@shared/components/logi-report/logi-report.component';
import { PageReportComponent } from './page-report/page-report.component';
import { DropDownListModule, MultiSelectAllModule } from '@syncfusion/ej2-angular-dropdowns';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxsModule } from '@ngxs/store';
import { UserState } from 'src/app/store/user.state';
import { OrganizationManagementState } from '@organization-management/store/organization-management.state';
import { SecurityState } from 'src/app/security/store/security.state';
import { LogiReportState } from '@organization-management/store/logi-report.state';

@NgModule({
  declarations: [
    AnalyticsComponent,
    StateWiseSkillsComponent,
    CandidateStatsComponent,
    LogiReportComponent,
    PageReportComponent],
  imports: [
    CommonModule,
    FormsModule,    
    ReactiveFormsModule,
    AnalyticsRoutingModule,
    MultiSelectAllModule,
    DropDownListModule,
    NgxsModule.forFeature([OrganizationManagementState,UserState,SecurityState,LogiReportState])
  ]
})
export class AnalyticsModule { }
