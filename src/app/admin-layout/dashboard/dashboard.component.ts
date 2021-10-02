import {Component, OnInit} from '@angular/core';
import {Color, Label, PluginServiceGlobalRegistrationAndOptions, SingleDataSet} from "ng2-charts";
import {ChartDataSets, ChartOptions, ChartType} from "chart.js";

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




  constructor() { }

  ngOnInit(): void {
  }

}
