import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AccountService } from 'src/app/account/account.service';

@Component({
  selector: 'app-private-chat',
  templateUrl: './private-chat.component.html',
  styleUrls: ['./private-chat.component.scss']
})
export class PrivateChatComponent implements OnInit, OnDestroy {
  @Input() toUser = '';
  private lastMessageSent = 0;
  private noResponseTimer: any;
  private noResponseThreshold = 60000; // 1 minute

  constructor(public activeModal: NgbActiveModal, public accountService: AccountService) {}

  ngOnDestroy(): void {
    this.accountService.closePrivateChatMessage(this.toUser);
    this.clearNoResponseTimer();
  }

  ngOnInit(): void {}

  sendMessage(content: any) {
    if (this.lastMessageSent === 0) {
      // Start the timer only if it's the first message
      this.startNoResponseTimer();
    }
    this.resetNoResponseTimer();
    this.lastMessageSent = Date.now();

    this.accountService.sendPrivateMessage(this.toUser, content);
  }

  private startNoResponseTimer() {
    this.noResponseTimer = setInterval(() => {
      const currentTime = Date.now();
      if (currentTime - this.lastMessageSent >= this.noResponseThreshold) {
        // No response from the recipient, close the chat
        this.activeModal.dismiss('Chat closed due to no response');
      }
    }, 1000); // Check every second
  }

  private resetNoResponseTimer() {
    this.clearNoResponseTimer();
  }

  private clearNoResponseTimer() {
    if (this.noResponseTimer) {
      clearInterval(this.noResponseTimer);
    }
  }
}