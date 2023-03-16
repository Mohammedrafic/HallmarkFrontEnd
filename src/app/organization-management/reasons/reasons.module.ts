import { AgGridModule } from '@ag-grid-community/angular';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { GridModule } from '@shared/components/grid/grid.module';
import { TooltipContainerModule } from '@shared/components/tooltip-container/tooltip.module';
import { SharedModule } from '@shared/shared.module';
import { ButtonModule, RadioButtonModule, SwitchModule, CheckBoxModule } from '@syncfusion/ej2-angular-buttons';
import { DropDownListAllModule } from '@syncfusion/ej2-angular-dropdowns';
import { GridAllModule, PagerAllModule } from '@syncfusion/ej2-angular-grids';
import { NumericTextBoxAllModule, TextBoxAllModule } from '@syncfusion/ej2-angular-inputs';
import { TabAllModule } from '@syncfusion/ej2-angular-navigations';
import { FeatherModule } from 'angular-feather';
import { Edit, Trash2 } from 'angular-feather/icons';

import { ClosureReasonComponent } from './components/closure-reason/closure-reason.component';
import { ManualInvoiceRejectReasonComponent,
} from './components/manual-invoice-reject-reason/manual-invoice-reject-reason.component';
import { OrderRequisitionComponent } from './components/order-requisition/order-requisition.component';
import { PenaltiesComponent } from './components/penalties/penalties.component';
import { ReasonsRoutingModule } from './reasons-routing.module';
import { ReasonsComponent } from './reasons.component';
import { CandidateRejectReasonComponent } from './components/reject-reason/candidate-reject-reason.component';
import { ReasonsFormsService } from './services/reasons-form.service';
import { ReasonsService } from './services/reasons.service';
import { UnavailabilityReasonsModule } from './components/unavailability-reasons';
import { ToggleIconRendererModule } from '@shared/components/cell-renderers/toggle-icon-renderer';
import { ValidateDirectiveModule } from '@shared/directives/validate-directive/validate-directive.module';
import { InternalTransferComponent } from './components/internal-transfer/internal-transfer.component';

const icons = {
    Edit,
    Trash2,
  };

@NgModule({
    imports: [
        CommonModule,
        UnavailabilityReasonsModule,
        DropDownListAllModule,
        GridAllModule,
        NumericTextBoxAllModule,
        PagerAllModule,
        FeatherModule.pick(icons),
        TooltipContainerModule,
        ButtonModule,
        TabAllModule,
        SharedModule,
        ReactiveFormsModule,
        RadioButtonModule,
        GridModule,
        ReasonsRoutingModule,
        AgGridModule,
        ToggleIconRendererModule,
        SwitchModule,
        TextBoxAllModule,
        ValidateDirectiveModule,
        CheckBoxModule,
    ],
    declarations: [
        ReasonsComponent,
        ClosureReasonComponent,
        ManualInvoiceRejectReasonComponent,
        OrderRequisitionComponent,
        PenaltiesComponent,
        CandidateRejectReasonComponent,
        InternalTransferComponent,
    ],
    providers: [ReasonsFormsService, ReasonsService],
    exports: [ReasonsComponent],
})
export class ReasonsModule {}