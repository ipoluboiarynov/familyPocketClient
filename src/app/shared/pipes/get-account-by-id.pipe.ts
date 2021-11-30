import { Pipe, PipeTransform } from '@angular/core';
import {Record} from "../models/Record";

@Pipe({
  name: 'getAccountById'
})
export class GetAccountByIdPipe implements PipeTransform {

  transform(id: string | undefined, records: Record[]): string {
    if (id) {
      let record =  records.find(record => {
        return record.id == +id;
      });
      return record ? record.account.name : '';
    }
    return '';
  }

}
