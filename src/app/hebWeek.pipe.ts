import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'hebWeek',
})
export class HebWeekPipe implements PipeTransform {
  transform(weekName: string): any {
    switch (weekName) {
      case 'Sunday':
        return 'ראשון';
      case 'Monday':
        return 'שני';
      case 'Tuesday':
        return 'שלישי';
      case 'Wednesday':
        return 'רביעי';
      case 'Thursday':
        return 'חמישי';
      case 'Friday':
        return 'שישי';
      case 'Saturday':
        return 'שבת';
      default:
        break;
    }
  }
}
