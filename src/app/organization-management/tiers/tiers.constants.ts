import { SystemType } from "@shared/enums/system-type.enum";
import { ButtonModel } from "@shared/models/buttons-group.model";

export const SystemButtons: ButtonModel[] = [
  {
    id: SystemType.IRP,
    title: SystemType[SystemType.IRP],
    active: true,
  },
  {
    id: SystemType.VMS,
    title: SystemType[SystemType.VMS],
  },
];
