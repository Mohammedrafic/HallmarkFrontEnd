import { Injectable } from '@angular/core';

@Injectable()
export class ScrollRestorationService {
  private readonly positionStorage = new Map<string, number>();

  createScrollPositionStorage(key: string, initPosition = 0): void {
    this.positionStorage.set(key, initPosition);
  }

  getScrollPosition(key: string): number | undefined {
    return this.positionStorage.get(key);
  }

  setScrollPosition(key: string, position: number): void {
    this.positionStorage.set(key, position);
  }
}
