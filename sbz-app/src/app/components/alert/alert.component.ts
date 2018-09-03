import { Component, OnInit } from '@angular/core';

import { Alert, AlertType } from '../../models/alert';
import { AlertService } from '../../services/alert.service';

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.css']
})
export class AlertComponent implements OnInit {

  alerts: Alert[] = [];

  constructor(private alertService: AlertService ) { }

  ngOnInit() {
    this.alertService.getAlert().subscribe((alert: Alert) => {
      this.alerts = [];
      this.alerts.push(alert);
      setTimeout(() => this.closeAlert(alert), 5000);
    });
  }

  closeAlert(alert: Alert) {
    this.alerts = this.alerts.filter(x => x !== alert);
  }

  setCss(alert: Alert) {
    if (!alert) {
      return;
    }

    switch (alert.type) {
      case AlertType.Success:
        return 'alert alert-success';
      case AlertType.Error:
        return 'alert alert-danger';
      case AlertType.Info:
        return 'alert alert-info';
      case AlertType.Warning:
        return 'alert alert-warning';
    }
  }
}
