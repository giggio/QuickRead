interface OnActivatedEvent extends CustomEvent {
  setPromise(any);
}
declare module WinJS.Application {
  function onactivated(eventInfo: OnActivatedEvent): void;
}

interface HTMLElement {
  remove(): void;
}