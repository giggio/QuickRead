/// <reference path="typings/jetzt/jetzt.d.ts" />
(window => {
  var jetzt  = window.jetzt
    , reader = jetzt.view.reader;

  var executor;

  jetzt.init2 = instructions => {
    if (executor) throw new Error("jetzt already initialised");

    reader.clear();
    executor = jetzt.exec(instructions);
    jetzt.control.keyboard(executor);

    reader.show();

    setTimeout(()=> { executor.start(); }, 500);
    return executor;
  };

  jetzt.quit = ()=> {
    executor.stop();
    reader.hide();
    executor = null;
  };

  jetzt.isOpen = ()=> !!executor;

})(this);