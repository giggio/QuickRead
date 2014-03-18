/// <reference path="typings/jetzt/jetzt.d.ts" />
(function (window) {
    var jetzt = window.jetzt, reader = jetzt.view.reader;

    var executor;

    jetzt.init2 = function (instructions) {
        if (executor)
            throw new Error("jetzt already initialised");

        reader.clear();
        executor = jetzt.exec(instructions);
        jetzt.control.keyboard(executor);

        reader.show();

        setTimeout(function () {
            executor.start();
        }, 500);
        return executor;
    };

    jetzt.quit = function () {
        executor.stop();
        reader.hide();
        executor = null;
    };

    jetzt.isOpen = function () {
        return !!executor;
    };
})(this);
//# sourceMappingURL=jetztInit.js.map
