import { CommonModule } from '@angular/common';
import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Socket, SocketIoConfig,SocketIoModule } from 'ngx-socket-io';


@Component({
  selector: 'app-whiteboard',
  standalone: true,
  imports: [CommonModule,SocketIoModule],
  templateUrl: './whiteboard.component.html',
  styleUrls: ['./whiteboard.component.css']
})
export class WhiteboardComponent implements AfterViewInit {
  @ViewChild('canvas', { static: true }) canvas: ElementRef<HTMLCanvasElement>;
  private ctx: CanvasRenderingContext2D;
  private drawing = false;
  private startX: number;
  private startY: number;
  private shape: string = 'rectangle';
  private color: string = '#000000';
  private lineWidth: number = 2;
  private config: SocketIoConfig = { url: 'http://localhost:8800'};
  private socket:Socket;
  constructor() {
    this.socket= new Socket(this.config)
  }

  ngAfterViewInit() {
    this.ctx = this.canvas.nativeElement.getContext('2d');
    this.canvas.nativeElement.width = window.innerWidth - 20;
    this.canvas.nativeElement.height = window.innerHeight - 100;

    this.canvas.nativeElement.addEventListener('mousedown', (e) => this.startDrawing(e));
    this.canvas.nativeElement.addEventListener('mousemove', (e) => this.draw(e));
    this.canvas.nativeElement.addEventListener('mouseup', () => this.stopDrawing());
    this.canvas.nativeElement.addEventListener('mouseout', () => this.stopDrawing());

    this.socket.fromEvent('message').subscribe((data: any) => this.onDrawingEvent(data));
  }

  setShape(shape: string) {
    this.shape = shape;
  }

  setColor(color: string) {
    this.color = color;
  }

  setLineWidth(lineWidth: number) {
    this.lineWidth = lineWidth;
  }

  startDrawing(event: MouseEvent) {
    this.drawing = true;
    this.startX = event.offsetX;
    this.startY = event.offsetY;
  }

  draw(event: MouseEvent) {
    if (!this.drawing) return;

    const currentX = event.offsetX;
    const currentY = event.offsetY;

    const drawingEvent = {
      shape: this.shape,
      startX: this.startX,
      startY: this.startY,
      currentX,
      currentY,
      color: this.color,
      lineWidth: this.lineWidth
    };

    this.socket.emit('message', drawingEvent);

    this.drawOnCanvas(drawingEvent);
  }

  stopDrawing() {
    if (!this.drawing) return;
    this.drawing = false;
    this.ctx.closePath();
  }

  drawOnCanvas({ shape, startX, startY, currentX, currentY, color, lineWidth }) {
    this.ctx.clearRect(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);

    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = lineWidth;
    this.ctx.beginPath();
    switch (shape) {
      case 'rectangle':
        this.ctx.rect(startX, startY, currentX - startX, currentY - startY);
        break;
      case 'circle':
        const radius = Math.sqrt(Math.pow(currentX - startX, 2) + Math.pow(currentY - startY, 2));
        this.ctx.arc(startX, startY, radius, 0, 2 * Math.PI);
        break;
      case 'line':
        this.ctx.moveTo(startX, startY);
        this.ctx.lineTo(currentX, currentY);
        break;
    }
    this.ctx.stroke();
  }

  onDrawingEvent(event) {
    this.drawOnCanvas(event);
  }
}
