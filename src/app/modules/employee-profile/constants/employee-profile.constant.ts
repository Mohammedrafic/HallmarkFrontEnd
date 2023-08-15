import { EmployeeSectionLink } from '../interfaces';

export const ProfileInformationRoute = 'information';

export const EmployeeCredentialsRoute = 'credentials';

export const EmployeeProfileSectionLinks: EmployeeSectionLink[] = [
  {
    route: ProfileInformationRoute,
    title: 'Profile Information',
  },
  {
    route: EmployeeCredentialsRoute,
    title: 'Credentials and Licenses',
  },
];

