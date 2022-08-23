import { SettingsKeys } from "@shared/enums/settings";
import { OrganizationSettingsGet } from "@shared/models/organization-settings.model";

export class SettingsHelper {
  public static mapSettings(settings: OrganizationSettingsGet[]): {[key in SettingsKeys]?: OrganizationSettingsGet} {
    return settings.reduce((acc: {[key in SettingsKeys]?: OrganizationSettingsGet}, curr: OrganizationSettingsGet)=> {
      curr.value = (curr.value === 'true' || curr.value === true);
      return ((acc as any)[curr.settingKey] = curr, acc)
    }, {});
  }
}
