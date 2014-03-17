interface jetztConfig {
  (config:string, val:any): void;
  adjustScale(diff:number):void;
  adjustWPM(words:number):void;
  DEFAULT_OPTIONS: Object;
}
interface jetztExec {
  toggleRunning(run: boolean);
  nextParagraph(): void;
  nextSentence(): void;
  prevParagraph(): void;
  prevSentence(): void;
}
interface jetztParse {
  string(text:string):string;
}
interface jetztStatic {
  config:jetztConfig;
  exec:jetztExec;
  parse:jetztParse;
  init(text: string);
  quit(): void;
  isOpen():boolean;
}
declare var jetzt: jetztStatic;