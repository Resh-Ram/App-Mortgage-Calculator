import { getCurrencySymbol } from '@angular/common';
import { Component } from '@angular/core';
import {
  ModalDismissReasons,
  NgbDatepickerModule,
  NgbModal,
} from '@ng-bootstrap/ng-bootstrap';
import { Chart, registerables } from 'chart.js';
import { ChangeDetectorRef } from '@angular/core';
import { ChartType } from 'chart.js';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'app-mortgage-calculator';

  TableHeader = ['Category', 'Term', 'Amortization Period'];
  // letiables for payment plan
  loanAmount!: number;
  interestRate!: number;
  monthlyInterestRate!: number;
  loanTerm!: number;
  paymentFrequency!: string;
  periodsInYear!: number;
  compoundPeriod!: number;
  amortizationInMonths!: number;
  term!: string;
  termCalculated!: number;

  //letiables for prepayment plan
  downPayment!: number;
  extraPayment!: number;
  extraPaymentFrequency!: number;

  displayedColumns: string[] = [
    'Period',
    'Principal Payment',
    'Interest Payment',
    'Ending Balance',
  ];
  closeResult = '';

  totalCostOfMortgage!: number;
  totalNumberOfPayments!: number;
  monthlyPayment!: number;
  chart: any = [];
  interestRatePerPayment!: number;
  groups: any = [];
  ChartDataArray: any;
  ChartDataArrayExtra: any;
  InterestPaidforTerm!: number;
  chartDataPie!: any;
  totalInterestOfMortgage: any;

  totalInterestForTerm!: number;
  totalPrincipalForTerm!: number;
  amortizationTable: any = [];
  chartData!: any;
  interestTable: any = [];
  principalTable: any = [];
  labelsForBar: any = [];
  balanceArray: any = [];
  chartDataForPrincipal!: any;

  constructor(private modalService: NgbModal, private changeDef: ChangeDetectorRef) {
    Chart.register(...registerables);
  }

  open(content: any) {
    this.changeDef.detectChanges();
    console.log(content)
    this.modalService
      .open(content, { ariaLabelledBy: 'modal-basic-title' })
      .result.then(
        (result) => {
          console.log(result)
          this.closeResult = `Closed with: ${result}`;
        },
        (reason) => {
          this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
        }
      );
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }


  chartOptions = {
    responsive: true, // THIS WILL MAKE THE CHART RESPONSIVE (VISIBLE IN ANY DEVICE).
  };

  labels = ['Interest Paid', 'Principal Paid'];

  colors = [
    {
    
      backgroundColor: 'rgba(77,83,96,0.2)',
    },
    {
    
      backgroundColor: 'rgba(40, 169, 204, 0.8)',
    },
  ];

  ngOnInit() {
    this.changeDef.detectChanges();
  }

  calculatePayment() {
    this.amortizationInMonths = this.loanTerm * 12;
    switch (this.paymentFrequency) {
      case 'Monthly':
        this.periodsInYear = 12;
        break;
      case 'Semi-Monthly':
        this.periodsInYear = 24;
        break;
      case 'Weekly':
        this.periodsInYear = 52;
        break;
      case 'Bi-Weekly':
        this.periodsInYear = 26;
        break;
      case 'Accelerated Bi-Weekly':
        this.periodsInYear = 26;
        break;
      case 'Accelerated Weekly':
        this.periodsInYear = 52;
        break;
      default:
        this.periodsInYear = 12;
    }

    //calculation of Term

    switch (this.term) {
      case '1 year':
        this.termCalculated = 12;
        break;
      case '2 years':
        this.termCalculated = 24;
        break;
      case '3 years':
        this.termCalculated = 36;
        break;
      case '4 years':
        this.termCalculated = 48;
        break;
      case '5 years':
        this.termCalculated = 60;
        break;
      case '6 years':
        this.termCalculated = 72;
        break;
      case '7 years':
        this.termCalculated = 84;
        break;
      case '8 years':
        this.termCalculated = 96;
        break;
      case '9 years':
        this.termCalculated = 108;
        break;
      case '10 years':
        this.termCalculated = 120;
        break;
      default:
        this.termCalculated = 12;
    }

    this.totalNumberOfPayments =
      (this.periodsInYear * this.amortizationInMonths) / 12;
    this.monthlyInterestRate = +(
      Math.pow(1 + this.interestRate / 100 / 2, 1 / 6) - 1
    ).toFixed(6);
    console.log(this.totalNumberOfPayments);
    this.monthlyPayment =
      this.calculationMethod(
        this.monthlyInterestRate,
        this.amortizationInMonths,
        this.loanAmount
      ) /
      (this.periodsInYear / 12);
    this.totalCostOfMortgage =
    +((this.monthlyPayment * this.amortizationInMonths) /
      (12 / this.periodsInYear)).toFixed(2);

    console.log(this.monthlyPayment, this.totalCostOfMortgage);
    this.totalInterestOfMortgage = this.totalCostOfMortgage - this.loanAmount;

    // calculate Interest Rate for each Payment
    this.interestRatePerPayment = +(
      (Math.pow(1 + this.interestRate / 100 / 2, 1 / 6) - 1) *
      (12 / this.periodsInYear)
    ).toFixed(6);

    //Amortization Schedule

    let balance = this.loanAmount;
    let totalInterestTillNow = 0;
    let totalPrincipalTillNow = 0;
    let interestSavedTillNow = 0;
    let totalCostOfMortgaegMonthly = 0;
    for (let i = 1; i <= this.totalNumberOfPayments; i++) {
      let monthlyInterestPaid = balance * this.interestRatePerPayment;
      let monthlyPrincipalPaid = this.monthlyPayment - monthlyInterestPaid;
      totalCostOfMortgaegMonthly += monthlyInterestPaid + monthlyPrincipalPaid;
    
      totalInterestTillNow += monthlyInterestPaid;
      totalPrincipalTillNow += monthlyPrincipalPaid;
      // if (i && i % 12 === 0) {
      //   monthlyPrincipalPaid += this.extraPayment;
     
      // }
      if (i === this.termCalculated) {
        this.totalInterestForTerm = +totalInterestTillNow.toFixed(2);
        this.totalPrincipalForTerm = +totalPrincipalTillNow.toFixed(2);
      }
      console.log(this.totalInterestForTerm, this.totalPrincipalForTerm);
      balance = balance - monthlyPrincipalPaid;
      if (balance < 0) {
        balance = 0;
      }
      console.log(monthlyInterestPaid, monthlyPrincipalPaid);
      this.amortizationTable.push([
        i,
        monthlyInterestPaid,
        monthlyPrincipalPaid,
        balance,
      ]);
      this.interestTable.push([monthlyInterestPaid]);
      this.principalTable.push([monthlyPrincipalPaid]);
      this.balanceArray.push(balance);
      console.log(this.interestTable, this.principalTable);
      this.labelsForBar.push('Month' + i);

      this.groups.push({
        members: [
          {
            indexArray: i,
            paymentArray: (monthlyInterestPaid + balance).toFixed(2),
            extraPaymentArray: 0,
            interestPaidArray: monthlyInterestPaid.toFixed(2),
            principalArray: monthlyPrincipalPaid.toFixed(2),
            balanceRemainArray: balance.toFixed(2),
          },
        ],
      });
    }

    this.chartDataPie = [
      {
        data: [this.totalInterestOfMortgage, this.loanAmount],
      },
    ];

    //this.labelsForBar.push('Month'+ i);
    this.chartData = [
      {
        label: 'Monthly Interest Paid',
        data: this.principalTable,
      },
      {
        label: 'Monthly Principal Paid',
        data: this.interestTable,
      },
    ];
    this.chartDataForPrincipal = [
      {
        label: 'Principal Payment History',
        data: this.balanceArray,
      },
    ];

    
  }

  //Capsule method
  calculationMethod(I: number, N: number, P: number) {
    console.log(I, N, P);
    let denominator = Math.pow(1 + I, N);
    let MonthlyRate = (I * P * denominator) / (denominator - 1);
    console.log('the monthly payment is ', MonthlyRate);
    return MonthlyRate;
  }
}
