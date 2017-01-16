import { Pipe, PipeTransform } from '@angular/core';
import * as Get from 'get-value';

@Pipe({
  name: 'search'
})
export class SearchPipe implements PipeTransform {
  transform(list: string[], pattern: string = '', key = ''): string[] {
    return list && list.filter(item =>
      Get(item, key).match(pattern)
    );
  }
}