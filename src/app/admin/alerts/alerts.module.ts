import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlertsRoutingModule } from './alerts-routing.module';
import { UserSubscriptionComponent } from './user-subscription/user-subscription.component';
import { AlertsComponent } from './alerts.component';
import { PageToolbarModule } from '@shared/components/page-toolbar/page-toolbar.module';
import { DropDownListModule } from '@syncfusion/ej2-angular-dropdowns';
import {SwitchModule } from '@syncfusion/ej2-angular-buttons';
import { AgGridModule } from '@ag-grid-community/angular';
import { MultiselectDropdownModule } from '@shared/components/form-controls/multiselect-dropdown/multiselect-dropdown.module';
import { ReactiveFormsModule } from '@angular/forms';
import { NgxsModule } from '@ngxs/store';
import { AlertsState } from '@admin/store/alerts.state';


@NgModule({
  declarations: [
    AlertsComponent,
    UserSubscriptionComponent
  ],
  imports: [
    CommonModule,
    AlertsRoutingModule,
    PageToolbarModule,
    DropDownListModule,
    AgGridModule,
    MultiselectDropdownModule,    
    ReactiveFormsModule,
    SwitchModule,
    NgxsModule.forFeature([AlertsState]),
  ]
})
export class AlertsModule { }
