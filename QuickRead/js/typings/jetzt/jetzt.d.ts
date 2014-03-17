interface jetztStatic {
  config(config:string, val:any): void;
  init(text: string);
  toggleRunning(run: boolean);
  nextParagraph(): void;
  nextSentence(): void;
  prevParagraph(): void;
  prevSentence(): void;
  adjustWPM(words:number):void;
  adjustScale(diff:number):void;
  close(): void;
  DEFAULT_OPTIONS: Object;
}
declare var jetzt: jetztStatic;