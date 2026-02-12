declare module 'react-syntax-highlighter' {
  import { ComponentType } from 'react';
  
  interface SyntaxHighlighterProps {
    language?: string;
    style?: any;
    children: string;
    className?: string;
    showLineNumbers?: boolean;
    wrapLines?: boolean;
    lineProps?: any;
    [key: string]: any;
  }
  
  export const Prism: ComponentType<SyntaxHighlighterProps>;
  export const Light: ComponentType<SyntaxHighlighterProps>;
}

declare module 'react-syntax-highlighter/dist/esm/styles/prism' {
  export const oneDark: any;
  export const oneLight: any;
  export const dracula: any;
  export const atomDark: any;
  export const materialDark: any;
  export const materialLight: any;
  export const darcula: any;
  export const duotoneDark: any;
  export const duotoneLight: any;
  export const ghcolors: any;
  export const gruvboxDark: any;
  export const gruvboxLight: any;
  export const okaidia: any;
  export const prism: any;
  export const solarizedDark: any;
  export const solarizedLight: any;
  export const tomorrow: any;
  export const twilight: any;
  export const vs: any;
  export const vscDarkPlus: any;
  export const xonokai: any;
  export const a11yDark: any;
  export const a11yLight: any;
  export const coy: any;
  export const coldarkCold: any;
  export const coldarkDark: any;
  export const dark: any;
  export const funky: any;
  export const holiTheme: any;
  export const hopscotch: any;
  export const lucario: any;
  export const nightOwl: any;
  export const nord: any;
  export const shadesOfPurple: any;
  export const synthwave84: any;
  export const vsDark: any;
  export const vsDarkPlus: any;
  export const zTouch: any;
}

declare module 'react-syntax-highlighter/dist/cjs/styles/prism' {
  export const oneDark: any;
  export const oneLight: any;
  export const dracula: any;
  export const atomDark: any;
  export const materialDark: any;
  export const materialLight: any;
  export const darcula: any;
  export const duotoneDark: any;
  export const duotoneLight: any;
  export const ghcolors: any;
  export const gruvboxDark: any;
  export const gruvboxLight: any;
  export const okaidia: any;
  export const prism: any;
  export const solarizedDark: any;
  export const solarizedLight: any;
  export const tomorrow: any;
  export const twilight: any;
  export const vs: any;
  export const vscDarkPlus: any;
  export const xonokai: any;
  export const a11yDark: any;
  export const a11yLight: any;
  export const coy: any;
  export const coldarkCold: any;
  export const coldarkDark: any;
  export const dark: any;
  export const funky: any;
  export const holiTheme: any;
  export const hopscotch: any;
  export const lucario: any;
  export const nightOwl: any;
  export const nord: any;
  export const shadesOfPurple: any;
  export const synthwave84: any;
  export const vsDark: any;
  export const vsDarkPlus: any;
  export const zTouch: any;
}
