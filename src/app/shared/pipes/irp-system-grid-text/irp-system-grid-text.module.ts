import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { IrpSystemGridTextPipe } from '@shared/pipes/irp-system-grid-text/irp-system-grid-text.pipe';

@NgModule({
  declarations: [IrpSystemGridTextPipe],
  imports: [CommonModule],
  exports: [IrpSystemGridTextPipe],
})
export class IrpSystemGridTextPipeModule {}
