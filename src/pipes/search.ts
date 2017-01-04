import { Pipe } from '@angular/core';

@Pipe({
  name: 'search'
})
export class SearchPipe {
  transform(list, pattern = '', deepKey = '') {
    if (!list) return;

    return list.filter((item) => {
      const value = deepKey.split('.').reduce((value, key) => {
        return value[key];
      }, item);

      return value.match(pattern);
    });
  }
}