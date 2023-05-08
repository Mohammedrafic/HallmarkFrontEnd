import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CanManageSettingPipe } from './can-manage-setting.pipe';

@NgModule({
  declarations: [CanManageSettingPipe],
  imports: [CommonModule],
  exports: [CanManageSettingPipe],
})
export class CanManageSettingModule { }
