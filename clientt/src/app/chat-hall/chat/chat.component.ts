import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable, from } from 'rxjs';
import { AccountService } from 'src/app/account/account.service';
import { PrivateChatComponent } from '../private-chat/private-chat.component';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit, OnDestroy {
  userNames: string[] = [];
  onlineUsers:string[] = this.accountService.onlineUsers;
  currentUserName$!: Observable<string | null>;
  constructor(public accountService: AccountService, private modalService:NgbModal) {
  }
  ngOnDestroy(): void {
    this.accountService.stopChatConnection();
    
  }

  ngOnInit(): void {
    this.getAllNames(); // Call the method when the component is initialized
    this.accountService.createChatConnection();
    this.currentUserName$ = from(this.accountService.getCurrentUserName());
  }

  getAllNames() {
    this.accountService.getAllUserNames().subscribe(
      (response: string[]) => {
        this.userNames = response;
      },
      (error: any) => {
        console.log(error);
      }
    );
  }
  sendMessage(content: string)
  {
    this.accountService.sendMessage(content);

  }

  openPrivateChat(toUser: string)
  {
    console.log("pchat is opened")
    const modalRef = this.modalService.open(PrivateChatComponent, {
      backdrop: 'static'
    });
    modalRef.componentInstance.toUser = toUser;

  }

  
}