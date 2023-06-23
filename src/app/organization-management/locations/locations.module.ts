import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ButtonModule, SwitchModule } from '@syncfusion/ej2-angular-buttons';
import { DatePickerModule } from '@syncfusion/ej2-angular-calendars';
import { DropDownListModule, ListBoxModule } from '@syncfusion/ej2-angular-dropdowns';
import { GridModule, PagerModule } from '@syncfusion/ej2-angular-grids';
import {  NumericTextBoxModule, UploaderModule } from '@syncfusion/ej2-angular-inputs';
import { DialogModule } from '@syncfusion/ej2-angular-popups';
import { DropDownButtonModule } from '@syncfusion/ej2-angular-splitbuttons';
import { FeatherModule } from 'angular-feather';
import { Download, Edit, Sliders, Trash2, Upload } from 'angular-feather/icons';

import { ImportDialogContentModule } from '@shared/components/import-dialog-content/import-dialog-content.module';
import { SharedModule } from '@shared/shared.module';

import { ImportLocationsComponent } from './import-locations/import-locations.component';
import { LocationsComponent } from './locations.component';
import { LocationsService } from './locations.service';
import { LocationsRoutingModule } from './locations-routing.module';

const icons = {
  Download,
  Upload,
  Sliders,
  Edit,
  Trash2,
};

@NgModule({
  declarations: [
    LocationsComponent,
    ImportLocationsComponent,
  ],
  imports: [
    CommonModule,
    LocationsRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    ListBoxModule,
    PagerModule,
    GridModule,
    ButtonModule,
    DropDownListModule,
    UploaderModule,
    NumericTextBoxModule,
    DatePickerModule,
    DialogModule,
    SwitchModule,
    DropDownButtonModule,
    ImportDialogContentModule,
    FeatherModule.pick(icons),
  ],
  providers: [LocationsService],
})
export class LocationsModule { }
