class SoundService {
  constructor() {
    this.sound = new Audio('/sounds/notification.mp3');
    this.sound.load();
  }

  play() {
    // Reset sound to start
    this.sound.currentTime = 0;
    // Play sound
    this.sound.play().catch(error => {
      console.warn('Could not play sound:', error);
    });
  }
}

export const soundService = new SoundService();
export default soundService; 