import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { DialogModule } from '@syncfusion/ej2-angular-popups';
import { ButtonModule } from '@syncfusion/ej2-angular-buttons';

import {
  CreateWorkflowService,
} from '@organization-management/workflow/components/create-workflow/services/create-workflow.service';
import { ValidateDirectiveModule } from '@shared/directives/validate-directive/validate-directive.module';
import { CreateWorkflowComponent } from './create-workflow.component';

@NgModule({
  declarations: [
    CreateWorkflowComponent,
  ],
  exports: [
    CreateWorkflowComponent,
  ],
  imports: [
    CommonModule,
    DialogModule,
    ButtonModule,
    ReactiveFormsModule,
    ValidateDirectiveModule,
  ],
  providers: [CreateWorkflowService],
})
export class CreateWorkflowModule { }
