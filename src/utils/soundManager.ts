// Sound Manager for Casino Blackjack - Simple and Reliable
// Handles all audio effects and casino ambiance

export interface SoundOptions {
  volume?: number;
  loop?: boolean;
  delay?: number;
}

class SoundManager {
  private masterVolume: number = 0.7;
  private soundEnabled: boolean = true;
  private isInitialized: boolean = false;

  constructor() {
    this.setupUserInteractionListener();
  }

  private setupUserInteractionListener() {
    const enableAudio = () => {
      console.log('🔊 Audio context enabled by user interaction');
      this.isInitialized = true;
      
      // Remove listeners after first interaction
      document.removeEventListener('click', enableAudio);
      document.removeEventListener('touchstart', enableAudio);
      document.removeEventListener('keydown', enableAudio);
    };

    document.addEventListener('click', enableAudio);
    document.addEventListener('touchstart', enableAudio);
    document.addEventListener('keydown', enableAudio);
  }

  private audioContext: AudioContext | null = null;
  private ambientGainNode: GainNode | null = null;
  private ambientOscillator: OscillatorNode | null = null;

  private getAudioContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return this.audioContext;
  }

  // Enhanced sound generation with proper casino sounds
  private createCasinoSound(soundType: string): void {
    if (!this.isInitialized || !this.soundEnabled) return;

    try {
      const audioContext = this.getAudioContext();
      
      switch (soundType) {
        case 'cardDeal':
          this.createCardDealSound(audioContext);
          break;
        case 'cardFlip':
          this.createCardFlipSound(audioContext);
          break;
        case 'chipPlace':
          this.createChipSound(audioContext);
          break;
        case 'buttonClick':
          this.createButtonClickSound(audioContext);
          break;
        case 'win':
          this.createWinFanfare(audioContext);
          break;
        case 'lose':
          this.createLoseSound(audioContext);
          break;
        case 'push':
          this.createPushSound(audioContext);
          break;
        case 'bust':
          this.createBustSound(audioContext);
          break;
        case 'blackjack':
          this.createBlackjackCelebration(audioContext);
          break;
        case 'transaction':
          this.createTransactionChime(audioContext);
          break;
      }
    } catch (error) {
      console.warn(`Casino sound failed for ${soundType}:`, error);
    }
  }

  private createCardDealSound(audioContext: AudioContext): void {
    // Sharp, quick card sliding sound with noise
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    const filterNode = audioContext.createBiquadFilter();

    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(150, audioContext.currentTime + 0.08);

    filterNode.type = 'highpass';
    filterNode.frequency.value = 100;

    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(this.masterVolume * 0.15, audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.08);

    oscillator.connect(filterNode);
    filterNode.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.08);
  }

  private createCardFlipSound(audioContext: AudioContext): void {
    // Quick snap sound
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.03);

    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(this.masterVolume * 0.1, audioContext.currentTime + 0.005);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.03);

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.03);
  }

  private createChipSound(audioContext: AudioContext): void {
    // Metallic chip clink
    const oscillator1 = audioContext.createOscillator();
    const oscillator2 = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator1.type = 'sine';
    oscillator1.frequency.value = 1200;
    oscillator2.type = 'sine';
    oscillator2.frequency.value = 1800;

    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(this.masterVolume * 0.2, audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.15);

    oscillator1.connect(gainNode);
    oscillator2.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator1.start(audioContext.currentTime);
    oscillator2.start(audioContext.currentTime);
    oscillator1.stop(audioContext.currentTime + 0.15);
    oscillator2.stop(audioContext.currentTime + 0.15);
  }

  private createButtonClickSound(audioContext: AudioContext): void {
    // Subtle button press
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = 'triangle';
    oscillator.frequency.value = 1000;

    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(this.masterVolume * 0.1, audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.05);

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.05);
  }

  private createWinFanfare(audioContext: AudioContext): void {
    // Triumphant ascending chord
    const frequencies = [523.25, 659.25, 783.99, 1046.5]; // C major chord
    
    frequencies.forEach((freq, index) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.value = freq;

      const delay = index * 0.1;
      gainNode.gain.setValueAtTime(0, audioContext.currentTime + delay);
      gainNode.gain.linearRampToValueAtTime(this.masterVolume * 0.15, audioContext.currentTime + delay + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + delay + 0.8);

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.start(audioContext.currentTime + delay);
      oscillator.stop(audioContext.currentTime + delay + 0.8);
    });
  }

  private createLoseSound(audioContext: AudioContext): void {
    // Descending disappointed sound
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.6);

    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(this.masterVolume * 0.2, audioContext.currentTime + 0.1);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.6);

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.6);
  }

  private createBustSound(audioContext: AudioContext): void {
    // Harsh negative buzz
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(150, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(80, audioContext.currentTime + 0.4);

    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(this.masterVolume * 0.25, audioContext.currentTime + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.4);

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.4);
  }

  private createPushSound(audioContext: AudioContext): void {
    // Neutral steady tone
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.value = 350;

    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(this.masterVolume * 0.15, audioContext.currentTime + 0.1);
    gainNode.gain.linearRampToValueAtTime(this.masterVolume * 0.15, audioContext.currentTime + 0.2);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.3);

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  }

  private createBlackjackCelebration(audioContext: AudioContext): void {
    // Epic celebration with multiple tones
    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5]; // C major pentatonic
    
    notes.forEach((freq, index) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.value = freq;

      const delay = index * 0.15;
      gainNode.gain.setValueAtTime(0, audioContext.currentTime + delay);
      gainNode.gain.linearRampToValueAtTime(this.masterVolume * 0.2, audioContext.currentTime + delay + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + delay + 1.2);

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.start(audioContext.currentTime + delay);
      oscillator.stop(audioContext.currentTime + delay + 1.2);
    });
  }

  private createTransactionChime(audioContext: AudioContext): void {
    // Success chime
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.2);

    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(this.masterVolume * 0.15, audioContext.currentTime + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.2);

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.2);
  }

  // Public methods
  public play(soundName: string, options: SoundOptions = {}) {
    if (!this.soundEnabled) {
      console.log(`🔇 Sound disabled, skipping ${soundName}`);
      return;
    }
    
    if (!this.isInitialized) {
      console.log(`🔊 Audio not initialized yet, skipping ${soundName}`);
      return;
    }

    console.log(`🎵 Playing casino sound: ${soundName}`);
    
    const delay = options.delay || 0;
    
    setTimeout(() => {
      this.createCasinoSound(soundName);
    }, delay);
  }

  public setMasterVolume(volume: number) {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    console.log(`🔊 Volume set to: ${Math.round(this.masterVolume * 100)}%`);
  }

  public toggleSound() {
    this.soundEnabled = !this.soundEnabled;
    console.log(`🔊 Sound ${this.soundEnabled ? 'enabled' : 'disabled'}`);
    return this.soundEnabled;
  }

  public stopAll() {
    // For beep sounds, we can't really stop them mid-play, but we can disable future sounds
    console.log('🔇 Stopping all sounds');
  }

  public playCardDeal() {
    this.play('cardDeal');
  }

  public playCardFlip() {
    this.play('cardFlip');
  }

  public playChipPlace() {
    this.play('chipPlace');
  }

  public playButtonClick() {
    this.play('buttonClick');
  }

  public playWin() {
    this.play('win');
  }

  public playLose() {
    this.play('lose');
  }

  public playPush() {
    this.play('push');
  }

  public playBust() {
    this.play('bust');
  }

  public playBlackjack() {
    this.play('blackjack');
  }

  public playTransaction() {
    this.play('transaction');
  }

  public startAmbient() {
    if (!this.isInitialized || !this.soundEnabled || this.ambientOscillator) {
      console.log('🎵 Ambient sound already playing or not ready');
      return;
    }

    try {
      const audioContext = this.getAudioContext();
      
      // Create subtle casino ambient sound with multiple low frequencies
      this.ambientOscillator = audioContext.createOscillator();
      this.ambientGainNode = audioContext.createGain();
      const filterNode = audioContext.createBiquadFilter();

      // Low frequency ambient hum
      this.ambientOscillator.type = 'sine';
      this.ambientOscillator.frequency.value = 60;
      
      // Low pass filter for warmth
      filterNode.type = 'lowpass';
      filterNode.frequency.value = 200;
      filterNode.Q.value = 0.5;

      // Very quiet volume for background
      this.ambientGainNode.gain.setValueAtTime(0, audioContext.currentTime);
      this.ambientGainNode.gain.linearRampToValueAtTime(this.masterVolume * 0.05, audioContext.currentTime + 2);

      this.ambientOscillator.connect(filterNode);
      filterNode.connect(this.ambientGainNode);
      this.ambientGainNode.connect(audioContext.destination);

      this.ambientOscillator.start(audioContext.currentTime);
      
      // Add subtle frequency modulation for realistic ambiance
      const lfo = audioContext.createOscillator();
      const lfoGain = audioContext.createGain();
      lfo.type = 'sine';
      lfo.frequency.value = 0.1; // Very slow modulation
      lfoGain.gain.value = 5; // Small frequency variation
      
      lfo.connect(lfoGain);
      lfoGain.connect(this.ambientOscillator.frequency);
      lfo.start(audioContext.currentTime);

      console.log('🎵 Started casino ambient sound');
    } catch (error) {
      console.warn('Failed to start ambient sound:', error);
    }
  }

  public stopAmbient() {
    if (this.ambientOscillator && this.ambientGainNode) {
      try {
        const audioContext = this.getAudioContext();
        
        // Fade out over 1 second
        this.ambientGainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 1);
        
        setTimeout(() => {
          if (this.ambientOscillator) {
            this.ambientOscillator.stop();
            this.ambientOscillator = null;
            this.ambientGainNode = null;
          }
        }, 1000);
        
        console.log('🔇 Stopped casino ambient sound');
      } catch (error) {
        console.warn('Failed to stop ambient sound:', error);
      }
    }
  }

  public isSoundEnabled(): boolean {
    return this.soundEnabled;
  }
}

// Export singleton instance
export const soundManager = new SoundManager();