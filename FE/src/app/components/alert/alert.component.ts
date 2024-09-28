import { Component, OnInit } from '@angular/core';
import { AlertService } from 'src/app/services/alert.service';

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.css'],
})
export class AlertComponent implements OnInit {
  alertsList: string[] = [];
  selectedIndicator: string = '';
  alertData: any[] = [];
  overAllProfiLoss: any = [];

  constructor(private alertService: AlertService) {}

  ngOnInit(): void {
    this.fetchAlertsList();
  }

  // Fetch alerts list
  fetchAlertsList(): void {
    this.alertService.getAlertsList().subscribe(
      (data) => {
        this.alertsList = data.indicators;
        this.selectedIndicator = this.alertsList[0];
        this.fetchAlerts();
      },
      (error) => {
        console.error('Error fetching alerts list:', error);
      }
    );
  }

  // Fetch alerts data based on selected indicator
  fetchAlerts(): void {
    if (this.selectedIndicator) {
      this.alertService.getAlerts(this.selectedIndicator).subscribe(
        (data) => {
          this.alertData = data.orders;
          this.getProfitLoss()
        },
        (error) => {
          console.error('Error fetching alerts:', error);
        }
      );
    }
  }

  // Method to calculate Profit/Loss between two consecutive rows
  getProfitLoss() {
    this.alertData.forEach((e, index) => {
      if (index % 2 === 1 && this.alertData.length > index - 1) {
        const firstOrderPrice = parseFloat(this.alertData[index - 1].order_price) * (this.alertData[index - 1].order_contracts);
        const secondOrderPrice = parseFloat(this.alertData[index].order_price) * (this.alertData[index].order_contracts);
        this.alertData[index].profite_loss = +(firstOrderPrice - secondOrderPrice)
      }
    });
  }

  getTotalProfitLoss() {
    return this.alertData.reduce((total, order, index) => {
      return total + (index % 2 === 1 ? this.alertData[index].profite_loss : 0);
    }, 0);
  }
}
