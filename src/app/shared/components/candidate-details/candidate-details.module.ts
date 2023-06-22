import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CandidateDetailsComponent } from './candidate-details.component';
import { TabNavigationComponent } from './tab-navigation/tab-navigation.component';
import { TabAllModule } from '@syncfusion/ej2-angular-navigations';
import { ButtonModule, ChipListModule } from '@syncfusion/ej2-angular-buttons';
import { FeatherModule } from 'angular-feather';
import { PageToolbarModule } from '@shared/components/page-toolbar/page-toolbar.module';
import { CandidateGridComponent } from './candidate-grid/candidate-grid.component';
import { GridAllModule } from '@syncfusion/ej2-angular-grids';
import { SharedModule } from '@shared/shared.module';
import { GridModule } from '@shared/components/grid/grid.module';
import { GridStatusRendererComponent } from './candidate-grid/grid-status-renderer/grid-status-renderer.component';
import { NgxsModule } from '@ngxs/store';
import { CandidateDetailsState } from '@shared/components/candidate-details/store/candidate.state';
import { CandidateDetailsService } from '@shared/components/candidate-details/services/candidate-details.service';
import { GridNameRendererComponent } from './candidate-grid/grid-name-renderer/grid-name-renderer.component';
import { GridPositionRendererComponent } from './candidate-grid/grid-position-renderer/grid-position-renderer.component';
import { FiltersComponent } from './filters/filters.component';
import { AutoCompleteAllModule, DropDownListModule, MultiSelectAllModule } from '@syncfusion/ej2-angular-dropdowns';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DatePickerModule } from '@syncfusion/ej2-angular-calendars';
import { GridClassificationRendererComponent } from './candidate-grid/grid-classification-renderer/grid-classification-renderer.component';
import { CandidateDetailsApiService } from './services/candidate-details-api.service';
import { DropDownButtonAllModule, DropDownButtonModule } from '@syncfusion/ej2-angular-splitbuttons';

@NgModule({
  declarations: [
    CandidateDetailsComponent,
    TabNavigationComponent,
    CandidateGridComponent,
    GridStatusRendererComponent,
    GridNameRendererComponent,
    GridClassificationRendererComponent,
    GridPositionRendererComponent,
    FiltersComponent,
  ],
  imports: [
    CommonModule,
    PageToolbarModule,
    TabAllModule,
    ButtonModule,
    FeatherModule,
    GridAllModule,
    ChipListModule,
    SharedModule,
    GridModule,
    FormsModule,
    ReactiveFormsModule,
    DatePickerModule,
    MultiSelectAllModule,
    AutoCompleteAllModule,
    DropDownButtonAllModule,
    DropDownButtonModule,
    DropDownListModule,
    //STORE
    NgxsModule.forFeature([CandidateDetailsState]),
  ],
  providers: [CandidateDetailsApiService, CandidateDetailsService],
    exports: [CandidateDetailsComponent, FiltersComponent],
})
export class CandidateDetailsModule {}
