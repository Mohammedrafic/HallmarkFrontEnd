export interface MenuSettings {
  text: string;
  id: number;
  route: string;
  permissionKeys?: string[];
  isIRPOnly?: boolean;
}
