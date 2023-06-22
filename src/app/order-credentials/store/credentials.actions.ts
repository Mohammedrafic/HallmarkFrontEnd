import { IOrderCredentialItem } from '@order-credentials/types';
import { SystemType } from '@shared/enums/system-type.enum';

export class GetAllCredentials {
  static readonly type = '[order candidates credentials] Get All Credentials';

  constructor(public readonly includeInIRP: boolean) {
  }
}

export class GetAllCredentialTypes {
  static readonly type = '[order candidates credentials] Get All Credential Types';
}

export class GetPredefinedCredentials {
  static readonly type = '[order candidates credentials] Get Predefined Credentials';

  constructor(public departmentId: number,
              public skillId: number,
              public systemType: SystemType) {}
}

export class UpdatePredefinedCredentials {
  static readonly type = '[order candidates credentials] Update Predefined Credentials';

  constructor(public payload: IOrderCredentialItem[]) {
  }
}
