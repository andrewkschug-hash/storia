import { rememberAudioUrl, resolvePlayableUrl } from '@/src/audio/localCache';

type EndedHandler = (() => void | Promise<void>) | null;

export type AudioPlayer = {
  play(url: string, rate?: number): Promise<void>;
  pause(): void;
  resume(): void;
  stop(): void;
  isPlaying(): boolean;
  onEnded(cb: EndedHandler): void;
};

class SilentAudioPlayer implements AudioPlayer {
  private playing = false;
  private paused = false;
  private ended: EndedHandler = null;

  async play(url: string, _rate = 1): Promise<void> {
    rememberAudioUrl(url);
    this.playing = true;
    this.paused = false;
  }

  pause(): void {
    if (!this.playing && !this.paused) return;
    this.paused = true;
    this.playing = false;
  }

  resume(): void {
    if (!this.paused) return;
    this.paused = false;
    this.playing = true;
  }

  stop(): void {
    this.playing = false;
    this.paused = false;
  }

  isPlaying(): boolean {
    return this.playing;
  }

  onEnded(cb: EndedHandler): void {
    this.ended = cb;
  }

  /** @internal tests */
  emitEnded() {
    this.playing = false;
    this.paused = false;
    void this.ended?.();
  }
}

class WebAudioPlayer implements AudioPlayer {
  private el: HTMLAudioElement | null = null;
  private ended: EndedHandler = null;

  async play(url: string, rate = 1): Promise<void> {
    this.stop();
    const AudioCtor = (globalThis as { Audio?: typeof Audio }).Audio;
    if (!AudioCtor) {
      throw new Error('No audio element available');
    }
    const playable = await resolvePlayableUrl(url);
    const el = new AudioCtor(playable);
    this.el = el;
    el.playbackRate = rate > 0 ? rate : 1;
    el.onended = () => {
      void this.ended?.();
    };
    await el.play();
  }

  pause(): void {
    this.el?.pause();
  }

  resume(): void {
    if (!this.el) return;
    void this.el.play();
  }

  stop(): void {
    if (this.el) {
      this.el.pause();
      this.el.src = '';
      this.el = null;
    }
  }

  isPlaying(): boolean {
    return !!this.el && !this.el.paused;
  }

  onEnded(cb: EndedHandler): void {
    this.ended = cb;
  }
}

class NativeAudioPlayer implements AudioPlayer {
  private inner: AudioPlayer | null = null;
  private loading: Promise<AudioPlayer> | null = null;
  private ended: EndedHandler = null;

  private async getInner(): Promise<AudioPlayer> {
    if (this.inner) return this.inner;
    if (!this.loading) {
      this.loading = import('@/src/audio/expoPlayback').then((mod) => {
        this.inner = mod.createExpoPlaybackPlayer();
        if (this.ended) this.inner.onEnded(this.ended);
        return this.inner;
      });
    }
    return this.loading;
  }

  async play(url: string, rate = 1): Promise<void> {
    await (await this.getInner()).play(url, rate);
  }

  pause(): void {
    void this.getInner().then((inner) => inner.pause());
  }

  resume(): void {
    void this.getInner().then((inner) => inner.resume());
  }

  stop(): void {
    void this.getInner().then((inner) => inner.stop());
  }

  isPlaying(): boolean {
    return this.inner?.isPlaying() ?? false;
  }

  onEnded(cb: EndedHandler): void {
    this.ended = cb;
    if (this.inner) this.inner.onEnded(cb);
  }
}

export function createAudioPlayer(): AudioPlayer {
  const AudioCtor = (globalThis as { Audio?: typeof Audio }).Audio;
  if (typeof AudioCtor === 'function') return new WebAudioPlayer();
  return new NativeAudioPlayer();
}

export { SilentAudioPlayer };
