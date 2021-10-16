import {AccountType} from "./AccountType";
import {Currency} from "./Currency";

export interface Account {
  id?: number,
  name: string,
  icon: string,
  startDate: string,
  color: string,
  creditLimit: number,
  startBalance: number,
  accountType: AccountType,
  userId: number,
  currency: Currency
}
