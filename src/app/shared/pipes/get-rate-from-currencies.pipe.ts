import { Pipe, PipeTransform } from '@angular/core';
import {Currency} from "../models/Currency";
import {Rates} from "../models/Rates";

@Pipe({
  name: 'getRateFromCurrencies'
})
export class GetRateFromCurrenciesPipe implements PipeTransform {

  transform(currencies: Currency[], rates: Rates): string {
    let rates_array = Object.entries(rates.rates);

    let rateFrom_arr = rates_array.find(rate => rate[0] === currencies[0].name);
    let rateFrom = (rateFrom_arr) ? rateFrom_arr[1] : null;

    let rateTo_arr = rates_array.find(rate => rate[0] === currencies[1].name);
    let rateTo = (rateTo_arr) ? rateTo_arr[1] : null;

    if (rateFrom && rateTo) {
      return (+rateTo / +rateFrom).toFixed(2);
    }
    return '-';
  }

}
