export class SecurityAuditLogger {
  constructor() {
    this.records = [];
  }

  log(event) {
    this.records.push({ ...event, timestamp: event.timestamp ?? Date.now() });
  }
}
