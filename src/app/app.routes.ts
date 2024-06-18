import { Routes } from '@angular/router';
import { WhiteboardComponent } from './whiteboard/whiteboard.component';

export const routes: Routes = [{ path: '', redirectTo: '/whiteboard', pathMatch: 'full' },
{ path: 'whiteboard', component: WhiteboardComponent },];
