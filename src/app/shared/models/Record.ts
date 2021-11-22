import {Category} from "./Category";
import {Account} from "./Account";

export interface Record {
  id?: number;
  recordDate: string;
  recordType: any;
  amount: number;
  comment?: string;
  account: Account;
  category: Category;
  userId?: number;
}
