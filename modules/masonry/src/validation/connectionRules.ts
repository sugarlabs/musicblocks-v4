import type { TNotchType } from '../../@types/tower';

export interface ConnectionRule {
    parentPattern: RegExp;
    childPattern: RegExp;
    notchTypes: TNotchType[];
    reason?: string;
}

export const RULES_NESTED: ConnectionRule[] = [
    { parentPattern: /Start|Action/, childPattern: /.*/, notchTypes: ['nested'] },
    {
        parentPattern:
            /Repeat|Forever|While|Until|If|If\sElse|On\sEvery\sBeat|On\sStrong\sBeat|On\sEvent/,
        childPattern: /^.+$/,
        notchTypes: ['nested'],
    },
    {
        parentPattern: /Note|Rest|Dotted\sNote|Tie|Tuplet/,
        childPattern:
            /Pitch|Solfege|Hertz|Note\sName|Scalar\sInterval|Semitone\sInterval|Transpose|Set\sOctave|Set\sMode|Sharp|Flat|Glide|Set\sInstrument|Staccato|Slur|Accent|Envelope|Set\sVolume|Crescendo|Decrescendo|Pan|Play\sDrum|Set\sDrum|Play\sNoise|Map\sPitch/,
        notchTypes: ['nested'],
    },
    {
        parentPattern: /Scalar\sInterval|Semitone\sInterval|Transpose|Set\sOctave|Set\sMode/,
        childPattern: /Pitch|Solfege|Hertz|Note\sName|Sharp|Flat|Glide/,
        notchTypes: ['nested'],
    },
    {
        parentPattern: /Set\sDrum|Map\sPitch\sTo\sDrum/,
        childPattern: /Pitch|Solfege|Hertz/,
        notchTypes: ['nested'],
    },
    {
        parentPattern: /Staccato|Slur|Accent|Envelope|Set\sVolume|Crescendo|Decrescendo|Pan/,
        childPattern: /Pitch|Solfege|Hertz|Note\sName/,
        notchTypes: ['nested'],
    },
];

export const RULES_ARG: ConnectionRule[] = [
    {
        parentPattern:
            /Add|Subtract|Multiply|Divide|Random|Equals|Greater|Less|And|Or|Not|Box|Named\sBox|Store\sIn\sBox|Add\sTo\sBox|Set\sHeap\sEntry|Heap\sEntry/,
        childPattern:
            /Number|Boolean|Note\sValue|Pitch\sNumber|Volume\sLevel|Beat\sCount|Heading|Mouse|Key|Time|Turtle|Pop|Heap\sLength|Box|Named\sBox|Add|Subtract|Multiply|Divide|Random|Equals|Greater|Less|And|Or|Not/,
        notchTypes: ['right-left'],
    },
];

export function matchRule(
    parentName: string,
    childName: string,
    notchType: TNotchType,
    rules: ConnectionRule[],
): { matched: boolean; reason?: string } {
    for (const rule of rules) {
        const notchMatch = rule.notchTypes.includes(notchType);
        if (!notchMatch) continue;
        if (rule.parentPattern.test(parentName) && rule.childPattern.test(childName)) {
            return { matched: true, reason: rule.reason };
        }
    }
    return { matched: false, reason: `${childName} cannot be placed inside ${parentName}` };
}
