export class BusinessUnit {
  id: number;
  businessUnitType: number;
  name: string;
  parentUnitId: number;
  agencyStatus: number;
  isIRPEnabled?: boolean;
  isVMSEnabled?: boolean;
  selectedBussinessUnitIds: string;
}
