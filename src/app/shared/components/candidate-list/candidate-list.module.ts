import { NgModule } from '@angular/core';
import { CandidateListComponent } from './components/candidate-list/candidate-list.component';
import { GridModule, PagerModule } from '@syncfusion/ej2-angular-grids';
import { CommonModule } from '@angular/common';
import { NumericTextBoxModule } from '@syncfusion/ej2-angular-inputs';
import { FeatherModule } from 'angular-feather';
import { User } from 'angular-feather/icons';
import { ButtonModule, ChipListModule } from '@syncfusion/ej2-angular-buttons';
import { DropDownListModule, MultiSelectModule } from '@syncfusion/ej2-angular-dropdowns';
import { SharedModule } from '../../shared.module';
import { ReactiveFormsModule } from '@angular/forms';
import { NgxsModule } from '@ngxs/store';
import { CandidateListState } from './store/candidate-list.state';
import { CandidateListService } from './services/candidate-list.service';
import { DatePickerModule } from '@syncfusion/ej2-angular-calendars';

const COMPONENTS = [CandidateListComponent];
const icons = { User };

@NgModule({
  providers: [CandidateListService],
  imports: [
    CommonModule,
    FeatherModule.pick(icons),
    GridModule,
    NumericTextBoxModule,
    ChipListModule,
    PagerModule,
    DropDownListModule,
    SharedModule,
    ReactiveFormsModule,
    MultiSelectModule,
    ButtonModule,
    DatePickerModule,
    NgxsModule.forFeature([CandidateListState]),
  ],
  declarations: [...COMPONENTS],
  exports: [...COMPONENTS],
})
export class CandidateListModule {}
