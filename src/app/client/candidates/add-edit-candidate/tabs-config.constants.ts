import { TabsModel } from '@shared/components/tabs/tabs.model';
import { CandidateProfileComponent } from '@client/candidates/candidate-profile/candidate-profile.component';

export const tabsConfig: TabsModel<CandidateProfileComponent>[] = [
  {
    title: 'Candidate Profile',
    subtitle: 'Overall Info',
    isRequired: true,
    disabled: false,
    component: CandidateProfileComponent
  },
  {
    title: 'Contract option',
    subtitle: 'Department details',
    isRequired: false,
    disabled: true,
    component: null
  },
  {
    title: 'Credentials',
    subtitle: 'Additional info here',
    isRequired: false,
    disabled: true,
    component: null
  }
];
