import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { Injectable } from '@angular/core';

import { SpinnerComponent } from '@core/components/spinner/spinner.component';

/**
 * This service is used to work directly with spinner component reference through the created portal.
 */
@Injectable({ providedIn: 'root' })
export class SpinnerService {
  private overlayRef: OverlayRef | null = null;

  private isShowing = false;

  constructor(private overlay: Overlay) {}

  show(): void {

    console.log('show')
    if (!this.overlayRef) {
      this.overlayRef = this.overlay.create();
    }

    const spinnerPortal = new ComponentPortal(SpinnerComponent);
    this.overlayRef.attach(spinnerPortal);
    this.isShowing = true;
    
  }

  hide(): void {
    if (this.overlayRef) {
      this.overlayRef.detach();
      this.isShowing = false;
    }
  }

  getSpinnerState(): boolean {
    return this.isShowing;
  }
}
