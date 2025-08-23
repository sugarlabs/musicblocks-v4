/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Scheduler Adapter
 *
 * This adapter provides a plugin-aware wrapper around the core runtime scheduler
 * with enhanced logging, status reporting, and external function integration.
 *
 * This component is domain-agnostic and can be used with any external function
 * registry implementation for different programming languages or frameworks.
 */

import { IRProgram } from './interpreter/ir-program';
import { Scheduler } from './scheduler/scheduler';
import { IExternalFunctionRegistry } from './execution/external-function-registry';

export interface SchedulerStatus {
    runQueueSize: number;
    waitQueueSize: number;
    ioQueueSize: number;
    eventQueueSize: number;
    totalThreads: number;
    isRunning: boolean;
}

/**
 * Scheduler Adapter that wraps the core runtime scheduler
 * with external function integration and monitoring capabilities
 */
export class SchedulerAdapter {
    private scheduler: Scheduler;
    private functionRegistry: IExternalFunctionRegistry;
    private isRunning: boolean = false;
    private executionLog: string[] = [];

    constructor(functionRegistry: IExternalFunctionRegistry) {
        this.functionRegistry = functionRegistry;
        this.scheduler = new Scheduler();
        this.registerExternalFunctions();
    }

    /**
     * Register all functions from the external function registry
     */
    private registerExternalFunctions(): void {
        // Check if the function registry supports enumeration
        if (typeof (this.functionRegistry as any).getRegisteredFunctions === 'function') {
            const functionNames = (this.functionRegistry as any).getRegisteredFunctions();
            for (const functionName of functionNames) {
                this.scheduler.registerExternalFunction(functionName, (...args: unknown[]) => {
                    return this.functionRegistry.executeFunction(functionName, args);
                });
            }
            console.log(
                `[SCHEDULER-ADAPTER] Registered ${functionNames.length} external functions`,
            );
        } else {
            console.warn('[SCHEDULER-ADAPTER] Function registry does not support enumeration');
        }
    }

    public load(program: IRProgram): void {
        console.log('[SCHEDULER-ADAPTER] Loading IR program...');
        this.executionLog.length = 0;
        this.scheduler.load(program);

        // Count threads for status reporting
        let threadCount = 0;
        for (const [functionName] of program.functions) {
            if (functionName.startsWith('start')) {
                threadCount++;
            }
        }

        console.log(`[SCHEDULER-ADAPTER] Program loaded. Total threads: ${threadCount}`);
        this.executionLog.push(
            `[${new Date().toISOString()}] Program loaded with ${threadCount} threads`,
        );
    }

    public start(): void {
        console.log('[SCHEDULER-ADAPTER] Starting execution...');
        this.isRunning = true;
        this.executionLog.push(`[${new Date().toISOString()}] Scheduler started`);
        this.scheduler.start();
    }

    public stop(): void {
        console.log('[SCHEDULER-ADAPTER] Stopping execution...');
        this.isRunning = false;
        this.scheduler.stop();
        this.executionLog.push(`[${new Date().toISOString()}] Scheduler stopped`);
    }

    public getStatus(): SchedulerStatus {
        // Access the internal queues of the runtime scheduler for status reporting
        const runtimeScheduler = this.scheduler as any;
        return {
            runQueueSize: runtimeScheduler.runQueue?.length || 0,
            waitQueueSize: runtimeScheduler.waitQueue?.length || 0,
            ioQueueSize: runtimeScheduler.ioQueue?.length || 0,
            eventQueueSize: runtimeScheduler.eventQueue?.length || 0,
            totalThreads: runtimeScheduler.tcbMap?.size || 0,
            isRunning: this.isRunning,
        };
    }

    public getExecutionLog(): string[] {
        return [...this.executionLog];
    }

    public triggerEvent(eventName: string): void {
        console.log(`[SCHEDULER-ADAPTER] Triggering event: ${eventName}`);
        this.executionLog.push(`[${new Date().toISOString()}] Event ${eventName} triggered`);

        // The runtime scheduler will handle event processing automatically
        // through its processEventQueue method
    }

    /**
     * Get the underlying scheduler for direct access if needed
     */
    public getUnderlyingScheduler(): Scheduler {
        return this.scheduler;
    }
}
