// src/services/debug/DebugService.ts
export class DebugService {
  private static instance: DebugService
  private isDebugMode: boolean

  private constructor() {
    this.isDebugMode = import.meta.env.VITE_DEBUG_MODE === 'true'
  }

  public static getInstance(): DebugService {
    if (!DebugService.instance) {
      DebugService.instance = new DebugService()
    }
    return DebugService.instance
  }

  public log(message: string, data?: any): void {
    if (this.isDebugMode) {
      console.log(`[Ludopoly Debug] ${message}`, data || '')
    }
  }

  public error(message: string, error?: any): void {
    if (this.isDebugMode) {
      console.error(`[Ludopoly Error] ${message}`, error || '')
    }
  }

  public warn(message: string, data?: any): void {
    if (this.isDebugMode) {
      console.warn(`[Ludopoly Warning] ${message}`, data || '')
    }
  }

  public group(label: string): void {
    if (this.isDebugMode) {
      console.group(`[Ludopoly] ${label}`)
    }
  }

  public groupEnd(): void {
    if (this.isDebugMode) {
      console.groupEnd()
    }
  }

  public table(data: any): void {
    if (this.isDebugMode) {
      console.table(data)
    }
  }

  public time(label: string): void {
    if (this.isDebugMode) {
      console.time(`[Ludopoly] ${label}`)
    }
  }

  public timeEnd(label: string): void {
    if (this.isDebugMode) {
      console.timeEnd(`[Ludopoly] ${label}`)
    }
  }

  public isEnabled(): boolean {
    return this.isDebugMode
  }
}

// Singleton instance export
export const debugService = DebugService.getInstance()
