import { gameService } from './gameService';
import { gameSessionRepository } from '../repositories/gameSessionRepository';
import type { GameSession as DBGameSession } from '../lib/supabase';

export interface GlobalSession {
  id: string;
  status: 'countdown' | 'running' | 'finished';
  countdownEndsAt?: number; // Unix timestamp
  startedAt?: number; // Unix timestamp
  crashPoint: number;
  joinedUsers: Set<string>; // Set of user IDs who joined
}

class SessionManagerService {
  private currentSession: GlobalSession | null = null;
  private countdownInterval: NodeJS.Timeout | null = null;
  private sessionInterval: NodeJS.Timeout | null = null;
  private readonly COUNTDOWN_DURATION = 10000; // 10 seconds in milliseconds

  /**
   * Start the continuous session manager
   */
  start(): void {
    console.log('🚀 Starting continuous session manager...');
    this.startNewSessionCycle();
  }

  /**
   * Start a new session cycle (countdown -> session -> repeat)
   */
  private startNewSessionCycle(): void {
    // Generate crash point for the upcoming session
    const crashPoint = this.generateCrashPoint();
    const countdownEndsAt = Date.now() + this.COUNTDOWN_DURATION;

    // Create countdown session with fresh joined users set
    this.currentSession = {
      id: `session_${Date.now()}`,
      status: 'countdown',
      countdownEndsAt,
      crashPoint,
      joinedUsers: new Set(), // Reset joined users for new session
    };

    console.log(`⏳ Starting countdown for session ${this.currentSession.id}. Crash point: ${crashPoint.toFixed(2)}x`);

    // Start countdown timer
    this.countdownInterval = setTimeout(() => {
      this.startSession();
    }, this.COUNTDOWN_DURATION);
  }

  /**
   * Start the actual game session
   */
  private startSession(): void {
    if (!this.currentSession) return;

    this.currentSession.status = 'running';
    this.currentSession.startedAt = Date.now();

    console.log(`🎮 Session ${this.currentSession.id} started. ${this.currentSession.joinedUsers.size} users joined.`);

    // Calculate when session should end based on crash point
    // Using the same multiplier logic as frontend: 7.5s to 2x, then accelerating
    // We need to reverse-calculate the time to reach crash point
    const crashPoint = this.currentSession.crashPoint;
    let estimatedDuration: number;

    if (crashPoint <= 2) {
      // Phase 1: slow growth
      const slowRate = Math.pow(2, 1 / 7.5);
      estimatedDuration = Math.log(crashPoint) / Math.log(slowRate) * 1000;
    } else {
      // Phase 2: accelerating growth
      // This is more complex, estimate based on exponential growth
      // Approximate: after 7.5s at 2x, growth accelerates
      const timeTo2x = 7500;
      const baseRate = 1.35;
      // Rough estimate for accelerating phase
      estimatedDuration = timeTo2x + ((crashPoint - 2) / baseRate) * 2000;
    }

    // Add some buffer and ensure minimum duration
    const sessionDuration = Math.max(estimatedDuration, 5000);

    // End session after calculated duration
    this.sessionInterval = setTimeout(() => {
      this.endSession();
    }, sessionDuration);
  }

  /**
   * End current session and start next cycle
   */
  private endSession(): void {
    if (!this.currentSession) return;

    console.log(`💥 Session ${this.currentSession.id} ended at ${this.currentSession.crashPoint.toFixed(2)}x`);

    // Clear intervals
    if (this.countdownInterval) {
      clearTimeout(this.countdownInterval);
      this.countdownInterval = null;
    }
    if (this.sessionInterval) {
      clearTimeout(this.sessionInterval);
      this.sessionInterval = null;
    }

    // Mark session as finished
    this.currentSession.status = 'finished';

    // Start next cycle after a brief delay
    setTimeout(() => {
      this.startNewSessionCycle();
    }, 100);
  }

  /**
   * Generate crash point (same logic as gameService)
   */
  private generateCrashPoint(): number {
    const min = 1.01;
    const max = 10.0;
    const crashPoint = min + Math.random() * (max - min);
    return Math.round(crashPoint * 100) / 100;
  }

  /**
   * Join current session (called during countdown)
   */
  joinSession(userId: string): boolean {
    if (!this.currentSession) {
      return false;
    }

    if (this.currentSession.status !== 'countdown') {
      return false; // Can only join during countdown
    }

    if (this.currentSession.countdownEndsAt && Date.now() >= this.currentSession.countdownEndsAt) {
      return false; // Countdown ended
    }

    this.currentSession.joinedUsers.add(userId);
    console.log(`✅ User ${userId} joined session ${this.currentSession.id}`);
    return true;
  }

  /**
   * Check if user joined current session
   */
  hasUserJoined(userId: string): boolean {
    if (!this.currentSession) {
      return false;
    }

    return this.currentSession.joinedUsers.has(userId);
  }

  /**
   * Get current session info
   */
  getCurrentSession(): GlobalSession | null {
    return this.currentSession;
  }

  /**
   * Stop the session manager
   */
  stop(): void {
    if (this.countdownInterval) {
      clearTimeout(this.countdownInterval);
      this.countdownInterval = null;
    }
    if (this.sessionInterval) {
      clearTimeout(this.sessionInterval);
      this.sessionInterval = null;
    }
    this.currentSession = null;
    console.log('🛑 Session manager stopped');
  }
}

export const sessionManagerService = new SessionManagerService();

