import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { AgGridModule } from '@ag-grid-community/angular';
import { ButtonModule } from '@syncfusion/ej2-angular-buttons';
import { FeatherModule } from 'angular-feather';
import { Edit, Trash2 } from 'angular-feather/icons';

import { GridPaginationModule } from '@shared/components/grid/grid-pagination/grid-pagination.module';
import { UnavailabilityReasonsComponent } from './unavailability-reasons.component';
import { UnavaliabilityActionsComponent } from './unavaliability-actions/unavaliability-actions.component';

@NgModule({
    imports: [
        CommonModule,
        AgGridModule,
        GridPaginationModule,
        ButtonModule,
        FeatherModule.pick({ Edit, Trash2 }),
        GridPaginationModule,
    ],
    declarations: [UnavailabilityReasonsComponent, UnavaliabilityActionsComponent],
    exports: [UnavailabilityReasonsComponent],
})
export class UnavailabilityReasonsModule {}