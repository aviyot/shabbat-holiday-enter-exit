import { NgIf } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  title = 'כניסה ויציאה שבת וחג';
  readonly API = 'https://data.gov.il/api/3/action/datastore_search?';
  records: any;
  pageSize: number = 1;
  page: number = 0;
  futureRecords:any;
  currentRecord:any;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    var records: any;
    let REQ_DATA = 'resource_id=cfe1dd76-a7f8-453a-aa42-88e5db30d567&limit=400';
    this.http
      .get(`${this.API}${REQ_DATA}`)
      .subscribe((res: { result: { records: any[] }; success: boolean }) => {
        records = res.result.records;
        records.sort((a, b) => {
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        });
        this.futureRecords = records
          .filter((val) => {
            return new Date(val.date).getTime() > (new Date().getTime()-86400000);
          })
         
        this.records = this.futureRecords.slice(this.pageSize * this.page, this.pageSize * (this.page + 1));;
      });
  }

  goNextEvent() {
    this.page++;
    this.records = this.futureRecords.slice(this.pageSize * this.page,this.pageSize * (this.page + 1));
  }
  goBackEvent() {
    if (this.page) this.page--;
    this.records = this.futureRecords.slice(this.pageSize * this.page,this.pageSize * (this.page + 1))

  }
  goNearEvent(){

  }
}
