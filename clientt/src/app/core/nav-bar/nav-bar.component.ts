import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { AccountService } from 'src/app/account/account.service';
import { IUser } from 'src/app/shared/models/user';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.scss']
})

export class NavBarComponent implements OnInit {
  currentUser$!: Observable<IUser | null>;
  userNames: string[] = [];
  constructor(private accountService: AccountService) {}
 
  ngOnInit(): void {
    this.currentUser$ = this.accountService.currentUser$;
  }

  Logout() {
    this.accountService.logout();
  }

  generateExcelFile() {
    // Fetch user names from your service
    this.accountService.getAllUserNames().subscribe(names => {
      this.userNames = names;

      // Prepare the data for the Excel file
      const data = [['Name']];
      data.push(...this.userNames.map(name => [name]));

      const ws = XLSX.utils.aoa_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

      // Create a Blob and open it in a new window/tab for download
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const objectURL = URL.createObjectURL(blob);
      window.open(objectURL);
    });
  }
}