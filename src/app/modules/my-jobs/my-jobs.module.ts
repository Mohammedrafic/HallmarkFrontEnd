import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ButtonAllModule } from '@syncfusion/ej2-angular-buttons';
import { FeatherModule } from 'angular-feather';
import { Sliders } from 'angular-feather/icons';

import { MyJobsGridModule } from './components/my-jobs-grid/my-jobs-grid.module';
import { MyJobsFilterModule } from './components/my-jobs-filter/my-jobs-filter.module';
import { MyJobsContainerComponent } from './containers/my-jobs-container/my-jobs-container.component';
import { MyJobsResolver } from './resolvers/my-jobs.resolver';
import { MyJobsRoutingModule } from './my-jobs-routing.module';
import { MyJobsFilterService } from './services/my-jobs-filter.service';
import { MyJobsApiService } from './services/my-jobs-api.service';
import { MyJobsService } from './services/my-jobs.service';

@NgModule({
  declarations: [
    MyJobsContainerComponent,
  ],
  imports: [
    CommonModule,
    MyJobsRoutingModule,
    ButtonAllModule,
    FeatherModule.pick({ Sliders }),
    MyJobsFilterModule,
    MyJobsGridModule,
  ],
  providers: [
    MyJobsResolver,
    MyJobsFilterService,
    MyJobsService,
    MyJobsApiService,
  ],
})
export class MyJobsModule { }
