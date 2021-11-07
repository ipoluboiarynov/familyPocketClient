import {Component, OnInit} from '@angular/core';
import {Color, Label, PluginServiceGlobalRegistrationAndOptions, SingleDataSet} from "ng2-charts";
import {ChartDataSets, ChartOptions, ChartType} from "chart.js";
import {Account} from "../../shared/models/Account";
import {AccountService} from "../../shared/services/account.service";
import {ToastrService} from "ngx-toastr";
import {CurrencyService} from "../../shared/services/currency.service";
import {Currency} from "../../shared/models/Currency";
import {RatesService} from "../../shared/services/rates.service";
import {Rates} from "../../shared/models/Rates";

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {

  // green credit limit if 0 - 29%
  // yellow  - 30 -74%
  // red - 75-100%

  // Doughnut
  doughnutChartLabels: Label[] = [];
  doughnutChartData: SingleDataSet = [
    [40, 60]
  ];
  doughnutChartDatasets: ChartDataSets[] = [
    {borderWidth: 0}
  ];
  colors: Color[] = [
    {backgroundColor: ['#31BE00', '#E7E7E7']}
  ];

  doughnutChartType: ChartType = 'doughnut';
  options: ChartOptions = {
    cutoutPercentage: 75,
    tooltips: {enabled: false}
  };

  public doughnutChartPlugins: PluginServiceGlobalRegistrationAndOptions[] = [{
    afterDraw(chart) {
      const ctx = chart.ctx;
      const txt = '15%';
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


  ///////////////////////////////////////////////////////

  accounts: Account[] = [];
  currencies: Currency[] = [];
  rates!: Rates;
  totalBalance: number = 0;



  constructor(private accountService: AccountService,
              private currencyService: CurrencyService,
              private ratesService: RatesService,
              private toast: ToastrService
  ) { }

  ngOnInit(): void {
    this.getAllAccounts();
    // this.getAllCurrencies();
  }

  getAllAccounts() {
    this.accountService.getAll().subscribe(
      accounts => {
      this.accounts = accounts;
      this.accounts.map(value => {
        this.totalBalance += value?.balance?? 0;
      })
    },
      error => {
        this.toast.error(error.error.message ?? 'Accounts are not downloaded.');
      }
    );
  }

  getAllCurrencies() {
    this.currencyService.getAll().subscribe(
      currencies => {
        this.ratesService.getRates().then((rates: Rates) => {
          this.rates = rates;
          console.log(rates)
          this.currencies = currencies;
        });

      },
      error => {
        this.toast.error(error.error.message ?? 'Currencies are not downloaded.');
      });
  }

}
