import {Account} from "./Account";
import {Category} from "./Category";

export interface Filter {
  id?: string,
  name: string,
  startDate?: string,
  endDate?: string,
  recordType?: string,
  userId: string,
  accounts?: Account[],
  categories?: Category[]
}
