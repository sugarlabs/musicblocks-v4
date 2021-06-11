// button in each section
export const buttonList = [
    ["rhythm", "meter", "pitch"],
    [
        "flow",
        "action",
        "boxes",
        "number",
        "boolean",
        "heap",
        "dictionary",
        "extras",
        "program",
        "myblocks"
    ],
    ["graphics", "pen", "media", "sensors", "ensemble"]
];
// advance palette
export const SKIPPALETTES = ["heap", "dictionary", "extras", "program"];
// section list
export const MULTIPALETTEICONS = ["music", "logic", "artwork"];

let blockList: { [button: string]: string[] } = {};

blockList.rhythm = ["note", "note value drum", "silence", "note value"];
blockList.meter = [
    "beats per second",
    "master beats per second",
    "on every note do",
    "notes played",
    "beat count"
];

blockList.pitch = [
    "pitch",
    "pitch G4",
    "scalar step (+/-)",
    "pitch number",
    "hertz",
    "fourth",
    "fifth",
    "pitch in hertz",
    "pitch number",
    "scalar change in pitch",
    "change in pitch"
];
