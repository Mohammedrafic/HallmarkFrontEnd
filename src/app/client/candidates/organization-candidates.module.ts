import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CandidateProfileComponent } from '@client/candidates/candidate-profile/candidate-profile.component';
import { CandidateProfileModule } from '@client/candidates/candidate-profile/candidate-profile.module';
import { OrganizationCandidatesRoutingModule } from '@client/candidates/organization-candidates-routing.module';
import { AddEditCandidateComponent } from './add-edit-candidate/add-edit-candidate.component';
import { PageToolbarModule } from '@shared/components/page-toolbar/page-toolbar.module';
import { ButtonModule } from '@syncfusion/ej2-angular-buttons';
import { TabsModule } from '@shared/components/tabs/tabs.module';
import { SharedModule } from '@shared/shared.module';

@NgModule({
  declarations: [CandidateProfileComponent, AddEditCandidateComponent],
  imports: [
    CommonModule,
    CandidateProfileModule,
    OrganizationCandidatesRoutingModule,
    PageToolbarModule,
    ButtonModule,
    TabsModule,
    SharedModule
  ]
})
export class OrganizationCandidatesModule {}
