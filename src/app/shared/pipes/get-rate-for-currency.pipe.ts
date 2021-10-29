import {Pipe, PipeTransform} from '@angular/core';
import {Rates} from "../models/Rates";
import {Currency} from "../models/Currency";

@Pipe({
  name: 'getRateForCurrency'
})
export class GetRateForCurrencyPipe implements PipeTransform {

  transform(currency: Currency, rates: Rates): string {
    let rates_array = Object.entries(rates.rates);
    let found_rate = rates_array.find(rate => rate[0] === currency.name);
    if (found_rate) {
      if (currency.base) {
        return (1 / found_rate[1]).toFixed(4);
      } else {
        return (+found_rate[1]).toFixed(4);
      }
    }
    return '-';
  }
}
