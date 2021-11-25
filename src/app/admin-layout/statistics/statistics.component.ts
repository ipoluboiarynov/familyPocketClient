import {Component, OnInit} from "@angular/core";
import {Chart, ChartData, ChartOptions} from "chart.js";
import {RecordService} from "../../shared/services/record.service";
import {Record} from "../../shared/models/Record";
import {ToastrService} from "ngx-toastr";
import {AccountService} from "../../shared/services/account.service";
import {RecordSearchValues} from "../../shared/search/RecordSearchValues";
import {Filter} from "../../shared/models/Filter";
import {PageParams} from "../../shared/search/PageParams";
import {Observable} from "rxjs";

export interface ChartDataItem {
  category: string,
  amount: number,
  percent: number,
  color: string
}

export interface BalanceTrend {
  label: string,
  data: number | null
}

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html'
})
export class StatisticsComponent implements OnInit {

  expenses: ChartDataItem[] = [];
  incomes: ChartDataItem[] = [];
  total_incomes: number = 0;
  total_expenses: number = 0;
  colors = {
    gray: {
      100: "#f6f9fc",
      200: "#e9ecef",
      300: "#dee2e6",
      400: "#ced4da",
      500: "#adb5bd",
      600: "#8898aa",
      700: "#525f7f",
      800: "#32325d",
      900: "#212529"
    },
    theme: {
      default: "#172b4d",
      primary: "#5e72e4",
      secondary: "#f4f5f7",
      info: "#11cdef",
      success: "#2dce89",
      danger: "#f5365c",
      warning: "#fb6340"
    },
    black: "#12263F",
    white: "#FFFFFF",
    transparent: "transparent"
  };

  balanceTrend: BalanceTrend[] = [];
  balancePeriods: string[] = ['this month', 'last 30 days', 'this year', 'last year'];
  balancePeriod: number = 0;


  constructor(private recordService: RecordService,
              private toast: ToastrService,
              private accountService: AccountService) {
  }

  ngOnInit() {
    this.getRecords();
    this.parseOptions(Chart, this.chartOptions());
    this.setPeriod(this.balancePeriod);
  }

  getAccounts(startDate: string): Observable<any[]> {
    return this.accountService.getAll(startDate);
  }

  getRecordsOfPeriod(startDate: string, endDate: string): Observable<any> {
    let filter: Filter = {name: 'unknown', startDate, endDate};
    let pageParams: PageParams = {pageNumber: 0, pageSize: 1000};
    let searchValues: RecordSearchValues = {filter, pageParams};
    return this.recordService.search(searchValues);
  }

  async getBalanceTrend(startDate: string, endDate: string) {
    let startDateAsDate = this.convertStringToDate(startDate);
    startDateAsDate.setDate(startDateAsDate.getDate() - 1);
    let previousDate: string = this.convertDateToString(startDateAsDate);

    let startAccounts = await this.getAccounts(previousDate).toPromise();
    let endAccounts = await this.getAccounts(endDate).toPromise();
    let records = await this.getRecordsOfPeriod(startDate, endDate).toPromise();

    if (startAccounts && endAccounts && records) {
      this.balanceTrend = [];
      let startBalance = 0;
      let endBalance = 0;
      startAccounts.forEach(account => {
        startBalance += account.balance ?? 0;
      });
      endAccounts.forEach(account => {
        endBalance += account.balance ?? 0;
      });

      let i = 0;
      let balance = startBalance;
      for (let d = this.convertStringToDate(startDate); d <= this.convertStringToDate(endDate) || i == 30; d.setDate(d.getDate() + 1)) {
        let dayBalance = 0;
        records.content.forEach((record: Record) => {
          let shortDate = record.recordDate.split('T')[0];
          if (shortDate == this.convertDateToString(d)) {
            if (record.recordType === 'INCOME') {
              dayBalance += record.amount;
            } else {
              dayBalance -= record.amount;
            }
          }
        });

        balance += dayBalance;
        let label = (d.getMonth() + 1) + '-' + d.getDate();
        let data: number | null = Math.round(balance * 100) / 100;
        if (d > new Date()) {
          data = null;
        }
        this.balanceTrend.push({label, data});
        i++;
      }
      this.initChartBalanceTrend(this.balanceTrend);
    }
  }

  setPeriod(period: number) {
    this.balancePeriod = period;
    let start = new Date();
    let end = new Date();
    let startDate = '';
    let endDate = '';
    switch (this.balancePeriods[period]) {
      case 'this month':
        start.setDate(1);
        startDate = this.convertDateToString(start);
        end.setMonth(end.getMonth() + 1);
        end.setDate(1);
        end.setDate(end.getDate() - 1);
        endDate = this.convertDateToString(end);
        this.getBalanceTrend(startDate, endDate).then();
        break;
      case 'last 30 days':
        endDate = this.convertDateToString(new Date());
        start.setDate(start.getDate() - 30);
        startDate = this.convertDateToString(start);
        this.getBalanceTrend(startDate, endDate).then();
        break;
      case 'this year':
        start.setDate(1);
        start.setMonth(0);
        startDate = this.convertDateToString(start);
        end.setFullYear(end.getFullYear() + 1);
        end.setMonth(0);
        end.setDate(1);
        end.setDate(end.getDate() - 1);
        endDate = this.convertDateToString(end);
        this.getBalanceTrend(startDate, endDate).then();
        break;
      case 'last year':
        endDate = this.convertDateToString(new Date());
        start.setDate(start.getDate() - 365);
        startDate = this.convertDateToString(start);
        this.getBalanceTrend(startDate, endDate).then();
        break;

    }
  }

  convertDateToString(date: Date): string {
    date.setDate(date.getDate());
    return date.getFullYear() + '-' + ("0" + (date.getMonth() + 1)).slice(-2) + '-' + ("0" + date.getDate()).slice(-2);
  }

  convertStringToDate(date: String): Date {
    const parts = date.split('-');
    return new Date(+parts[0], +parts[1] - 1, +parts[2]);
  }

  getRecords() {
    this.recordService.getAll().subscribe(
      (records: Record[]) => {
        this.total_expenses = 0;
        this.total_incomes = 0;
        records.forEach(record => {
          if (record.recordType == 'EXPENSE') {
            if (this.expenses.length > 0 && this.expenses.some((expense: ChartDataItem) => expense.category === record.category.name)) {
              this.expenses.map((expense: ChartDataItem) => {
                if (expense.category === record.category.name) {
                  expense.amount += record.amount;
                }
              })
            } else {
              this.expenses.push({
                category: record.category.name,
                amount: record.amount,
                percent: 0,
                color: this.generateRandomColor()
              });
            }
            this.total_expenses += record.amount;
          } else {
            if (this.incomes.length > 0 && this.incomes.some((income: ChartDataItem) => income.category === record.category.name)) {
              this.incomes.map((income: ChartDataItem) => {
                if (income.category === record.category.name) {
                  income.amount += record.amount;
                }
              })
            } else {
              this.incomes.push({
                category: record.category.name,
                amount: record.amount,
                percent: 0,
                color: this.generateRandomColor()
              });
            }
            this.total_incomes += record.amount;
          }
        });

        if (this.total_expenses > 0) {
          this.expenses.forEach((expense: ChartDataItem) => {
            expense.percent = Math.round((expense.amount * 100 / this.total_expenses) * 100 / 100);
          });
        }
        if (this.total_incomes > 0) {
          this.incomes.forEach((income: ChartDataItem) => {
            income.percent = Math.round((income.amount * 100 / this.total_incomes) * 100 / 100);
          });
        }
        this.initChartExpenses(this.expenses);
        this.initChartIncomes(this.incomes);
      },
      error => {
        this.toast.error(error.message ?? "Record have not been downloaded.");
      }
    );
  }

  initChartBalanceTrend(balances: BalanceTrend[]) {
    let canvasExists = document.getElementById("chart-balance-trend");
    if (canvasExists) {
      canvasExists.parentNode?.removeChild(canvasExists);
    }
    let parent = document.getElementById('parent-balance-trend');
    let canvas = document.createElement('canvas');
    canvas.classList.add('chart-canvas');
    canvas.id = 'chart-balance-trend';
    parent?.append(canvas);

    const chartBalanceTrend = document.getElementById("chart-balance-trend") as HTMLCanvasElement;
    let labels: string[] = [];
    let values: any[] = [];

    balances.forEach(balance => {
      labels.push(balance.label);
      values.push(balance.data);
    });

    let data = {
      labels,
      datasets: [
        {
          label: "Balance Trend",
          data: values
        }
      ]
    } as ChartData;

    const options = {
      scales: {
        yAxes: [
          {
            gridLines: {
              color: this.colors.gray[200],
              zeroLineColor: this.colors.gray[200]
            },
            ticks: {}
          }
        ]
      }
    } as ChartOptions;

    if (chartBalanceTrend) {
      const salesChart = new Chart(chartBalanceTrend, {
        type: "line",
        data,
        options
      });
    }
  }

  initChartExpenses(expenses: ChartDataItem[]) {
    let canvasExists = document.getElementById("chart-expenses");
    if (canvasExists) {
      canvasExists.parentNode?.removeChild(canvasExists);
    }
    let parent = document.getElementById('parent-expenses');
    let canvas = document.createElement('canvas');
    canvas.classList.add('chart-canvas');
    canvas.id = 'chart-expenses';
    parent?.append(canvas);

    const chartExpenses = document.getElementById("chart-expenses") as HTMLCanvasElement;

    let expensesData: number[] = [];
    let expensesLabel: string[] = [];
    let expensesColors: string[] = [];

    expenses.forEach(expense => {
      expensesLabel.push(expense.category + ' - ' + expense.percent + '%');
      expensesData.push(expense.amount);
      expensesColors.push(expense.color)
    });

    let data = {
      labels: expensesLabel,
      datasets: [
        {
          data: expensesData,
          backgroundColor: expensesColors,
          label: "Expenses"
        }
      ]
    } as ChartData;

    const options = {
      responsive: true,
      legend: {
        position: "top"
      },
      animation: {
        animateScale: true,
        animateRotate: true
      }
    } as ChartOptions;

    if (chartExpenses) {
      const pieChart = new Chart(chartExpenses, {
        type: "pie",
        data,
        options
      });
    }
  }

  initChartIncomes(incomes: ChartDataItem[]) {
    let canvasExists = document.getElementById("chart-incomes");
    if (canvasExists) {
      canvasExists.parentNode?.removeChild(canvasExists);
    }
    let parent = document.getElementById('parent-incomes');
    let canvas = document.createElement('canvas');
    canvas.classList.add('chart-canvas');
    canvas.id = 'chart-incomes';
    parent?.append(canvas);

    const chartIncomes = document.getElementById("chart-incomes") as HTMLCanvasElement;

    let incomesData: number[] = [];
    let incomesLabel: string[] = [];
    let incomesColors: string[] = [];

    incomes.forEach(income => {
      incomesLabel.push(income.category + ' - ' + income.percent + '%');
      incomesData.push(income.amount);
      incomesColors.push(income.color)
    });

    let data = {
      labels: incomesLabel,
      datasets: [
        {
          data: incomesData,
          backgroundColor: incomesColors,
          label: "Incomes"
        }
      ]
    } as ChartData;

    const options = {
      responsive: true,
      legend: {
        position: "top"
      },
      animation: {
        animateScale: true,
        animateRotate: true
      }
    } as ChartOptions;

    if (chartIncomes) {
      const pieChart = new Chart(chartIncomes, {
        type: "pie",
        data,
        options
      });
    }
  }

  chartOptions() {
    return {
      defaults: {
        global: {
          responsive: true,
          maintainAspectRatio: false,
          defaultColor: this.colors.gray[600],
          defaultFontColor: this.colors.gray[600],
          defaultFontFamily: "Open Sans",
          defaultFontSize: 13,
          layout: {
            padding: 0
          },
          legend: {
            display: false,
            position: "bottom",
            labels: {
              usePointStyle: true,
              padding: 16
            }
          },
          elements: {
            point: {
              radius: 0,
              backgroundColor: this.colors.theme["primary"]
            },
            line: {
              tension: 0.4,
              borderWidth: 4,
              borderColor: this.colors.theme["primary"],
              backgroundColor: this.colors.transparent,
              borderCapStyle: "rounded"
            },
            rectangle: {
              backgroundColor: this.colors.theme["warning"]
            },
            arc: {
              backgroundColor: this.colors.theme["primary"],
              borderColor: this.colors.white,
              borderWidth: 4
            }
          },
          tooltips: {
            enabled: true,
            mode: "index",
            intersect: false
          }
        }
      }
    };
  }

  parseOptions(parent: any, options: any) {
    for (let item in options) {
      if (typeof options[item] !== "object") {
        parent[item] = options[item];
      } else {
        this.parseOptions(parent[item], options[item]);
      }
    }
  };

  generateRandomColor() {
    return '#' + (Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0');
  }

}
