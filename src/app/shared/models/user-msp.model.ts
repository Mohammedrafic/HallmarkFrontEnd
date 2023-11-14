export class UserMspBusinessUnit {
  id: number;
  name: string;
  hasLogo?: boolean;
  lastUpdateTicks?: number;
}

export class UserMsp {
  businessUnits: UserMspBusinessUnit[];
  lastSelectedMspId: number;
}

export class LastSelectedMspID {
  lastSelectedMspId: number | null;
}
