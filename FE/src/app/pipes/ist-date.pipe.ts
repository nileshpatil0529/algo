import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'istDate'
})
export class IstDatePipe implements PipeTransform {

  transform(value: string): string {
    if (!value) return '';

    // Extract the date part and the hour:minute part
    const datePart = value.slice(0, 10);  // "2024-09-06"
    const timePart = value.slice(11, 16); // "10:02"

    // Return the formatted date and time
    return `${datePart} ${timePart}`;
  }
}
