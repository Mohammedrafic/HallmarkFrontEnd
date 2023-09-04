import { PageOfCollections } from '@shared/models/page.model';

export type User = {
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  emailConfirmation: string;
  isDeleted: boolean;
  lastLoginDate?: string;
  address1?: string;
  address2?: string;
  country?: number | string;
  state?: string;
  city?: string;
  zip?: string;
  phoneNumber?: string;
  fax?: string;
  id?: string;
  businessUnitId?: number;
  businessUnitType?: number;
  businessUnitName?: string;
  assigned: boolean;
  roles: Array<number> | [];
  timeZone?: string;
};

export type UserDTO = {
  businessUnitId: number | null;
  metadata: User;
  roleIds: Array<number>;
  userId?: string;
};

export type UsersPage = PageOfCollections<User>;

export type RolesPerUser = {
  id: number;
  name: string;
};


export type GetBusinessUnitIdDetails = {
  isIRPEnabled: boolean;
  isCreateEmployee: boolean;
};
