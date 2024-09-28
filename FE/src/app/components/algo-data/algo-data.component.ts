import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { AlgoDataService } from 'src/app/services/algo-data.service';

@Component({
  selector: 'app-algo-data',
  templateUrl: './algo-data.component.html',
  styleUrls: ['./algo-data.component.css'],
  providers: [DatePipe],
})
export class AlgoDataComponent implements OnInit {
  // Define a model for form data
  tradeData: any = {
    exchange: 'NIFTY',
    expiryDate: '',
    strikePrice: '',
    fromTime: '',
    toTime: '',
  };

  tradeDataArray: any = [];
  expiryCheck = true;

  expiryDates = [''];
  strikePrices = [];
  times: string[] = [
    '',
    '09:00',
    '09:15',
    '09:30',
    '09:45',
    '10:00',
    '10:15',
    '10:30',
    '10:45',
    '11:00',
    '11:15',
    '11:30',
    '11:45',
    '12:00',
    '12:15',
    '12:30',
    '12:45',
    '13:00',
    '13:15',
    '13:30',
    '13:45',
    '14:00',
    '14:15',
    '14:30',
    '14:45',
    '15:00',
    '15:15',
    '15:30',
  ];

  constructor(private algoServ: AlgoDataService, private datePipe: DatePipe) {}

  ngOnInit(): void {
    this.expStrikeList();
  }

  expStrikeList() {
    this.algoServ.getExchangeData(this.tradeData.exchange).subscribe((data: any) => {
      this.tradeData.strikePrice = '';
      this.tradeData.fromTime = '';
      this.tradeData.toTime = '';
      this.expiryDates = data.expiryDates;
      this.expiryDates.unshift('')
      this.strikePrices = data.strikes;
      if (this.expiryDates.length > 0) {
        this.expiryDates.concat(data.expiryDates)
        this.tradeData.expiryDate = this.expiryDates[1];
        this.onSubmit();
      }
    });
  }

  getNearestStrikePrice(input: any): any {
    let higherNumbers = this.strikePrices.filter((num) => num > input);
    return higherNumbers.length ? Math.min(...higherNumbers) : undefined;
  }

  transformDate(date: string): string {
    return this.datePipe.transform(date, 'yyyy-MM-dd') || '';
  }

  onSelectChange(input: any){
    if(input){
      this.onSubmit();
    }
  }

  onSubmit() {
    this.expiryCheck = this.tradeData.strikePrice ? false : true;
    this.algoServ.getNseData(this.tradeData).subscribe((data: any) => {
      this.tradeDataArray = data;
    });
  }
}
