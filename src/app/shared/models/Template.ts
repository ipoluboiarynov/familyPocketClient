import {Category} from "./Category";
import {Account} from "./Account";

export interface Template {
  id?: number,
  name: string,
  amount?: number,
  recordType?: number,
  category?: Category,
  account?: Account,
  userId?: number
}
