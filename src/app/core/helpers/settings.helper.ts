import { SettingsKeys } from "@shared/enums/settings";
import { Configuration } from "@shared/models/organization-settings.model";

export class SettingsHelper {
  public static mapSettings(settings: Configuration[]): {[key in SettingsKeys]?: Configuration} {
    return settings.reduce((acc: {[key in SettingsKeys]?: Configuration}, curr: Configuration)=> {
      curr.value = (curr.value === 'true' || curr.value === true);
      return ((acc as any)[curr.settingKey] = curr, acc)
    }, {});
  }
}
