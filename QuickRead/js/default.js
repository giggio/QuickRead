// For an introduction to the Blank template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232509
(function () {
    "use strict";

    var app = WinJS.Application;
    var activation = Windows.ApplicationModel.Activation;

    app.onactivated = function (args) {
        if (args.detail.kind === Windows.ApplicationModel.Activation.ActivationKind.shareTarget) {
        var shareOperation = args.detail.shareOperation;
        if (shareOperation.data.contains(Windows.ApplicationModel.DataTransfer.StandardDataFormats.text)) {
          shareOperation.data.getTextAsync().done(function (text) {
            jetzt.init(text);
            shareOperation.reportDataRetrieved();
          }, function(e) {
            shareOperation.reportError("Error: " + e);
          });
        } else if (shareOperation.data.contains(Windows.ApplicationModel.DataTransfer.StandardDataFormats.html)) {
          shareOperation.data.getHtmlFormatAsync().then(function (htmlFormat) {
            var htmlFragment = Windows.ApplicationModel.DataTransfer.HtmlFormatHelper.getStaticFragment(htmlFormat);
            var el = document.createElement('div');
            el.innerHTML = htmlFragment;
            var text = el.textContent;
            jetzt.init(text);
            shareOperation.reportDataRetrieved();
          });
        }
      }
      if (args.detail.kind === activation.ActivationKind.launch) {
            if (args.detail.previousExecutionState !== activation.ApplicationExecutionState.terminated) {
                // TODO: This application has been newly launched. Initialize
                // your application here.
              jetzt.init("Elit perspiciatis deserunt eveniet maxime tempore vero similique similique delectus nobis! Aliquid ut amet doloremque sunt vitae harum aliquam vel, eos! Ipsam assumenda illo architecto saepe accusantium. Cumque ipsam nemo?");
            } else {
                // TODO: This application has been reactivated from suspension.
                // Restore application state here.
            }
            args.setPromise(WinJS.UI.processAll());
        }
    };

    app.oncheckpoint = function (args) {
        // TODO: This application is about to be suspended. Save any state
        // that needs to persist across suspensions here. You might use the
        // WinJS.Application.sessionState object, which is automatically
        // saved and restored across suspension. If you need to complete an
        // asynchronous operation before your application is suspended, call
        // args.setPromise().
    };

    app.start();
})();
