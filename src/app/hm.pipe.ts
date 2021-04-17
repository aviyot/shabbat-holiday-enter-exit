import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'hm'
})
export class HmPipe implements PipeTransform {

  transform(value: string): string {
    return value.slice(0,5);
  }

}
