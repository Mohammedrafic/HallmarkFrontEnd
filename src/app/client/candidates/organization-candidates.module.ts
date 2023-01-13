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
import { CandidateWorkCommitmentModule } from './candidate-work-commitment/candidate-work-commitment.module';
import { CandidateService } from './services/candidate.service';

@NgModule({
  declarations: [CandidateProfileComponent, AddEditCandidateComponent],
  imports: [
    CommonModule,
    CandidateProfileModule,
    CandidateWorkCommitmentModule,
    OrganizationCandidatesRoutingModule,
    PageToolbarModule,
    ButtonModule,
    TabsModule,
    SharedModule
  ],
  providers: [
    CandidateService
  ]
})
export class OrganizationCandidatesModule {}
