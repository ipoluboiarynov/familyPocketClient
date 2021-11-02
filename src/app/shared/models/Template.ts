import {Category} from "./Category";
import {Account} from "./Account";

export interface Template {
  id?: number,
  name: string,
  amount?: number,
  recordType?: string,
  category?: Category,
  account?: Account,
  userId?: number
}
