export class UserMspBusinessUnit {
  id: number;
  name: string;
  hasLogo?: boolean;
  lastUpdateTicks?: number;
}

export class UserMsp {
  businessUnits: UserMspBusinessUnit[];
  selectedMspId: number;
}

export class LastSelectedMspID {
  lastSelectedMspId: number | null;
}
