import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home/home.component';
import { ChatComponent } from './chat-hall/chat/chat.component';
import { DashBoardComponent } from './core/dash-board/dash-board.component';

const routes: Routes = 
[
  {path:'account', loadChildren:()=> import('./account/account.module').then(mod => mod.AccountModule)},
  { path: '', redirectTo: 'home', pathMatch: 'full' }, 
  { path: 'home', component: HomeComponent },
  { path: 'chat', component: ChatComponent },
  { path: 'dashboard', component: DashBoardComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
