import { Component, OnDestroy, OnInit, TemplateRef } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable, from } from 'rxjs';
import { AccountService } from 'src/app/account/account.service';
import { PrivateChatComponent } from '../private-chat/private-chat.component';
import { RecorderService } from '../recorder.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit, OnDestroy {
  userNames: string[] = [];
  onlineUsers: string[] = this.accountService.onlineUsers;
  currentUserName$!: Observable<string | null>;

  constructor(public accountService: AccountService, private modalService: NgbModal,
    private recorderService: RecorderService) {
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
  sendMessage(content: string) {
    this.accountService.sendMessage(content);

  }

  openPrivateChat(toUser: string) {
    console.log("pchat is opened")
    const modalRef = this.modalService.open(PrivateChatComponent, {
      backdrop: 'static'
    });
    modalRef.componentInstance.toUser = toUser;

  }

  startRecording() {
    this.recorderService.startRecording();
  }

  stopRecording() {
    this.recorderService.stopRecording();
  }

  handleImageInput(event: any) {
    const file: Blob = event.target.files[0];
    console.log(file);
    if (file) {
      this.compressImage(file, 0.8)
      .then((compressedFile: Blob) => {
        console.log('Compressed File:', compressedFile);
        
        // Now you can send the compressed image
        this.accountService.sendImage(compressedFile)
          .then(() => console.log('Image sent'))
          .catch((error) => console.error('Error sending image:', error));
      })
      .catch((error) => console.error('Error compressing image:', error));
    }
  }

  compressImage(file: Blob, quality: number): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
  
          if (!ctx) {
            reject(new Error('Could not create canvas context'));
            return;
          }
  
          canvas.width = img.width;
          canvas.height = img.height;
  
          ctx.drawImage(img, 0, 0, img.width, img.height);
  
          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error('Error creating compressed blob'));
              }
            },
            file.type,
            quality
          );
        };
      };
  
      reader.onerror = (error) => reject(error);
    });
  }

}