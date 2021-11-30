import {Injectable} from "@angular/core";

@Injectable({
  providedIn: 'root'
})
export class ConvertDateService {
  convertDateToString(date: Date): string {
    // date.setDate(date.getDate() + 1);
    return date.getFullYear() + '-' + ("0" + (date.getMonth() + 1)).slice(-2) + '-' + ("0" + date.getDate()).slice(-2);
  }

  convertStringToDate(date: String): Date {
    const parts = date.split('-');
    return new Date(+parts[0], +parts[1] - 1, +parts[2]);
  }

  convertRangeToString(dateRange: any[] | undefined): any[] {
    if (dateRange) {
      let startDate_str = this.convertDateToString(dateRange[0]);
      let endDate_str = this.convertDateToString(dateRange[1]);
      return [startDate_str, endDate_str];
    }
    return [];
  }

  convertStringToRange(startDate_str: string, endDate_str: string | null): any[] {
    if (startDate_str) {
      let startDate = this.convertStringToDate(startDate_str);
      let endDate = new Date();
      if (endDate_str) {
        endDate = this.convertStringToDate(endDate_str);
      }
      return [startDate, endDate];
    }
    return [];
  }

  convertDaysToString(days: number) {
    let endDate = new Date();
    let date = new Date();
    let startDate = new Date(date.setDate(date.getDate() - days + 1));
    let startDate_str = this.convertDateToString(startDate);
    let endDate_str = this.convertDateToString(endDate);
    return [startDate_str, endDate_str];
  }
  convertDaysToRange(days: number) {
    let endDate = new Date();
    let date = new Date();
    let startDate = new Date(date.setDate(date.getDate() - days + 1));
    return [startDate, endDate];
  }

}
