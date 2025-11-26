// TimeManager - Handles time progression, schedule checking, and time-based events

export interface TimeSlot {
  start: string;
  end: string;
  type: 'morning' | 'class' | 'lunch' | 'afternoon' | 'afterschool' | 'evening' | 'night';
}

export const SCHEDULE: TimeSlot[] = [
  { start: '06:00', end: '07:59', type: 'morning' },
  { start: '08:00', end: '11:59', type: 'class' },
  { start: '12:00', end: '12:59', type: 'lunch' },
  { start: '13:00', end: '15:59', type: 'afternoon' },
  { start: '16:00', end: '17:59', type: 'afterschool' },
  { start: '18:00', end: '20:59', type: 'evening' },
  { start: '21:00', end: '05:59', type: 'night' },
];

class TimeManager {
  private currentTime: string = '08:00';

  setTime(time: string): void {
    this.currentTime = time;
  }

  getTime(): string {
    return this.currentTime;
  }

  // Parse time string to minutes for calculations
  private parseTime(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  // Format minutes back to time string
  private formatTime(totalMinutes: number): string {
    const normalizedMinutes = ((totalMinutes % 1440) + 1440) % 1440; // Handle wrap-around
    const hours = Math.floor(normalizedMinutes / 60);
    const minutes = normalizedMinutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  }

  // Advance time by given minutes
  advanceTime(minutes: number): string {
    const currentMinutes = this.parseTime(this.currentTime);
    const newMinutes = currentMinutes + minutes;
    this.currentTime = this.formatTime(newMinutes);
    return this.currentTime;
  }

  // Get current time slot type
  getCurrentTimeSlot(): TimeSlot | null {
    const currentMinutes = this.parseTime(this.currentTime);
    
    for (const slot of SCHEDULE) {
      const startMinutes = this.parseTime(slot.start);
      let endMinutes = this.parseTime(slot.end);
      
      // Handle overnight slots
      if (slot.type === 'night') {
        if (currentMinutes >= startMinutes || currentMinutes <= endMinutes) {
          return slot;
        }
      } else if (currentMinutes >= startMinutes && currentMinutes <= endMinutes) {
        return slot;
      }
    }
    
    return null;
  }

  // Check if it's a specific time period
  isMorning(): boolean {
    return this.getCurrentTimeSlot()?.type === 'morning';
  }

  isClassTime(): boolean {
    const slot = this.getCurrentTimeSlot();
    return slot?.type === 'class' || slot?.type === 'afternoon';
  }

  isLunchTime(): boolean {
    return this.getCurrentTimeSlot()?.type === 'lunch';
  }

  isAfterSchool(): boolean {
    return this.getCurrentTimeSlot()?.type === 'afterschool';
  }

  isEvening(): boolean {
    return this.getCurrentTimeSlot()?.type === 'evening';
  }

  isNightTime(): boolean {
    return this.getCurrentTimeSlot()?.type === 'night';
  }

  // Check if player can perform night actions (requires mask unlocking)
  canExploreNight(unlockedNightZones: boolean): boolean {
    return this.isNightTime() && unlockedNightZones;
  }

  // Get remaining time until next period
  getTimeUntilNextPeriod(): number {
    const currentSlot = this.getCurrentTimeSlot();
    if (!currentSlot) return 0;

    const currentMinutes = this.parseTime(this.currentTime);
    const endMinutes = this.parseTime(currentSlot.end);

    if (currentSlot.type === 'night' && currentMinutes > endMinutes) {
      // Night wraps around, calculate to 6:00
      return (24 * 60 - currentMinutes) + this.parseTime('06:00');
    }

    return endMinutes - currentMinutes + 1;
  }

  // Check if an action can be completed in current time slot
  canCompleteAction(actionDuration: number): boolean {
    return this.getTimeUntilNextPeriod() >= actionDuration;
  }

  // Get display string for current time
  getDisplayTime(): string {
    const [hours, minutes] = this.currentTime.split(':').map(Number);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${String(minutes).padStart(2, '0')} ${ampm}`;
  }

  // Get period label
  getPeriodLabel(): string {
    const slot = this.getCurrentTimeSlot();
    const labels: Record<string, string> = {
      morning: 'Early Morning',
      class: 'Class Time',
      lunch: 'Lunch Break',
      afternoon: 'Afternoon Classes',
      afterschool: 'After School',
      evening: 'Evening',
      night: 'Night',
    };
    return labels[slot?.type ?? 'morning'] ?? 'Unknown';
  }

  // Check if a new day has started
  isNewDay(previousTime: string): boolean {
    const prevMinutes = this.parseTime(previousTime);
    const currentMinutes = this.parseTime(this.currentTime);
    return currentMinutes < prevMinutes;
  }

  // Reset to morning
  resetToMorning(): void {
    this.currentTime = '08:00';
  }
}

export const timeManager = new TimeManager();
export default timeManager;

