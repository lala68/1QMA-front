import {Component, OnInit, OnDestroy, Output, EventEmitter, Input, NgZone} from '@angular/core';
import {interval, Subscription} from 'rxjs';
import {map, take} from 'rxjs/operators';
import {GeneralService} from "../../services/general/general.service";
import {CommonModule} from "@angular/common";

@Component({
  selector: 'app-countdown-timer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './countdown-timer.component.html',
  styleUrl: './countdown-timer.component.scss'
})

export class CountdownTimerComponent implements OnInit, OnDestroy {
  @Output() countdownFinished: EventEmitter<void> = new EventEmitter();
  @Input() duration: any;
  private countdownDuration: any; // 5 minutes in seconds
  public timeLeft: any;
  private subscription: any;
  timerClass: string = ''; // Initialize with an empty string or normal state


  constructor(private generalService: GeneralService, private ngZone: NgZone) {
  }

  ngOnInit(): void {
    if (!this.duration) {
      this.countdownDuration = this.countdownDuration * 60;
    } else {
      this.countdownDuration = parseInt(this.duration);
    }
    this.startCountdown();
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  startCountdown(): void {
    let startTime: number;
    let pausedTime = 0;
    let lastTimestamp: number;
    const interval = 1000; // Check every second

    const countdown = () => {
      const now = Date.now();
      const elapsedTime = now - startTime - pausedTime;
      const secondsLeft = Math.max(0, this.countdownDuration - Math.floor(elapsedTime / 1000));

      this.ngZone.run(() => {
        this.timeLeft = this.formatTime(secondsLeft);

        // Determine the class based on the time left
        if (secondsLeft <= 10) {
          this.timerClass = 'danger';
        } else if (secondsLeft <= 30) {
          this.timerClass = 'warning';
        } else {
          this.timerClass = ''; // No class for normal state
        }
      });

      if (secondsLeft === 0) {
        this.ngZone.run(() => {
          this.countdownFinished.emit();
        });
      } else {
        lastTimestamp = now;
        setTimeout(countdown, interval);
      }
    };

    // Initialize the start time and begin the countdown
    startTime = Date.now();
    countdown();
  }


  // startCountdown(): void {
  //   let startTime: number;
  //   let pausedTime = 0;
  //   let lastTimestamp: number;
  //   const interval = 1000; // Check every second
  //
  //   const countdown = () => {
  //     const now = Date.now();
  //     const elapsedTime = now - startTime - pausedTime;
  //     const secondsLeft = Math.max(0, this.countdownDuration - Math.floor(elapsedTime / 1000));
  //
  //     this.ngZone.run(() => {
  //       this.timeLeft = this.formatTime(secondsLeft);
  //     });
  //
  //     if (secondsLeft === 0) {
  //       this.ngZone.run(() => {
  //         this.countdownFinished.emit();
  //       });
  //     } else {
  //       lastTimestamp = now;
  //       setTimeout(countdown, interval);
  //     }
  //   };
  //
  //   const handleVisibilityChange = () => {
  //     if (document.visibilityState === 'visible') {
  //       startTime += Date.now() - lastTimestamp;
  //     } else {
  //       lastTimestamp = Date.now();
  //     }
  //   };
  //
  //   document.addEventListener('visibilitychange', handleVisibilityChange);
  //
  //   startTime = Date.now();
  //   lastTimestamp = startTime;
  //   countdown();
  // }


  private formatTime(seconds: number): string {
    const minutes: number = Math.floor(seconds / 60);
    const formattedMinutes: any = minutes.toString().padStart(2, '0');
    const secondsRemaining: number = seconds % 60;
    const formattedSeconds: any = secondsRemaining.toString().padStart(2, '0');
    return `${formattedMinutes} : ${formattedMinutes !== 1 ? '' : ''} ${formattedSeconds} ${formattedSeconds !== 1 ? '' : ''}`;
  }

}
