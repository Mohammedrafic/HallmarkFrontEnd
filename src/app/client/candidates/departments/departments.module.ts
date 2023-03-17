import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DepartmentsComponent } from '@client/candidates/departments/departments.component';
import { AssignDepartmentComponent } from '@client/candidates/departments/assign-department/assign-department.component';
import { GridModule } from '@shared/components/grid/grid.module';
import { FeatherModule } from 'angular-feather';
import { ButtonModule } from '@shared/components/button/button.module';
import { SharedModule } from '@shared/shared.module';
import { MultiselectDropdownModule } from '@shared/components/form-controls/multiselect-dropdown/multiselect-dropdown.module';
import { DatepickerModule } from '@shared/components/form-controls/datepicker/datepicker.module';
import { ToggleModule } from '@shared/components/form-controls/toggle/toggle.module';
import { DepartmentsService } from '@client/candidates/departments/services/departments.service';
import { SkillMatchComponent } from './grid/cell-renderers/skill-match/skill-match.component';
import { SkillNameComponent } from './grid/cell-renderers/skill-name/skill-name.component';
import { OrientationCompletedComponent } from './grid/cell-renderers/orientation-completed/orientation-completed.component';
import { TooltipContainerModule } from '@shared/components/tooltip-container/tooltip.module';
import { MultiplePipeModule } from '@shared/pipes/multiple.pipe';
import { JoinPipeModule } from '@shared/pipes/join.pipe';
import { DropdownModule } from '@shared/components/form-controls/dropdown/dropdown.module';
import { FilterDepartmentComponent } from './filter-department/filter-department.component';
import { DepartmentFormService } from './services/department-form.service';
import { EditDepartmentsComponent } from './edit-departments/edit-departments.component';
import { DepartmentNameComponent } from './grid/cell-renderers/department-name/department-name.component';
import { HomeCostCenterPipe } from './pipes/home-cost-center.pipe';
import { RadioButtonModule } from '@shared/components/form-controls/radio-button/radio-button.module';

@NgModule({
  declarations: [
    DepartmentsComponent,
    AssignDepartmentComponent,
    SkillMatchComponent,
    SkillNameComponent,
    OrientationCompletedComponent,
    FilterDepartmentComponent,
    EditDepartmentsComponent,
    DepartmentNameComponent,
    HomeCostCenterPipe
  ],
  imports: [
    CommonModule,
    GridModule,
    FeatherModule,
    ButtonModule,
    SharedModule,
    MultiselectDropdownModule,
    DatepickerModule,
    ToggleModule,
    TooltipContainerModule,
    MultiplePipeModule,
    JoinPipeModule,
    DropdownModule,
    RadioButtonModule
  ],
  providers: [DepartmentsService, DepartmentFormService],
})
export class DepartmentsModule {}
