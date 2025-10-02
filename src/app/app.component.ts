import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';

interface ShabatEnteExit {
  heb_date: string;
  date: string;
  parasha: string;
  type: string;
  Jerusalem_in: string;
  Jerusalem_out: string;
  TelAviv_in: string;
  TelAviv_out: string;
  BeerSheva_in: string;
  BeerSheva_out: string;
  Hayfa_in: string;
  Hayfa_out: string;
  navigationPos: 0;
}
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  title = 'כניסת ויציאת שבת וחג';
  readonly API = 'https://data.gov.il/api/3/action/datastore_search?';
  dataLoaded = false;
  allrecords: ShabatEnteExit[];
  futureEventIndex: number;
  eventIndex: number;
  futureEvent: ShabatEnteExit;
  recordSize: number;
  records: ShabatEnteExit[];
  REQ_DATA = 'resource_id=cfe1dd76-a7f8-453a-aa42-88e5db30d567&limit=400';
  fromLocal = false;
  updateDate: Date;
  ls;
  eventPosition: number;

  constructor(private http: HttpClient) {
    this.ls = window.localStorage;
  }

  ngOnInit() {
    if (this.ls && this.ls.getItem('shabatHolidyTime')) {
      this.loadFromLocal();
      this.checkForUpdatesInBackground();
    } else {
      this.fetchData();
    }
  }

  loadFromLocal() {
    this.records = JSON.parse(this.ls.getItem('shabatHolidyTime'));
    const lastUpdateStr = this.ls.getItem('shabatHolidyTime_lastUpdate');
    if (lastUpdateStr) {
      this.updateDate = new Date(lastUpdateStr);
    }

    if (this.records) {
      this.recordSize = this.records.length;
      this.futureEventIndex = this.records.findIndex((val) => {
        return new Date(val.date).getTime() > new Date().getTime() - 86400000;
      });
      this.allrecords = this.records;
      this.eventIndex = this.futureEventIndex;
      this.eventPosition = this.futureEventIndex - this.eventIndex;
      this.futureEvent = { ...this.allrecords[this.futureEventIndex] };
      this.dataLoaded = true;
      this.fromLocal = true;
    }
  }

  fetchData() {
    this.http
      .get(`${this.API}${this.REQ_DATA}`)
      .subscribe((res: { result: { records: any[] }; success: boolean }) => {
        this.fromLocal = false;
        this.updateDate = new Date();
        this.records = res.result.records;
        this.recordSize = this.records.length;
        this.dataLoaded = true;
        this.records.sort((a, b) => {
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        });

        if (this.ls && this.records.length) {
          this.ls.setItem('shabatHolidyTime', JSON.stringify(this.records));
          this.ls.setItem(
            'shabatHolidyTime_lastUpdate',
            new Date().toISOString()
          );
        }

        this.futureEventIndex = this.records.findIndex((val) => {
          return new Date(val.date).getTime() > new Date().getTime() - 86400000;
        });
        this.allrecords = this.records;
        this.eventIndex = this.futureEventIndex;
        this.eventPosition = this.futureEventIndex - this.eventIndex;
        this.futureEvent = this.allrecords[this.futureEventIndex];
        //this.records = this.futureRecords.slice(this.pageSize * this.page, this.pageSize * (this.page + 1));;
      });
  }
  manualFetch() {
    this.fetchData();
  }

  checkForUpdatesInBackground() {
    // Check if we should update (older than 7 days or no update date)
    const shouldUpdate =
      !this.updateDate ||
      new Date().getTime() - this.updateDate.getTime() >
        7 * 24 * 60 * 60 * 1000;

    if (shouldUpdate) {
      this.fetchDataInBackground();
    }
  }

  fetchDataInBackground() {
    this.http.get(`${this.API}${this.REQ_DATA}`).subscribe(
      (res: { result: { records: any[] }; success: boolean }) => {
        const newRecords = res.result.records;

        // Sort new records
        newRecords.sort((a, b) => {
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        });

        // Check if data has changed
        const dataChanged =
          !this.records ||
          newRecords.length !== this.records.length ||
          JSON.stringify(newRecords) !== JSON.stringify(this.records);

        if (dataChanged && this.ls) {
          // Update stored data
          this.ls.setItem('shabatHolidyTime', JSON.stringify(newRecords));
          this.ls.setItem(
            'shabatHolidyTime_lastUpdate',
            new Date().toISOString()
          );

          // Update current data
          this.records = newRecords;
          this.recordSize = this.records.length;
          this.allrecords = this.records;
          this.updateDate = new Date();

          // Recalculate future event index
          const oldEventIndex = this.eventIndex;
          this.futureEventIndex = this.records.findIndex((val) => {
            return (
              new Date(val.date).getTime() > new Date().getTime() - 86400000
            );
          });

          // Keep current position relative to new future event
          const relativePosition = oldEventIndex - (this.eventIndex || 0);
          this.eventIndex = this.futureEventIndex + relativePosition;
          this.eventPosition = this.eventIndex - this.futureEventIndex;

          // Update current event
          if (this.eventIndex >= 0 && this.eventIndex < this.records.length) {
            this.futureEvent = this.allrecords[this.eventIndex];
          } else {
            this.eventIndex = this.futureEventIndex;
            this.futureEvent = this.allrecords[this.futureEventIndex];
            this.eventPosition = 0;
          }

          this.fromLocal = false;
        }
      },
      (error) => {
        console.log('Background update failed:', error);
      }
    );
  }
  goNextEvent() {
    if (this.eventIndex < this.recordSize) this.eventIndex++;
    this.futureEvent = this.allrecords[this.eventIndex];
    this.eventPosition = this.eventIndex - this.futureEventIndex;
    //this.records = this.futureRecords.slice(this.pageSize * this.page,this.pageSize * (this.page + 1));
  }
  goBackEvent() {
    //  if (this.page) this.page--;
    //this.records = this.futureRecords.slice(this.pageSize * this.page,this.pageSize * (this.page + 1))

    if (this.eventIndex--) this.futureEvent = this.allrecords[this.eventIndex];
    this.eventPosition = this.eventIndex - this.futureEventIndex;
  }
  goNearEvent() {
    this.eventIndex = this.futureEventIndex;
    this.futureEvent = this.allrecords[this.eventIndex];
    this.eventPosition = this.eventIndex - this.futureEventIndex;
  }
  share() {
    let type = this.futureEvent.type;
    if (type === 'חג') type = '';
    const message = `
${type} ${this.futureEvent.parasha}
${this.futureEvent.heb_date}  
${this.futureEvent.date.slice(0, 10)}
-------------------
כניסה יציאה
ירושלים  ${this.futureEvent.Jerusalem_in.slice(
      0,
      5
    )} ${this.futureEvent.Jerusalem_out.slice(0, 5)}
תל אביב  ${this.futureEvent.TelAviv_in.slice(
      0,
      5
    )} ${this.futureEvent.TelAviv_out.slice(0, 5)}
באר שבע  ${this.futureEvent.BeerSheva_in.slice(
      0,
      5
    )} ${this.futureEvent.BeerSheva_out.slice(0, 5)}
חיפה  ${this.futureEvent.Hayfa_in.slice(
      0,
      5
    )} ${this.futureEvent.Hayfa_out.slice(0, 5)}
    `;
    console.log(message);
    const shareData: ShareData = {
      title: `זמני כניסה ויצאת שבתות וחגים`,
      text: message,
      url: 'https://shabbat-holiday-enter-exit.vercel.app/',
    };
    navigator.share(shareData).then(() => {});
  }
}
