interface jetztConfig {
  (config:string, val:any): void;
  adjustScale(diff:number):void;
  adjustWPM(words:number):void;
  DEFAULT_OPTIONS: Object;
  onChange(cb:()=>any):void;
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
interface jetzt {
  config:jetztConfig;
  exec(instructions):jetztExec;
  parse:jetztParse;
  init(text: string);
  init2(text: string):jetztExec;
  quit(): void;
  isOpen():boolean;
}
declare var jetzt: jetzt;