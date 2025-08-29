export class AlertService {
  constructor() {
    this.alerts = new Map();
  }

  async createAlert(alertData) {
    const id = Date.now().toString();
    const alert = {
      id,
      ...alertData,
      created: Date.now(),
      triggered: false
    };
    
    this.alerts.set(id, alert);
    return alert;
  }

  async checkAlerts(priceData) {
    for (const [id, alert] of this.alerts) {
      if (alert.triggered || alert.symbol !== priceData.symbol) continue;

      const currentPrice = priceData.averagePrice;
      let shouldTrigger = false;

      switch (alert.condition) {
        case 'above':
          shouldTrigger = currentPrice > alert.targetPrice;
          break;
        case 'below':
          shouldTrigger = currentPrice < alert.targetPrice;
          break;
        case 'change':
          shouldTrigger = Math.abs(priceData.change24h) > alert.changePercent;
          break;
      }

      if (shouldTrigger) {
        alert.triggered = true;
        alert.triggeredAt = Date.now();
        // In a real implementation, send notification here
        console.log(`Alert triggered: ${alert.message}`);
      }
    }
  }

  getAlerts() {
    return Array.from(this.alerts.values());
  }

  deleteAlert(id) {
    return this.alerts.delete(id);
  }
}