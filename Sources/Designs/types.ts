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

type HCMDataList = [
    string,
    number,
    number,
    number,
    number,
    number,
    number,
    number
];

/**
 * Interface representing the incoming HCM data.
 */
export interface HCMData {
    list: HCMDataList[];
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
    high_contrast_names: boolean;
    purpose: CounterPurpose;
    severity: SeverityType;
    font_name: string;
    font_url: string;
    css_url: string;
    update_time?: number;
    split_active: number;
    progress_bar_colored: boolean;
    show_time_footer: boolean;
    show_progress_bar: boolean;
    attempts: number;
    show_headline: boolean;
    highlight_active_split: boolean;
    use_roman: boolean;
    supPB: boolean;
    show_pb_totals: boolean;
    best_progress: number;
    session_progress: number;
    width: number;
    height: number;
}

export interface Split {
    name: string;
    combinedHits: number;
    pbHits: number;
    wayHits: number;
    runId: number;
    duration: number;
    durationPb: number;
    durationGold: number;
    comulativePb: number;
    comulativeTime: number;
    comulativeTimePb: number;
    bossHits: number;
    isHitless: boolean;
    isHitlessPb: boolean;
    isReached: boolean;
    doDisplay: boolean;
    classColor: string;
    className: string;
    classHits: string;
    classTime: string;
}

export type GlobalHitsData = {
    combined: number;
    way: number;
    pb: number;
    class: string;
};
