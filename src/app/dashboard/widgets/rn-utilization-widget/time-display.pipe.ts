import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timeDisplay'
})
export class TimeDisplayPipe implements PipeTransform {

  transform(hours: number | undefined): string { 
    if (hours == undefined) {
      return '00:00';
    }

    const hoursFloor = Math.floor(hours); 
    const minutes = Math.round((hours - hoursFloor) * 60);
    const paddedMinutes = String(minutes).padStart(2, '0'); 
    return `${hoursFloor}:${paddedMinutes}`; 
  }
}
