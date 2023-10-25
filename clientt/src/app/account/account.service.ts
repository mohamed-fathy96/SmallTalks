import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { IUser } from '../shared/models/user';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { IMessage } from '../shared/models/message';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PrivateChatComponent } from '../chat-hall/private-chat/private-chat.component';
import { IBinaryAudio } from '../shared/models/binary.audio';
import { IAudio } from '../shared/models/audio';
import { IImage } from '../shared/models/image';
@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private chatConnection?: HubConnection;
  baseUrl = "https://localhost:7080/api/";
  signalrUrl = "https://localhost:7080/";
  private currentUserSource = new BehaviorSubject<IUser | null>(null);
  currentUser$ = this.currentUserSource.asObservable();
  onlineUsers: string[] = [];
  messages: IMessage[] = [];
  privateMessages: IMessage[] = [];
  privateMessageInitiated = false;
  constructor(private httpService: HttpClient, private router: Router, private modalService: NgbModal) {

  }
  getNumberOfOnlineUsers() {
    return this.onlineUsers.length;
  }
  getCurrentUserValue() {
    return this.currentUserSource.value;
  }
  loadCurrentUser(token: string) {
    let headers = new HttpHeaders();
    headers = headers.set('Authorization', `Bearer ${token}`);

    return this.httpService.get<IUser>(this.baseUrl + 'account', { headers }).pipe(
      map((user: IUser) => {
        if (user) {
          localStorage.setItem('token', user.token);
          this.currentUserSource.next(user);
        }
      })
    );
  }

  login(values: any) {
    return this.httpService.post<IUser>(this.baseUrl + 'account/login', values).pipe(
      map((user: IUser) => {
        if (user) {
          // Check the user's email and assign the role if it matches
          if (user.email === 'ahmedfathymohamed1998@gmail.com') {
            user.role = 'admin';
          } else {
            user.role = 'user'; // Assign a default role for other users
          }

          localStorage.setItem('token', user.token);
          this.currentUserSource.next(user);
        }
      })
    );
  }

  register(values: any) {
    return this.httpService.post<IUser>(this.baseUrl + 'account/register', values).pipe(
      map((user: IUser) => {
        if (user) {
          localStorage.setItem('token', user.token);
          this.currentUserSource.next(user);
        }
      })
    );
  }

  logout() {
    localStorage.removeItem('token');
    this.currentUserSource.next(null);
    this.router.navigateByUrl('/');
  }

  checkEmailExists(email: string) {
    return this.httpService.get(this.baseUrl + 'account/emailexists?email=' + email);
  }

  getAllUserNames(): Observable<string[]> {
    return this.httpService.get<string[]>(this.baseUrl + 'Account/usernames');
  }


  async createChatConnection() {
    this.chatConnection = new HubConnectionBuilder()
      .withUrl(this.signalrUrl + 'hubs/chat', { withCredentials: false })
      .withAutomaticReconnect()
      .build();

    try {
      await this.chatConnection.start();
      console.log('SignalR connection started successfully');

      this.chatConnection.on('UserConnected', async () => {
        const result = await this.asyncAddUserConnectionId();
        console.log(result);
        if (result) {
          console.log('User connection ID added successfully');
        } else {
          console.error('Failed to add user connection ID');
        }
      });


      this.chatConnection.on('OnlineUsers', (onlineUsers: string[]) => {
        this.onlineUsers = onlineUsers;
        console.log('Online users:', this.onlineUsers);
      });

      this.chatConnection.on('NewMessage', (newMessage: IMessage) => {
        this.messages = [...this.messages, newMessage];
      });

      this.chatConnection.on('OpenPrivateChat', (newMessage: IMessage) => {
        this.privateMessages = [...this.privateMessages, newMessage];
        this.privateMessageInitiated = true;
        const modalRef = this.modalService.open(PrivateChatComponent);
        modalRef.componentInstance.toUser = newMessage.from
      });

      this.chatConnection.on('NewPrivateMessage', (newMessage: IMessage) => {
        this.privateMessages = [...this.privateMessages, newMessage];
      });

      this.chatConnection.on('ClosePrivateChat', () => {
        this.privateMessageInitiated = false;
        this.privateMessages = [];
        this.modalService.dismissAll();
      });

      this.chatConnection.on('NewAudio', (newMessage: IMessage) => {

        // Assuming newMessage.content is the Base64-encoded audio

        const base64String = newMessage.content.split(',')[1];

        // Decode the Base64 string

        const decodedData = atob(base64String);

        // Convert the decoded data to Uint8Array

        const byteArray = new Uint8Array(decodedData.length);
        for (let i = 0; i < decodedData.length; i++) {
          byteArray[i] = decodedData.charCodeAt(i);
        }

        console.log(byteArray);

        // Create a Blob from the Uint8Array

        const blob = new Blob([byteArray], { type: 'audio/wav' }); // Adjust the MIME type as per your audio format

        // Create an audio element

        const audioElement = new Audio();

        // Set the audio source to the Blob

        audioElement.src = URL.createObjectURL(blob);
        newMessage.audio = audioElement;

        this.messages = [...this.messages, newMessage];

      });

      this.chatConnection.on('NewImage', (newMessage: IMessage) => {

        // Assuming newMessage.content is the Base64-encoded audio

        const base64String = newMessage.content.split(',')[1];

        // Decode the Base64 string

        const decodedData = atob(base64String);

        // Convert the decoded data to Uint8Array

        const byteArray = new Uint8Array(decodedData.length);
        for (let i = 0; i < decodedData.length; i++) {
          byteArray[i] = decodedData.charCodeAt(i);
        }

        console.log(byteArray);

        // Create a Blob from the Uint8Array

        const blob = new Blob([byteArray], { type: 'image/jpeg' });

        // Create an audio element

        const imageElement = new Image();

        // Set the image source to the Blob

        imageElement.src = URL.createObjectURL(blob);
        newMessage.image = imageElement;

        this.messages = [...this.messages, newMessage];

      });

    } catch (error) {
      console.error('Failed to send audio', error);
    }
  }
  stopChatConnection() {
    this.chatConnection?.stop().catch(error => { console.log(error) });
  }
  async getCurrentUserName() {
    return new Promise<string | null>((resolve, reject) => {
      this.currentUser$.subscribe(user => {
        if (user) {
          resolve(user.displayName);
        } else {
          resolve(null);
        }
      });
    });
  }

  async asyncAddUserConnectionId() {
    const displayName = await this.getCurrentUserName();
    console.log(displayName)
    if (displayName) {
      return this.chatConnection?.invoke('AddUserConnectionId', displayName);
    }
    return null;
  }

  async sendMessage(content: string) {
    const userName = await this.getCurrentUserName();
    const message: IAudio =
    {
      from: userName || null,
      content: content,
      time: new Date()
    }

    return this.chatConnection?.invoke('ReceiveMessage', message).catch(error => console.log(error))
  }

  async sendPrivateMessage(to: string, content: string) {
    const userName = await this.getCurrentUserName();
    const message: IMessage =
    {
      from: userName || null,
      content: content,
      time: new Date(),
      to,

    }
    if (!this.privateMessageInitiated) {
      this.privateMessageInitiated = true;
      return this.chatConnection?.invoke('CreatePrivateChat', message).then(() => {
        this.privateMessages = [...this.privateMessages, message];
        console.log(`privateMessageInitiated: ${this.privateMessageInitiated}`);
        console.log(`Sending message to ${to}:`, message);
      }).catch(error => console.log(error))


    } else {
      return this.chatConnection?.invoke('ReceivePrivateMessage', message).catch(error => console.log(error))
    }


  }

  async closePrivateChatMessage(otherUser: string) {
    const displayName = await this.getCurrentUserName();
    if (displayName) {
      return this.chatConnection?.invoke('RemovePrivateChat', displayName, otherUser);
    }
    return null;

  }

  async sendAudio(content: Blob) {
    const userName = await this.getCurrentUserName();

    const base64String = await this.blobToBase64(content);

    const message: IMessage =
    {
      from: userName || null,
      content: base64String,
      time: new Date()
    }
    console.log(message)
    return this.chatConnection?.invoke('ReceiveAudio', message).catch(error => console.log(error))
  }

  async sendImage(content: Blob) {
    const userName = await this.getCurrentUserName();

    const base64String = await this.blobToBase64(content);

    const message: IImage =
    {
      from: userName || null,
      content: base64String,
      time: new Date()
    }
    console.log(message);
    return this.chatConnection?.invoke('ReceiveImage', message).catch(error => console.log(error))
  }

  blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result && typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to convert Blob to base64.'));
        }
      };
      reader.readAsDataURL(blob);
    });
  }

}
