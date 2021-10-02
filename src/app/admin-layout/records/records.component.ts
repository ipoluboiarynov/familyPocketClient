import { Component, OnInit } from '@angular/core';
import {Record} from "../../shared/models/Record";

@Component({
  selector: 'app-records',
  templateUrl: './records.component.html'
})
export class RecordsComponent implements OnInit {
  records: Record[] = [
    {type: 'expense', date: '8-10-2021', amount: 34.56, currencyId: '234', accountId: '234', categoryId: '3423', comment: '23', userId: '234', id: '234'},
    {type: 'expense', date: '8-11-2021', amount: 34.56, currencyId: '234', accountId: '234', categoryId: '3423', comment: '23', userId: '234', id: '234'},
    {type: 'expense', date: '8-12-2021', amount: 34.56, currencyId: '234', accountId: '234', categoryId: '3423', comment: '23', userId: '234', id: '234'},
    {type: 'expense', date: '9-10-2021', amount: 34.56, currencyId: '234', accountId: '234', categoryId: '3423', comment: '23', userId: '234', id: '234'},
    {type: 'expense', date: '9-10-2021', amount: 34.56, currencyId: '234', accountId: '234', categoryId: '3423', comment: '23', userId: '234', id: '234'},
    {type: 'expense', date: '9-11-2021', amount: 34.56, currencyId: '234', accountId: '234', categoryId: '3423', comment: '23', userId: '234', id: '234'}
  ];

  constructor() { }

  ngOnInit(): void {
  }

}
