import {
    CrossOrCheckmark,
    SessionProgressStar,
    SpanFactory,
    diffToTimeStr,
    intToDisplayString,
    intToTimeStr
} from './helperFunctions';
import { CounterPurpose, GlobalHitsData, HCMData, Split } from './types';

/**
 * Builds the HTML for the table rows.
 *
 * @param data - The HCMData object containing the necessary information for determining the table rows.
 * @param splits - The array of Split objects representing the splits.
 * @param totalHits - The GlobalHitsData object containing the total hits data.
 * @param maxCols - The maximum number of columns to be displayed in the table.
 * @param hitCols - The number of hit columns to be displayed in the table.
 * @param totalTimeCurrent - The total time for the current split.
 * @param totalTimePb - The total Personal Best (PB) time.
 *
 * @returns - The HTML for the table rows.
 */
export function buildTableRowsHTML(
    data: HCMData,
    splits: Split[],
    totalHits: GlobalHitsData,
    maxCols: number,
    hitCols: number,
    totalTimeCurrent: number,
    totalTimePb: number
): string {
    let table = '';
    const majorClass = data.high_contrast ? 'major dark' : 'major';

    // ------------------------------------------------------------------------------------
    // --------------------------------- Attempts Counter ---------------------------------
    table += buildAttemptsCounterRow(data, majorClass, maxCols);
    // ------------------------------------------------------------------------------------
    // ------------------------------------- Headline -------------------------------------
    table += buildHeadlineRow(data, splits, majorClass);
    // ------------------------------------------------------------------------------------
    // ----------------------------------- Progress Bar -----------------------------------
    table += buildProgressBarRow(data, splits, majorClass, maxCols);
    // ------------------------------------------------------------------------------------
    // -------------------------------------- Splits --------------------------------------
    table += buildSplitsRows(data, splits, totalHits);
    // ------------------------------------------------------------------------------------
    // -------------------------------------- Footer --------------------------------------
    table += buildFooterRow(
        data,
        splits,
        totalHits,
        hitCols,
        majorClass,
        totalTimeCurrent,
        totalTimePb
    );
    // ------------------------------------------------------------------------------------
    // ----------------------------------- Footer (Time) ----------------------------------
    table += buildFooterTimeRow(
        data,
        majorClass,
        hitCols,
        maxCols,
        totalTimeCurrent
    );

    return table;
}

/**
 * Builds a table row for the attempts counter.
 * If `show_attempts` is false, an empty string will be returned.
 *
 * @param {HCMData} data - The HCMData object containing the necessary information for the attempts counter.
 * @param {string} majorClass - The CSS class for the major row.
 * @param {number} maxCols - The maximum number of columns for the table.
 *
 * @returns {string} The HTML for the attempts counter table row.
 */
function buildAttemptsCounterRow(
    data: HCMData,
    majorClass: string,
    maxCols: number
): string {
    if (!data.show_attempts) return '';
    const cellProps = `class="${majorClass} top" colspan="${maxCols}"`;
    return `<tr><td ${cellProps}>Run # ${data.attempts}</td></tr>`;
}

/**
 * Builds a table row for the headline.
 * If `show_headline` is false, an empty string will be returned.
 *
 * @param {HCMData} data - The HCMData object containing the necessary information for the headline.
 * @param {Split[]} splits - The array of Split objects.
 * @param {string} majorClass - The CSS class for the major row.
 *
 * @returns {string} The HTML for the headline table row.
 */
function buildHeadlineRow(
    data: HCMData,
    splits: Split[],
    majorClass: string
): string {
    if (!data.show_headline) return '';

    switch (data.purpose) {
        case CounterPurpose.SplitCounter:
        case CounterPurpose.NoDeath:
        case CounterPurpose.ResetCounter:
            break;
        case CounterPurpose.Checklist:
            return `<tr>
                <td class="${majorClass} left">Boss</td>
                <td class="${majorClass}" width="30px">Done</td>
            </tr>`;
        case CounterPurpose.DeathCounter:
        default:
            return '';
    }

    let cells = '';

    const splitText = `Split (${data.split_active} / ${splits.length})`;
    cells += `<td class="${majorClass} left">${splitText}</td>`;

    const showMerged = data.show_hits && data.show_hitscombined;
    const showSplit = data.show_hits && !data.show_hitscombined;
    const showDiff = data.show_numbers && data.show_diff;

    if (showMerged) {
        const headerText =
            data.purpose === CounterPurpose.ResetCounter ? 'Resets' : 'Now';
        cells += `<td class="${majorClass}" width="30px">${headerText}</td>`;
    }
    if (showSplit) {
        cells += `<td class="${majorClass}" width="30px">Boss</td>`;
        cells += `<td class="${majorClass}" width="30px">Way</td>`;
    }
    if (showDiff) {
        cells += `<td class="${majorClass}" width="30px">Diff</td>`;
    }
    if (data.show_pb) {
        cells += `<td class="${majorClass}">PB</td>`;
    }
    if (data.show_time) {
        cells += `<td class="${majorClass} right" width="110px">Time</td>`;
    }
    if (data.show_time_diff) {
        cells += `<td class="${majorClass} right" width="90px">Delta</td>`;
    }
    if (data.show_time_pb) {
        cells += `<td class="${majorClass} right" width="110px">PB</td>`;
    }
    if (data.show_session_progress) {
        cells += `<td class="${majorClass}" width="22px">&nbsp;</td>`;
    }

    return `<tr>${cells}</tr>`;
}

/**
 * Builds a table row for the progress bar.
 * If `show_progress_bar` is false, an empty string will be returned.
 *
 * @param {HCMData} data - The HCMData object containing the necessary information for the progress bar.
 * @param {Split[]} splits - The array of Split objects.
 * @param {string} majorClass - The CSS class for the major row.
 * @param {number} maxCols - The maximum number of columns for the table.
 *
 * @returns {string} The HTML for the progress bar table row.
 */
function buildProgressBarRow(
    data: HCMData,
    splits: Split[],
    majorClass: string,
    maxCols: number
): string {
    if (!data.show_progress_bar) return '';
    let percentage = 0;
    let percentageSum = 0;

    if (splits.length) percentage = 100 / splits.length;

    let barCells = '';

    for (const split of splits) {
        if (!split.isReached) {
            // place a spacer for the upcoming splits and fill rest
            barCells += '<td class="progress_spacer"> </td>';
            barCells += '<td class="progress_open"> </td>';
            break;
        } else if (split.runId) {
            // skip history split (run_id=0)
            percentageSum += percentage;
            const color = `progress_${
                data.progress_bar_colored ? split.classColor : 'better'
            }`;
            let style = `width: ${percentage}%;`;
            style += ` width: calc(100% / ${splits.length});`;

            barCells += `<td class="${color}" style="${style}"></td>`;
        }
    }

    const tableWrapper = `<table class="progress"><tr>${barCells}</tr></table>`;
    const cellProps = `class="${majorClass} progress_cell" colspan="${maxCols}"`;
    return `<tr><td ${cellProps}>${tableWrapper}</td></tr>`;
}

function buildSplitsRows(
    data: HCMData,
    splits: Split[],
    totalHits: GlobalHitsData
): string {
    switch (data.purpose) {
        case CounterPurpose.SplitCounter:
        case CounterPurpose.NoDeath:
        case CounterPurpose.ResetCounter:
            return buildCounterRows(data, splits);
        case CounterPurpose.Checklist:
            return buildChecklistRows(data, splits);
        case CounterPurpose.DeathCounter:
            return buildDeathCounterRow(data, totalHits.combined);
        default:
            return '';
    }
}

/**
 * Builds the HTML for the rows of a checklist table.
 *
 * @param {HCMData} data - The HCMData object containing the necessary information for the checklist.
 * @param {Split[]} splits - The array of Split objects.
 *
 * @returns {string} The HTML for the rows of the checklist table.
 */
function buildChecklistRows(data: HCMData, splits: Split[]): string {
    let rows = '';

    const lastSplit = Math.min(data.split_last, splits.length - 1);
    for (let i = data.split_first; i <= lastSplit; i++) {
        const split = splits[i];
        const rowClass = getRowClassColor(i, data);
        const icon = CrossOrCheckmark(split.combinedHits > 0 ? 0 : 1);
        rows += `<tr class="${rowClass}">`;

        rows += `<td class="left">${split.name}</td>`;
        rows += `<td>${icon}</td>`;

        rows += '</tr>';
    }
    return rows;
}

/**
 * Builds the HTML for a row in the death counter table.
 *
 * @param {HCMData} data - The HCMData object containing the necessary information for the death counter.
 * @param {number} totalHitsCombined - The total number of combined hits (deaths) in the game.
 *
 * @returns {string} The HTML for a row in the death counter table.
 */
function buildDeathCounterRow(
    data: HCMData,
    totalHitsCombined: number
): string {
    const evenOddClass = data.high_contrast ? 'even' : '';
    const cell = `<td class="bottom left">Deaths: ${totalHitsCombined}</td>`;
    return `<tr class="${evenOddClass}">${cell}</tr>`;
}

function buildCounterRows(data: HCMData, splits: Split[]): string {
    let rows = '';

    let bottom_class = '';
    let comulative_time_duration_str;
    let comulative_time_diff_str;
    let emptyStr = data.show_numbers ? '-' : CrossOrCheckmark(-1);

    const lastSplit = Math.min(splits.length - 1, data.split_last);
    for (let i = 0; i <= lastSplit; i++) {
        const split = splits[i];

        // skip entries that should not be displayed
        if (!split.doDisplay) continue;

        const isCurrentSplit = data.split_active === i;
        const isHitless = split.combinedHits === 0;
        const showBlank =
            data.purpose !== CounterPurpose.ResetCounter &&
            (!split.isReached || (isCurrentSplit && isHitless));

        const highlightClass =
            data.highlight_active_split && isCurrentSplit ? 'highlight' : '';
        if (!data.show_footer && isCurrentSplit) {
            bottom_class = 'bottom';
        }

        // absolute time up to current split, afterwards show duration instead
        comulative_time_duration_str = split.isReached
            ? intToTimeStr(split.comulativeTime, false)
            : diffToTimeStr(split.duration, false);

        comulative_time_diff_str = diffToTimeStr(
            split.isReached
                ? split.comulativeTime - split.comulativeTimePb
                : split.duration - split.durationPb,
            true
        );

        rows += `<tr class="${getRowClassColor(i, data)}">`;
        // Split Column
        rows += `<td class="${split.className} ${highlightClass} ${bottom_class} left">${split.name}</td>`;

        const cellClasses = [split.classHits, highlightClass, bottom_class];
        // Now / Boss + Way
        rows += buildHitColumnCells(
            data,
            split,
            emptyStr,
            cellClasses,
            showBlank
        );

        // Diff
        rows += buildDiffCell(data, split, emptyStr, cellClasses, showBlank);

        // PB
        rows += buildPBCell(data, split, cellClasses);

        // Time
        rows += buildTimeCell(
            data,
            split,
            highlightClass,
            bottom_class,
            emptyStr,
            comulative_time_duration_str,
            isCurrentSplit
        );

        // Time Diff
        rows += buildTimeDiffCell(
            data,
            split,
            highlightClass,
            bottom_class,
            emptyStr,
            comulative_time_diff_str,
            isCurrentSplit
        );

        // PB (Time)
        rows += buildPbTimeCell(
            data,
            split,
            highlightClass,
            bottom_class,
            emptyStr
        );

        // Session Progress
        // Best Progress
        // (Star)
        rows += buildSessionprogressCell(data, highlightClass, bottom_class, i);

        rows += '</tr>';
    }
    return rows;
}

/**
 * Determines the CSS class for a split row based on its index and the HCMData settings.
 *
 * @param {number} index - The index of the split in the splits array.
 * @param {HCMData} data - The HCMData object containing the necessary information for determining the split class.
 *
 * @returns {string} - The CSS class for the split row. It can be one of the following: 'even', 'odd', 'current', or an empty string.
 */
function getRowClassColor(
    index: number,
    data: HCMData
): 'even' | 'odd' | 'current' | '' {
    const evenOdd = index % 2 === 0 ? 'even' : 'odd';
    const notCurrent = data.high_contrast ? evenOdd : '';

    return data.split_active === index ? 'current' : notCurrent;
}

/**
 * Determines the hit column cells for a split row based on the HCMData settings.
 *
 * @param data - The HCMData object containing the necessary information for determining the hit column cells.
 * @param split - The Split object representing the current split.
 * @param emptyStr - The string to be returned when the hit count should be blank.
 * @param cellClasses - The CSS classes for the cells.
 * @param showBlank - A boolean indicating whether the cells should be blank or not.
 *
 * @returns - The HTML for the hit column cells.
 */
function buildHitColumnCells(
    data: HCMData,
    split: Split,
    emptyStr: string,
    cellClasses: string[],
    showBlank: boolean
): string {
    if (!data.show_hits) return '';

    const makeCell = (hits: number) => {
        return `<td class="${cellClasses.join(' ')}">${getHitColumnNumber(
            data,
            split,
            hits,
            emptyStr,
            showBlank
        )}</td>`;
    };

    if (data.show_hitscombined) return makeCell(split.combinedHits);
    return makeCell(split.bossHits) + makeCell(split.wayHits);
}

/**
 * Determines the hit column number based on the HCMData settings and the split's hit count.
 *
 * @param data - The HCMData object containing the necessary information for determining the hit column number.
 * @param split - The Split object representing the current split.
 * @param hitCount - The number of hits for the current split.
 * @param emptyStr - The string to be returned when the hit count should be blank.
 * @param showBlank - A boolean indicating whether the cells should be blank or not.
 *
 * @returns - The hit column number as a string, formatted according to the HCMData settings.
 */
function getHitColumnNumber(
    data: HCMData,
    split: Split,
    hitCount: number,
    emptyStr: string,
    showBlank: boolean
): string {
    if (showBlank) return emptyStr;

    if (data.show_numbers)
        return intToDisplayString(hitCount, false, data.use_roman);

    const checkmarkNum =
        data.purpose === CounterPurpose.NoDeath && !split.isHitless
            ? 1
            : hitCount;

    return CrossOrCheckmark(showBlank ? -1 : checkmarkNum);
}

/**
 * Builds the diff cell for a split row based on the HCMData settings.
 *
 * @param data - The HCMData object containing the necessary information for determining the diff cell.
 * @param split - The Split object representing the current split.
 * @param cellClasses - The CSS classes for the cell.
 * @param emptyStr - The string to be returned when the diff should be blank.
 * @param showBlank - A boolean indicating whether the cells should be blank or not.
 *
 * @returns - The HTML for the diff cell.
 */
function buildDiffCell(
    data: HCMData,
    split: Split,
    emptyStr: string,
    cellClasses: string[],
    showBlank: boolean
): string {
    if (!data.show_numbers) return '';
    if (!data.show_diff) return '';
    let cell = `<td class="${cellClasses.join(' ')}">`;

    if (!split.isReached) {
        cell += `${emptyStr}</td>`;
        return cell;
    }

    const diff = split.combinedHits - split.pbHits;

    if (showBlank && diff === 0) {
        cell += `${emptyStr}</td>`;
        return cell;
    }

    cell += intToDisplayString(diff, true, data.use_roman);
    cell += '</td>';
    return cell;
}

/**
 * Builds the Personal Best (PB) cell for a split row based on the HCMData settings.
 * If PBs are disabled, an empty string will be returned.
 *
 * @param data - The HCMData object containing the necessary information for determining the PB cell.
 * @param split - The Split object representing the current split.
 * @param emptyStr - The string to be returned when the PB should be blank.
 * @param cellClasses - The CSS classes for the cell.
 * @param showBlank - A boolean indicating whether the cells should be blank or not.
 *
 * @returns - The HTML for the PB cell.
 */
function buildPBCell(
    data: HCMData,
    split: Split,
    cellClasses: string[]
): string {
    if (!data.show_pb) return '';

    let cell = `<td class="${cellClasses.join(' ')}">`;
    if (!data.show_numbers) {
        const iconNum =
            data.purpose === CounterPurpose.NoDeath && !split.isHitlessPb
                ? 1
                : split.pbHits;

        cell += CrossOrCheckmark(iconNum);
        cell += '</td>';
        return cell;
    }

    const pb = intToDisplayString(split.pbHits, false, data.use_roman);
    const comulativePb = `(${intToDisplayString(
        split.comulativePb,
        false,
        data.use_roman
    )})`;

    cell += `&nbsp;${pb}`;

    if (!data.show_pb_totals) {
        return `${cell}</td>`;
    }

    if (data.supPB) {
        cell += `<sub>&nbsp;${comulativePb}</sub>`;
    } else {
        cell += comulativePb;
    }

    cell += '</td>';
    return cell;
}

/**
 * Builds the HTML for a time cell in a split row.
 *
 * @param data - The HCMData object containing the necessary information for determining the time cell.
 * @param split - The Split object representing the current split.
 * @param highlightClass - The CSS class for highlighting the cell.
 * @param bottomClass - The CSS class for the bottom row.
 * @param emptyStr - The string to be returned when the time should be blank.
 * @param comulativeTimeDurationStr - The string representation of the comulative time duration.
 * @param isCurrentSplit - A boolean indicating whether the current split is being displayed.
 *
 * @returns - The HTML for the time cell.
 */
function buildTimeCell(
    data: HCMData,
    split: Split,
    highlightClass: string,
    bottomClass: string,
    emptyStr: string,
    comulativeTimeDurationStr: string,
    isCurrentSplit: boolean
): string {
    if (!data.show_time) return '';

    let cell = `<td class="${highlightClass} ${bottomClass} timestamp right">`;

    if (isCurrentSplit) {
        cell += SpanFactory(
            'time_split_current',
            '',
            comulativeTimeDurationStr
        );
        cell += '</td>';
        return cell;
    }

    const showEmpty = !split.isReached && split.duration === 0;
    if (showEmpty) {
        cell += emptyStr;
        cell += '</td>';
        return cell;
    }

    cell += comulativeTimeDurationStr;
    cell += '</td>';
    return cell;
}

/**
 * Builds the HTML for a time difference cell in a split row.
 *
 * @param data - The HCMData object containing the necessary information for determining the time difference cell.
 * @param split - The Split object representing the current split.
 * @param highlightClass - The CSS class for highlighting the cell.
 * @param bottomClass - The CSS class for the bottom row.
 * @param emptyStr - The string to be returned when the time difference should be blank.
 * @param comulativeTimeDiffStr - The string representation of the comulative time difference.
 * @param isCurrentSplit - A boolean indicating whether the current split is being displayed.
 *
 * @returns - The HTML for the time difference cell.
 */
function buildTimeDiffCell(
    data: HCMData,
    split: Split,
    highlightClass: string,
    bottomClass: string,
    emptyStr: string,
    comulativeTimeDiffStr: string,
    isCurrentSplit: boolean
): string {
    if (!data.show_time_diff) return '';

    const cellClass = `${split.classTime} ${highlightClass} ${bottomClass}  right`;
    let cell = `<td class="${cellClass}">`;

    if (split.durationPb <= 0) {
        cell += emptyStr;
        cell += '</td>';
        return cell;
    }

    if (isCurrentSplit) {
        cell += SpanFactory(
            'time_split_diff',
            split.classTime,
            comulativeTimeDiffStr
        );
        cell += '</td>';
        return cell;
    }

    const showEmpty = !split.isReached && split.duration === 0;
    if (showEmpty) {
        cell += emptyStr;
        cell += '</td>';
        return cell;
    }

    cell += comulativeTimeDiffStr;
    cell += '</td>';
    return cell;
}

/**
 * Builds the HTML for a Personal Best (PB) Time cell in a split row.
 *
 * @param data - The HCMData object containing the necessary information for determining the PB Time cell.
 * @param split - The Split object representing the current split.
 * @param highlightClass - The CSS class for highlighting the cell.
 * @param bottomClass - The CSS class for the bottom row.
 * @param emptyStr - The string to be returned when the PB Time should be blank.
 *
 * @returns - The HTML for the PB Time cell.
 */
function buildPbTimeCell(
    data: HCMData,
    split: Split,
    highlightClass: string,
    bottomClass: string,
    emptyStr: string
): string {
    if (!data.show_time_pb) return '';

    let cell = `<td class="${highlightClass} ${bottomClass} timestamp right">`;

    if (split.durationPb <= 0) {
        cell += emptyStr;
        cell += '</td>';
        return cell;
    }

    cell += intToTimeStr(split.comulativeTimePb, false);
    cell += '</td>';
    return cell;
}

/**
 * Builds the HTML for a Session Progress cell in the split row.
 *
 * @param data - The HCMData object containing the necessary information for determining the Session Progress cell.
 * @param highlightClass - The CSS class for highlighting the cell.
 * @param bottomClass - The CSS class for the bottom row.
 * @param index - The index of the split in the splits array.
 *
 * @returns - The HTML for the Session Progress cell.
 */
function buildSessionprogressCell(
    data: HCMData,
    highlightClass: string,
    bottomClass: string,
    index: number
): string {
    if (!data.show_session_progress) return '';

    let cell = `<td class="${highlightClass} ${bottomClass}">`;

    const isBestProgress = data.best_progress === index;
    const isBestSessionProgress = data.session_progress === index;

    if (isBestProgress || isBestSessionProgress) {
        cell += SessionProgressStar();
    } else {
        cell += '&nbsp;';
    }

    cell += '</td>';
    return cell;
}

/**
 * Builds the HTML for the footer row in the HTML table.
 *
 * @param data - The HCMData object containing the necessary information for determining the footer row.
 * @param splits - The array of Split objects representing the splits.
 * @param totalHits - The GlobalHitsData object containing the total hits data.
 * @param hitCols - The number of hit columns to be displayed in the footer row.
 * @param majorClass - The major CSS class for the cells.
 * @param totalTimeCurrent - The total time for the current split.
 * @param totalTimePb - The total Personal Best (PB) time.
 *
 * @returns - The HTML for the footer row.
 */
function buildFooterRow(
    data: HCMData,
    splits: Split[],
    totalHits: GlobalHitsData,
    hitCols: number,
    majorClass: string,
    totalTimeCurrent: number,
    totalTimePb: number
): string {
    if (!data.show_footer) return '';

    if (
        ![
            CounterPurpose.SplitCounter,
            CounterPurpose.NoDeath,
            CounterPurpose.ResetCounter
        ].includes(data.purpose)
    ) {
        return '';
    }

    const classTime = splits.at(-1)?.classTime ?? '';

    let row = '<tr>';

    if (data.show_numbers) {
        row += buildTotalHitsCells(data, totalHits, majorClass);
    } else {
        const classBottomRight = `${majorClass} bottom right`;
        const splitName =
            data.split_active < splits.length
                ? splits[data.split_active].name
                : '&nbsp;';
        const colspan = 1 + hitCols;
        row += `<td colspan"${colspan}" class="${classBottomRight}">${splitName}</td>`;
    }

    if (data.show_time) {
        const spanEl = SpanFactory(
            'time_total_current',
            '',
            intToTimeStr(totalTimeCurrent, true)
        );
        row += `<td class="${majorClass} bottom timestamp right">${spanEl}</td>`;
    }

    // Diff between Total Time and Total PB (Time)
    if (data.show_time_diff) {
        const diff = diffToTimeStr(totalTimeCurrent - totalTimePb, true);
        const spanEl = SpanFactory('time_total_diff', classTime, diff);
        row += `<td class="${majorClass} bottom timestamp right">${spanEl}</td>`;
    }

    // Total PB (Time)
    if (data.show_time_pb) {
        const pbTime = intToTimeStr(totalTimePb, true);
        row += `<td class="${majorClass} bottom timestamp right">${pbTime}</td>`;
    }

    // SP BP (Star / Clock / Flag)
    if (data.show_session_progress) {
        row += `<td class="${majorClass} bottom">&nbsp;</td>`;
    }

    row += '</tr>';
    return row;
}

/**
 * Builds the HTML for the total hits cells in the footer row.
 *
 * @param data - The HCMData object containing the necessary information for determining the total hits cells.
 * @param totalHits - The GlobalHitsData object containing the total hits data.
 * @param majorClass - The major CSS class for the cells.
 *
 * @returns - The HTML for the total hits cells.
 */
function buildTotalHitsCells(
    data: HCMData,
    totalHits: GlobalHitsData,
    majorClass: string
): string {
    const classBottomRight = `${majorClass} ${totalHits.class} bottom right`;
    const classBottom = `${majorClass} ${totalHits.class} bottom`;
    let cells = '';

    cells += `<td class="${classBottomRight}">Total:</td>`;

    // Sum of Now
    if (data.show_hits && data.show_hitscombined) {
        const sum = intToDisplayString(
            totalHits.combined,
            false,
            data.use_roman
        );
        cells += `<td class="${classBottom}">${sum}</td>`;
    }

    // Sum of Boss / Way
    if (data.show_hits && !data.show_hitscombined) {
        const sumBoss = intToDisplayString(
            totalHits.combined - totalHits.way,
            false,
            data.use_roman
        );
        const sumWay = intToDisplayString(totalHits.way, false, data.use_roman);
        cells += `<td class="${classBottom}">${sumBoss}</td>`;
        cells += `<td class="${classBottom}">${sumWay}</td>`;
    }

    // Sum of Diff
    if (data.show_numbers && data.show_diff) {
        const sumDiff = intToDisplayString(
            totalHits.combined - totalHits.pb,
            true,
            data.use_roman
        );
        cells += `<td class="${classBottom}">${sumDiff}</td>`;
    }

    // Sum of PB
    if (data.show_pb) {
        const sumPb = intToDisplayString(totalHits.pb, false, data.use_roman);
        cells += `<td class="${classBottom}">${sumPb}</td>`;
    }

    return cells;
}

/**
 * Builds the HTML for the footer time row in the HTML table.
 *
 * @param data - The HCMData object containing the necessary information for determining the footer time row.
 * @param majorClass - The major CSS class for the cells.
 * @param hitCols - The number of hit columns to be displayed in the footer row.
 * @param maxCols - The maximum number of columns in the table.
 * @param totalTimeCurrent - The total time for the current split.
 *
 * @returns - The HTML for the footer time row.
 */
function buildFooterTimeRow(
    data: HCMData,
    majorClass: string,
    hitCols: number,
    maxCols: number,
    totalTimeCurrent: number
): string {
    if (!data.show_time_footer) return '';

    let row = '';

    switch (data.purpose) {
        case CounterPurpose.SplitCounter:
        case CounterPurpose.NoDeath:
        case CounterPurpose.ResetCounter: {
            const colSpan = `colspan="${hitCols}"`;
            const fillerSpan = `colspan="${maxCols - 1 - hitCols}"`;

            const timeTotal = intToTimeStr(totalTimeCurrent, true);

            row += '<tr>';

            row += `<td class="${majorClass} bottom left">Time:</td>`;

            row += `<td ${colSpan} class="${majorClass} bottom timestamp">`;
            row += SpanFactory('time_total_footer', '', timeTotal);
            row += '</td>';

            row += `<td ${fillerSpan} class="${majorClass} bottom">&nbsp;</td>`;
            row += '</tr>';
            return row;
        }
        case CounterPurpose.Checklist:
        case CounterPurpose.DeathCounter: {
            const rowClass = data.high_contrast ? 'even' : '';
            const timeTotal = intToTimeStr(totalTimeCurrent, true);
            row += `<tr class="${rowClass}">`;
            row += `<td colspan="${maxCols}" class="bottom timestamp left">Time: `;
            row += SpanFactory('time_total_footer', '', timeTotal);
            row += '</td></tr>';
            return row;
        }
        default:
            return '';
    }
}
