import { Pipe, PipeTransform } from '@angular/core';
import {Category} from "../models/Category";

@Pipe({
  name: 'filterCategoriesByType'
})
export class FilterCategoriesByTypePipe implements PipeTransform {

  transform(categories: Category[], expenses: boolean): any[] {
    let result: any[] = [];
    if (categories && categories.length > 0) {
      result = expenses ? categories.filter(category => category.expense) :
        categories.filter(category => !category.expense);
    }
    return result;
  }
}
