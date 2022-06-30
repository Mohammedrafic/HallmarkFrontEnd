import { FeatherModule } from 'angular-feather';
import { Sliders } from 'angular-feather/icons';

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { ButtonModule } from '@shared/components/button/button.module';
import { InlineLoaderModule } from '@shared/components/inline-loader/inline-loader.module';
import { PageToolbarModule } from '@shared/components/page-toolbar/page-toolbar.module';
import { ReportComponent } from './report.component';
import { ReportRoutingModule } from './report-routing.module';

@NgModule({
  declarations: [ReportComponent],
  imports: [
    ButtonModule,
    CommonModule,
    FeatherModule.pick({ Sliders }),
    InlineLoaderModule,
    PageToolbarModule,
    ReportRoutingModule,
  ],
})
export class ReportModule {}
