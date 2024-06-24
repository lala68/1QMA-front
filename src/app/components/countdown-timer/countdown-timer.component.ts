import {Component, OnInit, OnDestroy, Output, EventEmitter} from '@angular/core';
import {interval, Subscription} from 'rxjs';
import {map, take} from 'rxjs/operators';
import {GeneralService} from "../../services/general/general.service";

@Component({
  selector: 'app-countdown-timer',
  standalone: true,
  imports: [],
  templateUrl: './countdown-timer.component.html',
  styleUrl: './countdown-timer.component.scss'
})

export class CountdownTimerComponent implements OnInit, OnDestroy {
  private countdownDuration = this.generalService?.initData?.nextVerificationMinutes * 60; // 5 minutes in seconds
  public timeLeft: any;
  private subscription: any;
  @Output() countdownFinished: EventEmitter<void> = new EventEmitter();

  constructor(private generalService: GeneralService) {
  }

  ngOnInit(): void {
    this.startCountdown();
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  startCountdown(): void {
    const countdown$ = interval(1000).pipe(
      take(this.countdownDuration + 1),
      map(secondsElapsed => this.countdownDuration - secondsElapsed)
    );

    this.subscription = countdown$.subscribe(secondsLeft => {
      this.timeLeft = this.formatTime(secondsLeft);
      if (secondsLeft === 0) {
        this.countdownFinished.emit();
      }
    });
  }

  private formatTime(seconds: number): string {
    const minutes: number = Math.floor(seconds / 60);
    const formattedMinutes: any = minutes.toString().padStart(2, '0');
    const secondsRemaining: number = seconds % 60;
    const formattedSeconds: any = secondsRemaining.toString().padStart(2, '0');
    return `${formattedMinutes} : ${formattedMinutes !== 1 ? '' : ''} ${formattedSeconds} ${formattedSeconds !== 1 ? '' : ''}`;
  }

}