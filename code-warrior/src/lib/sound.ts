/**
 * Sound Effects System
 * Retro 8-bit style sounds for the Code Warrior game
 */

// Extend Window interface for webkit prefixed AudioContext
declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}

class SoundManager {
  private audioContext: AudioContext | null = null;
  private enabled: boolean = true;

  constructor() {
    if (typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.audioContext = new AudioContextClass();
      }
    }
  }

  private playTone(frequency: number, duration: number, type: OscillatorType = 'square') {
    if (!this.enabled || !this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = type;

    gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      this.audioContext.currentTime + duration
    );

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  /**
   * XP Gain - Positive "ding" sound
   */
  xpGain() {
    this.playTone(800, 0.1);
    setTimeout(() => this.playTone(1000, 0.15), 50);
  }

  /**
   * Quest Complete - Victory jingle
   */
  questComplete() {
    const notes = [
      { freq: 523, time: 0 },     // C
      { freq: 659, time: 100 },   // E
      { freq: 784, time: 200 },   // G
      { freq: 1047, time: 300 },  // C (higher)
    ];

    notes.forEach(({ freq, time }) => {
      setTimeout(() => this.playTone(freq, 0.2), time);
    });
  }

  /**
   * Rank Up - Triumphant fanfare
   */
  rankUp() {
    const notes = [
      { freq: 392, time: 0 },
      { freq: 523, time: 150 },
      { freq: 659, time: 300 },
      { freq: 784, time: 450 },
      { freq: 1047, time: 600 },
    ];

    notes.forEach(({ freq, time }) => {
      setTimeout(() => this.playTone(freq, 0.3, 'triangle'), time);
    });
  }

  /**
   * Button Click - Mechanical keyboard clack
   */
  click() {
    this.playTone(200, 0.05, 'square');
  }

  /**
   * Hover - Subtle select sound
   */
  hover() {
    this.playTone(400, 0.03, 'sine');
  }

  /**
   * Error - Alert beep
   */
  error() {
    this.playTone(150, 0.15);
    setTimeout(() => this.playTone(100, 0.15), 100);
  }

  /**
   * Sync Start - Power up sound
   */
  syncStart() {
    for (let i = 0; i < 5; i++) {
      setTimeout(() => this.playTone(300 + i * 100, 0.05), i * 50);
    }
  }

  /**
   * Sync Complete - Success chime
   */
  syncComplete() {
    this.playTone(600, 0.1);
    setTimeout(() => this.playTone(800, 0.2), 80);
  }

  /**
   * Enable/disable sounds
   */
  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  /**
   * Check if sounds are enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }
}

// Export singleton instance
export const soundManager = new SoundManager();
