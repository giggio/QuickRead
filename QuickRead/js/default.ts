﻿/// <reference path="typings/winjs/winjs.d.ts" />
/// <reference path="typings/jquery/jquery.d.ts" />
/// <reference path="typings/patches.d.ts" />
/// <reference path="typings/jetzt/jetzt.d.ts" />
/// <reference path="jetztInit.ts" />
declare var readability: any;
(() => {
  "use strict";
  HTMLElement.prototype.remove = function remove() {
    $(this).remove();
  };

  jetzt.config.adjustScale(-0.2);

  function display(text:string, isShare = false) {
    $("#controlButtons").show();
    $("#inputBlock").hide();
    if (!isShare) $("#newText").show();
    jetzt.config("target_wpm", 500);
    var executor = jetzt.init2(jetzt.parse.string(text));
    $(".sr-blackout").hide();
    $("#toggleRunning").click(function () {
      var running = this.value === "Pause";
      this.value = running ? "Play" : "Pause";
      executor.toggleRunning(!running);
    });
    $("#nextParagraph").click(() => executor.nextParagraph());
    $("#nextSentence").click(() => executor.nextSentence());
    $("#previousParagraph").click(() => executor.prevParagraph());
    $("#previousSentence").click(() => executor.prevSentence());
    $("#faster").click(() => jetzt.config.adjustWPM(10));
    $("#slower").click(() => jetzt.config.adjustWPM(-10));
    $("#smaller").click(() => jetzt.config.adjustScale(-0.1));
    $("#larger").click(() => jetzt.config.adjustScale(0.1));
  }
  function getInformationOnlineError(e) {
    var messageDialog = new Windows.UI.Popups.MessageDialog("An error ocurred when getting the text, please try again later. You are probably without connectivity with the internet.");
    messageDialog.showAsync();
  }
  function getArticleFromUri(uri: string) :  Windows.Foundation.IPromise<string> {
    return WinJS.xhr({
      type: 'get',
      url: 'http://boilerpipe-web.appspot.com/extract?extractor=DefaultExtractor&output=json&extractImages=&url=' + uri,
      data: null
    }).then(res=> {
        var parsedPage = JSON.parse(res.responseText);
        return parsedPage.response.content;
      });
  }

  function doShareWithPlainText(shareOperation: Windows.ApplicationModel.DataTransfer.ShareTarget.ShareOperation): Windows.Foundation.IPromise<any> {
    return shareOperation.data.getTextAsync().then(text=> {
      display(text, true);
      shareOperation.reportDataRetrieved();
    });
  }

  function doShareWithUri(shareOperation: Windows.ApplicationModel.DataTransfer.ShareTarget.ShareOperation): Windows.Foundation.IPromise<any> {
    return shareOperation.data.getUriAsync()
      .then(uri => getArticleFromUri(uri.absoluteUri))
      .then(articleText => {
        display(articleText, true);
        shareOperation.reportDataRetrieved();
      }, e => shareOperation.reportError("An error ocurred when trying to go to the internet to get your article. You can still try to select the text so we don't have to go the internet to parse it, and it will work without internet connectivity.")
    );
  }

  function doShareWithHtml(shareOperation: Windows.ApplicationModel.DataTransfer.ShareTarget.ShareOperation): Windows.Foundation.IPromise<any> {
    return shareOperation.data.getHtmlFormatAsync().then(htmlFormat=> {
      var htmlFragment = Windows.ApplicationModel.DataTransfer.HtmlFormatHelper.getStaticFragment(htmlFormat);
      if (htmlFragment.trim().toLowerCase().substr(0, 5) == "<html" && shareOperation.data.contains(Windows.ApplicationModel.DataTransfer.StandardDataFormats.uri)) {
        return doShareWithUri(shareOperation);
      } else {
        var el = document.createElement("div");
        el.innerHTML = htmlFragment;
        var text = el.textContent;
        display(text, true);
      }
    });
  }

  function doShare(shareOperation: Windows.ApplicationModel.DataTransfer.ShareTarget.ShareOperation): Windows.Foundation.IPromise<any> {
    if (shareOperation.data.contains(Windows.ApplicationModel.DataTransfer.StandardDataFormats.text)) {
      return doShareWithPlainText(shareOperation);
    } else if (shareOperation.data.contains(Windows.ApplicationModel.DataTransfer.StandardDataFormats.html)) {
      return doShareWithHtml(shareOperation);
    } else if (shareOperation.data.contains(Windows.ApplicationModel.DataTransfer.StandardDataFormats.uri)) {
      return doShareWithUri(shareOperation);
    }
    return undefined;
  }

  var app = WinJS.Application;
  var activation = Windows.ApplicationModel.Activation;

  app.onactivated = args => {
    if (args.detail.kind === Windows.ApplicationModel.Activation.ActivationKind.shareTarget) {
      var shareOperation = args.detail.shareOperation;
      doShare(args.detail.shareOperation)
        .done(
        () => shareOperation.reportDataRetrieved(),
        e => shareOperation.reportError("Error: " + e.Error)
        );
    }
    if (args.detail.kind === activation.ActivationKind.launch) {
      if (args.detail.previousExecutionState !== activation.ApplicationExecutionState.terminated) {
        // TODO: This application has been newly launched. Initialize
        // your application here.
        //display("Elit perspiciatis deserunt eveniet (maxime) tempore vero \"similique\" similique delectus nobis! Aliquid ut amet doloremque sunt vitae harum aliquam vel, eos! Ipsam assumenda illo architecto saepe accusantium. Cumque ipsam nemo?");
      } else {
        // TODO: This application has been reactivated from suspension.
        // Restore application state here.
      }
      args.setPromise(WinJS.UI.processAll());
      WinJS.Application.onsettings = e => {
        e.detail.applicationcommands = {
          "privacyPolicyDiv": { href: "privacyPolicy.html", title: "Privacy Policy" }
        };
        WinJS.UI.SettingsFlyout.populateSettings(e);
      };
    }
  };

  app.oncheckpoint = args => {
    // TODO: This application is about to be suspended. Save any state
    // that needs to persist across suspensions here. You might use the
    // WinJS.Application.sessionState object, which is automatically
    // saved and restored across suspension. If you need to complete an
    // asynchronous operation before your application is suspended, call
    // args.setPromise().
  };

  app.start();

  $(() => {
    $("#doGetUrl").click(() => {
      var url = $("#url").val().trim();
      var expressionWithHttp = '^(https?:\/\/)([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?';
      var regexWithHttp = new RegExp(expressionWithHttp, "i");
      var expressionWithoutHttp = '([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?';
      var regexWithoutHttp = new RegExp(expressionWithoutHttp, "gi");
      var messageDialog:Windows.UI.Popups.MessageDialog;
      if (url === "") {
        messageDialog = new Windows.UI.Popups.MessageDialog("Please type a url, starting with http.");
        return messageDialog.showAsync();
      } else if (url.match(regexWithHttp)) {
        getArticleFromUri(url).then(display, getInformationOnlineError);
      } else if (url.match(regexWithoutHttp)) {
        getArticleFromUri("http://" + url).then(display, getInformationOnlineError);
      } else {
        messageDialog = new Windows.UI.Popups.MessageDialog("Please select an acceptable (starting with http, www, or at least a correct url).");
        messageDialog.showAsync();
      }
    });
    $("#doShowText").click(() => {
      var text = $("#text").val().trim();
      if (text === "") {
        var messageDialog = new Windows.UI.Popups.MessageDialog("Please type some text.");
        return messageDialog.showAsync();
      }
      display(text);
    });
    $("#newText").click(() => {
      if (jetzt.isOpen()) jetzt.quit();
      $("#controlButtons").hide();
      $("#inputBlock").show();
      $("#newText").hide();
    });
  });

})();