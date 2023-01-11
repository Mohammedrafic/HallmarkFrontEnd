import { TabsModel } from '@shared/components/tabs/tabs.model';
import { CandidateProfileComponent } from '@client/candidates/candidate-profile/candidate-profile.component';
import { CandidateWorkCommitmentComponent } from '../candidate-work-commitment/candidate-work-commitment.component';

export const tabsConfig: TabsModel<CandidateProfileComponent | CandidateWorkCommitmentComponent>[] = [
  {
    title: 'Candidate Profile',
    subtitle: '',
    isRequired: true,
    disabled: false,
    component: CandidateProfileComponent
  },
  {
    title: 'Work Commitment',
    subtitle: '',
    isRequired: false,
    disabled: true,
    component: CandidateWorkCommitmentComponent
  },
  {
    title: 'Departments',
    subtitle: '',
    isRequired: false,
    disabled: true,
    component: null
  },
  {
    title: 'Credentials',
    subtitle: '',
    isRequired: false,
    disabled: true,
    component: null
  }
];
