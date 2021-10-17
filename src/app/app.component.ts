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
    } else {
      this.fetchData();
    }
  }

  loadFromLocal() {
    this.records = JSON.parse(this.ls.getItem('shabatHolidyTime'));
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
    const shareData: ShareData = {
      title: `${this.futureEvent.parasha} ${this.futureEvent.type} ${
        this.futureEvent.heb_date
      } ${this.futureEvent.date.slice(0, 10)}`,
      text: `${this.futureEvent.parasha} ${this.futureEvent.type} ${
        this.futureEvent.heb_date
      } ${this.futureEvent.date.slice(0, 10)}`,
      url: 'https://shabbat-holiday-enter-exit.vercel.app/',
    };
    navigator.share(shareData).then(() => {});
  }
}
