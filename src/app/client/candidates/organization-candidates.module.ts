import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CandidateProfileComponent } from './candidate-profile/candidate-profile.component';
import { CandidateProfileModule } from './candidate-profile/candidate-profile.module';
import { OrganizationCandidatesRoutingModule } from './organization-candidates-routing.module';
import { AddEditCandidateComponent } from './add-edit-candidate/add-edit-candidate.component';
import { PageToolbarModule } from '@shared/components/page-toolbar/page-toolbar.module';
import { ButtonModule } from '@syncfusion/ej2-angular-buttons';
import { TabsModule } from '@shared/components/tabs/tabs.module';
import { SharedModule } from '@shared/shared.module';
import { CandidateWorkCommitmentModule } from './candidate-work-commitment/candidate-work-commitment.module';
import { CandidatesService } from './services/candidates.service';
import { DepartmentsModule } from './departments/departments.module';
import { CredentialsModule } from './credentials/credentials.module';
import { ScrollRestorationService } from '@core/services/scroll-restoration.service';
import {
  ReplacementOrderConfirmationModule,
} from '@shared/components/replacement-order-confirmation/replacement-order-confirmation.module';

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
    SharedModule,
    DepartmentsModule,
    CredentialsModule,
    ReplacementOrderConfirmationModule,
  ],
  providers: [CandidatesService, ScrollRestorationService],
})
export class OrganizationCandidatesModule {}
