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
  countdownTimeout: any; // To track the timeout reference


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
    let lastTimestamp: number | null = null;
    const interval = 1000; // Check every second

    const countdown = () => {
      const now = Date.now();
      const elapsedTime = now - startTime - pausedTime;

      // Ensure countdownDuration is valid
      if (typeof this.countdownDuration !== 'number' || isNaN(this.countdownDuration)) {
        console.error('Invalid countdown duration');
        return;
      }

      const secondsLeft = Math.max(0, this.countdownDuration - Math.floor(elapsedTime / 1000));

      this.ngZone.run(() => {
        this.timeLeft = this.formatTime(secondsLeft);

        // Update the timer class based on time left
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
        this.countdownTimeout = setTimeout(countdown, interval); // Track the timeout reference
      }
    };

    // Initialize the start time and begin the countdown
    startTime = Date.now();
    pausedTime = 0; // Reset pausedTime
    countdown();
  }


  private formatTime(seconds: number): string {
    const minutes: number = Math.floor(seconds / 60);
    const formattedMinutes: any = minutes.toString().padStart(2, '0');
    const secondsRemaining: number = seconds % 60;
    const formattedSeconds: any = secondsRemaining.toString().padStart(2, '0');
    return `${formattedMinutes} : ${formattedMinutes !== 1 ? '' : ''} ${formattedSeconds} ${formattedSeconds !== 1 ? '' : ''}`;
  }

  resetTimer(): void {
    // Fetch new duration from the service, or use the current value
    const newDuration = this.generalService.gameStep == 2 ? this.generalService.gameInit?.eachStepDurationSeconds :
      this.generalService.gameStep == 3 ? this.generalService.gameInit?.rateAnswersDurationSeconds : this.generalService.gameInit?.rateQuestionsDurationSeconds;

    // Check if the new duration is valid
    if (newDuration) {
      this.countdownDuration = parseInt(newDuration, 10); // Parse as integer
    } else {
      // If no new duration, fall back to the existing countdown duration
      this.countdownDuration = this.countdownDuration || 60; // Default to 60 if no duration
    }

    // Clear the previous countdown and reset the state
    this.clearCountdown();

    // Restart the countdown with the new duration
    this.startCountdown();
  }


  clearCountdown(): void {
    if (this.countdownTimeout) {
      clearTimeout(this.countdownTimeout); // Clear the previous timeout
      this.countdownTimeout = null; // Reset the reference
    }
  }

}
