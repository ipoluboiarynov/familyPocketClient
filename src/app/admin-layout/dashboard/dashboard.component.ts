import {Component, OnDestroy, OnInit} from '@angular/core';
import {Color, Label, PluginServiceGlobalRegistrationAndOptions, SingleDataSet} from "ng2-charts";
import {ChartDataSets, ChartOptions, ChartType} from "chart.js";
import {Account} from "../../shared/models/Account";
import {AccountService} from "../../shared/services/account.service";
import {ToastrService} from "ngx-toastr";
import {CurrencyService} from "../../shared/services/currency.service";
import {Currency} from "../../shared/models/Currency";
import {RatesService} from "../../shared/services/rates.service";
import {Rates} from "../../shared/models/Rates";
import {RecordService} from "../../shared/services/record.service";
import {Record} from "../../shared/models/Record";
import {RecordSearchValues} from "../../shared/search/RecordSearchValues";
import {Filter} from "../../shared/models/Filter";
import {PageParams} from "../../shared/search/PageParams";
import {Observable, Subscription} from "rxjs";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {Constants} from "../../shared/global/constants";
import {AccountType} from "../../shared/models/AccountType";
import {AccountTypeService} from "../../shared/services/accountType.service";
import {SharedService} from "../../shared/services/shared.service";
import {ConvertDateService} from "../../shared/services/convertDate.service";
import {EmitData} from "../../shared/models/EmitData";

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit, OnDestroy {
  ///////////////////////////////////////////////////////
  //                 Chart variables                   //
  ///////////////////////////////////////////////////////
  doughnutChartLabels: Label[] = [];
  doughnutChartData: SingleDataSet = [];
  doughnutChartDatasets: ChartDataSets[] = [];
  colors: Color[] = [];
  options: ChartOptions = {
    cutoutPercentage: 75,
    tooltips: {enabled: false}
  };
  doughnutChartType: ChartType = 'doughnut';
  doughnutChartPlugins: PluginServiceGlobalRegistrationAndOptions[] = [];

  ///////////////////////////////////////////////////////
  //                 General variables                 //
  ///////////////////////////////////////////////////////

  accounts: Account[] = [];
  currencies: Currency[] = [];
  rates!: Rates;
  totalBalance: number = 0;
  lastRecords: Record[] = [];
  lastRecordsNumber: number = 3;
  cashFlowPeriods: string[] = ['today', 'this week', 'this month', 'this year'];
  cashFlowPeriod: any = 2;
  closeResult!: string;
  progressBar = {
    incomes: 0,
    expenses: 0,
    total: 0,
    shareOfIncomes: 0,
    shareOfExpenses: 0,
    balance: 0
  };
  formAccount!: FormGroup;
  formCurrency!: FormGroup;
  constants = Constants;
  accountTypes: AccountType[] = [];
  currencyList: string[] = [];
  accountsWithCreditLimits: any[] = [];
  totalCreditBalance: number = 0.00;
  totalCreditLimit: number = 0.00;
  totalCreditUsage: number = 0;

  aSub!: Subscription;
  bSub!: Subscription;
  cSub!: Subscription;
  dSub!: Subscription;
  eSub!: Subscription;
  fSub!: Subscription;
  gSub!: Subscription;


  constructor(private accountService: AccountService,
              private recordService: RecordService,
              private accountTypeService: AccountTypeService,
              private currencyService: CurrencyService,
              private ratesService: RatesService,
              private toast: ToastrService,
              private modalService: NgbModal,
              private sharedService: SharedService,
              private convertDateService: ConvertDateService
  ) {
    sharedService.changeEmitted$.subscribe(result => {
      if (!result.source) {
        return
      }
      if (result.content && result.content === 'onInit') {
        this.ngOnInit();
      }
    });
  }

  ngOnInit(): void {
    this.getAllAccounts();
    this.getAllCurrencies();
    this.getAllAccountTypes();
    this.uploadRates();
    this.getLastRecord(this.lastRecordsNumber);
    this.getCashFlow(this.cashFlowPeriod);
  }

  ngOnDestroy(): void {
    if (this.aSub) {
      this.aSub.unsubscribe();
    }
    if (this.bSub) {
      this.bSub.unsubscribe();
    }
    if (this.cSub) {
      this.cSub.unsubscribe();
    }
    if (this.dSub) {
      this.dSub.unsubscribe();
    }
    if (this.eSub) {
      this.eSub.unsubscribe();
    }
    if (this.fSub) {
      this.fSub.unsubscribe();
    }
    if (this.gSub) {
      this.gSub.unsubscribe();
    }
  }

  setChart(totalCreditUsage: number) {
    this.doughnutChartLabels = [];
    this.doughnutChartData = [[totalCreditUsage, 100 - totalCreditUsage]];
    this.doughnutChartDatasets = [
      {borderWidth: 0}
    ];
    this.colors = [
      {backgroundColor: ['#31BE00', '#E7E7E7']}
    ];
    this.doughnutChartType = 'doughnut';
    this.options = {
      cutoutPercentage: 75,
      tooltips: {enabled: false}
    };
    this.doughnutChartPlugins = [{
      afterDraw(chart) {
        const ctx = chart.ctx;
        let txt = totalCreditUsage + '%';
        // @ts-ignore
        const doubleRadius = chart.innerRadius * 2;
        //Get options from the center object in options
        const sidePadding = 80;
        const sidePaddingCalculated = (sidePadding / 100) * doubleRadius;

        ctx!.textAlign = 'center';
        ctx!.textBaseline = 'middle';
        const centerX = ((chart.chartArea.left + chart.chartArea.right) / 2);
        const centerY = ((chart.chartArea.top + chart.chartArea.bottom) / 2);

        //Get the width of the string and also the width of the element minus 10 to give it 5px side padding
        const stringWidth = ctx!.measureText(txt).width;
        const elementWidth = doubleRadius - sidePaddingCalculated;

        // Find out how much the font can grow in width.
        const widthRatio = elementWidth / stringWidth;
        const newFontSize = Math.floor(30 * widthRatio);
        // Pick a new font size so it will not be larger than the height of label.
        const fontSizeToUse = Math.min(newFontSize, doubleRadius);

        ctx!.font = fontSizeToUse + 'px Arial';
        ctx!.fillStyle = '#31BE00';

        // Draw text in center
        ctx!.fillText(txt, centerX, centerY);
      }
    }];


  }

  compareById(v1: any, v2: any) {
    return v1?.id === v2?.id;
  }

  open(content: any, type: string) {
    switch (type) {
      case 'currency':
        this.startFormCurrency();
        break;
      case 'account':
        this.startFormAccount();
        break;
    }
    this.modalService.open(content, {windowClass: 'modal-mini', size: 'sm', centered: true}).result.then(() => {
      this.closeResult = 'Closed with: $result';
    }, () => {
      this.closeResult = 'Dismissed $this.getDismissReason(reason)';
    });
  }

  getLastRecord(count: number) {
    this.lastRecordsNumber = count;
    let searchValues: RecordSearchValues = {filter: {name: 'unknown'}, pageParams: {pageSize: count, pageNumber: 0}};
    this.aSub = this.recordService.search(searchValues).subscribe(
      pageOfRecords => {
        this.lastRecords = pageOfRecords.content;
      },
      error => {
        this.toast.error('Last Records have NOT been downloaded. ' + error);
      })
  }

  getPeriod(cashFlowPeriod: number): string[] {
    let date = new Date();
    // date.setDate(date.getDate() - 1 );
    let startDate = date;
    let startDate_str = '';
    let endDate_str = '';
    switch (this.cashFlowPeriods[cashFlowPeriod]) {
      case 'today':
        startDate_str = this.convertDateService.convertDateToString(date);
        endDate_str = startDate_str;
        break;
      case 'this week':
        endDate_str = this.convertDateService.convertDateToString(date);
        let daysDone = date.getDay();
        startDate.setDate(date.getDate() - daysDone);
        startDate_str = this.convertDateService.convertDateToString(startDate);
        break;
      case 'this month':
        endDate_str = this.convertDateService.convertDateToString(date);
        startDate.setDate(1);
        startDate_str = this.convertDateService.convertDateToString(startDate);
        break;
      case 'this year':
        endDate_str = this.convertDateService.convertDateToString(date);
        startDate.setDate(1);
        startDate.setMonth(0);
        startDate_str = this.convertDateService.convertDateToString(startDate);
        break;
    }
    return [startDate_str, endDate_str];
  }

  getCashFlow(cashFlowPeriod: number) {
    this.cashFlowPeriod = cashFlowPeriod;
    let period = this.getPeriod(cashFlowPeriod);
    this.bSub = this.getRecordsForPeriod(period[0], period[1]).subscribe(
      pageOfRecords => {
        this.progressBar.incomes = 0;
        this.progressBar.expenses = 0;
        pageOfRecords.content.forEach((record: Record) => {
          let rate = this.currencyService.getRateByName(record.account.currency.name, record.account.currency.base);
          if (!record.account.currency.base) {
            rate = 1 / rate;
          }
          if (record.recordType === 'EXPENSE') {
              this.progressBar.expenses += Math.round(record.amount * rate * 100) / 100;
          }
          if (record.recordType === 'INCOME') {
            this.progressBar.incomes += Math.round(record.amount * rate * 100) / 100;
          }
        });
        this.progressBar.total = this.progressBar.expenses > this.progressBar.incomes ? this.progressBar.expenses : this.progressBar.incomes;
        this.progressBar.shareOfIncomes = (this.progressBar.total > 0) ? Math.round(this.progressBar.incomes * 100 / this.progressBar.total) : 0;
        this.progressBar.shareOfExpenses = (this.progressBar.total > 0) ? Math.round(this.progressBar.expenses * 100 / this.progressBar.total) : 0;
        this.progressBar.balance = this.progressBar.incomes - this.progressBar.expenses;
      },
      error => {
        this.toast.error('Records have NOT been downloaded. ' + error);
      }
    );

  }

  getRecordsForPeriod(startDate: string, endDate: string): Observable<any> {
    let filter: Filter = {name: 'unknown', startDate, endDate};
    let pageParams: PageParams = {pageNumber: 0, pageSize: 100000};
    let searchValues: RecordSearchValues = {filter, pageParams};
    return this.recordService.search(searchValues);
  }

  /////////////////////////////////////////////////////////////////////////////
  //                             Account Operations                          //
  /////////////////////////////////////////////////////////////////////////////

  getAllAccountTypes(): void {
    this.cSub = this.accountTypeService.getAll().subscribe(
      accountTypes => {
        this.accountTypes = accountTypes;
      },
      error => {
        this.toast.error(error.error.message ?? 'Account Types are not downloaded.');
      }
    );
  }

  getAllAccounts() {
    this.dSub = this.accountService.getAll().subscribe(
      accounts => {
        this.accounts = accounts;
        this.accounts.map((account) => {
          let rate = this.currencyService.getRateByName(account.currency.name, account.currency.base);
          if (!account.currency.base) {
            rate = 1 / rate;
          }
          this.totalBalance += account?.balance ? account.balance * rate : 0;
          if (account.creditLimit) {
            this.accountsWithCreditLimits.push(account);
            this.accountsWithCreditLimits[this.accountsWithCreditLimits.length - 1].creditUsage =
              Math.round(account.creditLimit > 0 ? (account.balance ? Math.abs(account.balance) : 0) * 100 / account.creditLimit : 0);
            this.totalCreditBalance += account.balance ? account.balance * rate : 0;
            this.totalCreditLimit += account.creditLimit * rate;
          }
        });
        this.totalCreditBalance = Math.round(this.totalCreditBalance * 100) / 100;
        this.totalCreditLimit = Math.round(this.totalCreditLimit * 100) / 100;
        this.totalCreditUsage = Math.round((Math.abs(this.totalCreditBalance)  * 100 / this.totalCreditLimit) * 100) / 100;
        this.totalBalance = Math.round(this.totalBalance * 100) / 100;
        this.setChart(this.totalCreditUsage);
        let emitData: EmitData = {source: 'dashboard', content: {name: 'accounts', body: {accounts: this.accounts, total: this.totalBalance}}};
        this.sharedService.emitChange(emitData);
      },
      error => {
        this.toast.error(error.error.message ?? 'Accounts are not downloaded.');
      }
    );
  }

  startFormAccount() {
    this.formAccount = new FormGroup({
      accountName: new FormControl('', [Validators.required]),
      accountIcon: new FormControl(null, [Validators.required]),
      accountBalance: new FormControl(0, [Validators.required]),
      accountDate: new FormControl(null, [Validators.required]),
      accountColor: new FormControl('#ffffff', [Validators.required]),
      accountCurrency: new FormControl(null, [Validators.required]),
      accountType: new FormControl(null, [Validators.required]),
      accountLimit: new FormControl(0, [Validators.required])
    });
  }

  addAccount() {
    let account: Account = {
      name: this.formAccount.get('accountName')?.value,
      icon: this.formAccount.get('accountIcon')?.value,
      startBalance: this.formAccount.get('accountBalance')?.value,
      startDate: this.formAccount.get('accountDate')?.value ? this.convertDateService.convertDateToString(this.formAccount.get('accountDate')?.value) :
        this.convertDateService.convertDateToString(new Date()),
      color: this.formAccount.get('accountColor')?.value,
      currency: this.formAccount.get('accountCurrency')?.value,
      accountType: this.formAccount.get('accountType')?.value,
      creditLimit: this.formAccount.get('accountLimit')?.value
    };
    this.formAccount.disable();
    this.eSub = this.accountService.add(account).subscribe(
      () => {
        this.toast.success('New Account was created.');
        this.formAccount.reset();
        this.formAccount.enable();
        this.modalService.dismissAll();
        this.getAllAccounts();
      },
      error => {
        this.formAccount.enable();
        this.toast.error(error.errors.message ?? 'New Account is NOT added! Try again.')
      });
  }

  /////////////////////////////////////////////////////////////////////////////
  //                             Currency Operations                         //
  /////////////////////////////////////////////////////////////////////////////

  getAllCurrencies() {
    this.fSub = this.currencyService.getAll().subscribe(
      currencies => {
        this.sharedService.emitChange(currencies);
        this.ratesService.getRates().then((rates: Rates) => {
          this.rates = rates;
          this.currencies = currencies;
        });

      },
      error => {
        this.toast.error(error.error.message ?? 'Currencies are not downloaded.');
      });
  }

  startFormCurrency() {
    this.formCurrency = new FormGroup({
      currencyName: new FormControl('', [Validators.required]),
      currencyIcon: new FormControl('', [Validators.required]),
      currencyBase: new FormControl(false)
    });
  }

  addCurrency() {
    let currency: Currency = {
      name: this.formCurrency.get('currencyName')?.value,
      icon: this.formCurrency.get('currencyIcon')?.value,
      base: this.formCurrency.get('currencyBase')?.value
    };
    this.formCurrency.disable();
    this.gSub = this.currencyService.add(currency).subscribe(
      () => {
        this.toast.success('New Currency was created.');
        this.formCurrency.reset();
        this.formCurrency.enable();
        this.modalService.dismissAll();
        this.getAllCurrencies();
      },
      error => {
        this.formCurrency.enable();
        this.toast.error(error.errors.message ?? 'New Currency is NOT added! Try again.')
      });
  }

  uploadRates() {
    this.ratesService.getRates().then(
      (rates) => {
        this.rates = rates;
        Object.entries(rates.rates).map(rate => {
          this.currencyList.push(rate[0]);
        });
      });
  }

}
