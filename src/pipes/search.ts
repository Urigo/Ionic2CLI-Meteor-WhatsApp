import * as Get from 'get-value';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'search'
})
export class SearchPipe implements PipeTransform {
  transform(list, pattern = '', key = '') {
    return list && list.filter(item =>
      Get(item, key).match(pattern)
    );
  }
}