import {PageOfCollections} from "@shared/models/page.model";

export type User = {
  firstName: string;
  lastName: string;
  email: string;
  emailConfirmation: string;
  isDeleted: boolean;
  address1?: string;
  address2?: string;
  country?: boolean;
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
};

export type UserDTO = {
  businessUnitId: number | null;
  metadata: User;
  roleIds: Array<number>;
}

export type UsersPage = PageOfCollections<User>;

export type RolesPerUser = {
  id: number;
  name: string;
}

