/**
 * Enum representing the currently selected purpose of the counter.
 */
export enum CounterPurpose {
    SplitCounter = 0,
    DeathCounter = 1,
    Checklist = 2,
    NoDeath = 3,
    ResetCounter = 4
}

/**
 * Enum representing the possible types of Severity.
 * This is used to determine what color to use for the row.
 */
export enum SeverityType {
    /**
     * Any hit, boss or way, should be marked critical.
     */
    AnyHitsCritical = 0,
    /**
     * Only boss hits should be marked critical.
     */
    BossHitCritical = 1,
    /**
     * Only hits exceeding the PB should be marked critical.
     */
    ComparePB = 2
}
/**
 * Interface representing the incoming HCM data.
 */
export interface HCMData {
    /**
     * The
     */
    list: [string, number, number, number, number, number, number, number];
    timer_paused: boolean;
    run_active: number;
    show_hits: boolean;
    show_hitscombined: boolean;
    show_numbers: boolean;
    show_diff: boolean;
    show_pb: boolean;
    show_time: boolean;
    show_time_diff: boolean;
    show_session_progress: boolean;
    show_time_pb: boolean;
    show_footer: boolean;
    show_attempts: boolean;
    split_first: number;
    split_last: number;
    high_contrast: boolean;
    purpose: CounterPurpose;
    font_name: string;
    font_url: string;
    css_url: string;
    update_time?: number;
}

export interface Split {
    name: string;
    combinedHits: number;
    pbHits: number;
    wayHits: number;
    runId: number;
    duration: number;
    pbDuration: number;
    goldDuration: number;
    comulativePb: number;
    comulativeTime: number;
    comulativeTimePb: number;
}
