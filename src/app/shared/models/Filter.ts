import {Account} from "./Account";
import {Category} from "./Category";

export interface Filter {
  id?: number,
  name: string,
  startDate?: string,
  endDate?: string | null,
  recordType?: string | null,
  userId?: number,
  accounts?: Account[],
  categories?: Category[]
}
