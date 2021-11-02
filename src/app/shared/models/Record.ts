export interface Record {
  id?: number;
  date: string;
  type: any;
  amount: number;
  comment?: string;
  accountId: string;
  categoryId: string;
  userId?: number;
  currencyId: string;
}
