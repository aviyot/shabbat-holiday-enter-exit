import { NgIf } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';

interface ShabatEnteExit {
  heb_date:string,
  date:string,
  parasha:string,
  type:string,
  Jerusalem_in:string,
  Jerusalem_out:string,
  TelAviv_in:string
  TelAviv_out:string,
  BeerSheva_in:string,
  BeerSheva_out:string,
  Hayfa_in:string,
  Hayfa_out:string
  navigationPos:0;
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
  allrecords:ShabatEnteExit[];
  futureEventIndex:number;
  eventIndex:number;
  futureEvent:ShabatEnteExit;
  recordSize:number;
  constructor(private http: HttpClient) {}

  ngOnInit() {
    var records: ShabatEnteExit[];
    let REQ_DATA = 'resource_id=cfe1dd76-a7f8-453a-aa42-88e5db30d567&limit=400';
    this.http
      .get(`${this.API}${REQ_DATA}`)
      .subscribe((res: { result: { records: any[] }; success: boolean }) => {
        records = res.result.records;
        this.recordSize = records.length;
        this.dataLoaded = true;
        records.sort((a, b) => {
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        });
        this.futureEventIndex = records
          .findIndex((val) => {
            return new Date(val.date).getTime() > (new Date().getTime()-86400000);
          })
          this.allrecords = records;
          this.eventIndex = this.futureEventIndex;
         this.futureEvent = this.allrecords[this.futureEventIndex];
        //this.records = this.futureRecords.slice(this.pageSize * this.page, this.pageSize * (this.page + 1));;
      });
  }

  goNextEvent() {
    if(this.eventIndex < this.recordSize)
       this.eventIndex++;
    this.futureEvent = this.allrecords[this.eventIndex];
    //this.records = this.futureRecords.slice(this.pageSize * this.page,this.pageSize * (this.page + 1));
  }
  goBackEvent() {
  //  if (this.page) this.page--;
    //this.records = this.futureRecords.slice(this.pageSize * this.page,this.pageSize * (this.page + 1))
    if(this.eventIndex--)
    this.futureEvent = this.allrecords[this.eventIndex];

  }
  goNearEvent(){
this.eventIndex = this.futureEventIndex;
    this.futureEvent = this.allrecords[this.eventIndex];

  }
}
