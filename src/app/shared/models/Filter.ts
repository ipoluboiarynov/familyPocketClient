import {Account} from "./Account";
import {Category} from "./Category";

export interface Filter {
  id?: number,
  name: string,
  startDate?: string,
  endDate?: string,
  recordType?: string,
  userId?: number,
  accounts?: Account[],
  categories?: Category[]
}
