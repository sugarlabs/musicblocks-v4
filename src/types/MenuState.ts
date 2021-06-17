export type LanguageState = {
    name: string,
    label: string
};

export type MenuModelState = {
    selectedLanguage: string
    languages: LanguageState[]
};

export type ActionState = 
    | { type: "updateLanguage", payload: string };