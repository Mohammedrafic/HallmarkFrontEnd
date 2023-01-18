import { TabsModel } from '@shared/components/tabs/tabs.model';
import { CandidateProfileComponent } from '@client/candidates/candidate-profile/candidate-profile.component';
import { CandidateWorkCommitmentComponent } from '../candidate-work-commitment/candidate-work-commitment.component';
import { DepartmentsComponent } from '@client/candidates/departments/departments.component';

type TabComponents = CandidateProfileComponent | CandidateWorkCommitmentComponent | DepartmentsComponent;

export const tabsConfig: TabsModel<TabComponents>[] = [
  {
    title: 'Candidate Profile',
    subtitle: '',
    isRequired: true,
    disabled: false,
    component: CandidateProfileComponent,
  },
  {
    title: 'Work Commitment',
    subtitle: '',
    isRequired: false,
    disabled: true,
    component: CandidateWorkCommitmentComponent,
  },
  {
    title: 'Departments',
    subtitle: '',
    isRequired: false,
    disabled: true,
    component: DepartmentsComponent,
  },
  {
    title: 'Credentials',
    subtitle: '',
    isRequired: false,
    disabled: true,
    component: null,
  },
];
