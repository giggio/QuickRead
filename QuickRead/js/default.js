/// <reference path="typings/winjs/winjs.d.ts" />
/// <reference path="typings/jquery/jquery.d.ts" />
/// <reference path="typings/patches.d.ts" />
/// <reference path="typings/jetzt/jetzt.d.ts" />
(function () {
    "use strict";
    HTMLElement.prototype.remove = function remove() {
        $(this).remove();
    };

    jetzt.adjustScale(-0.2);

    function display(text, isShare) {
        if (typeof isShare === "undefined") { isShare = false; }
        $("#controlButtons").show();
        $("#inputBlock").hide();
        if (!isShare)
            $("#newText").show();
        jetzt.config("target_wpm", 500);
        jetzt.init(text);
        $(".sr-blackout").hide();
        $("#toggleRunning").click(function () {
            var running = this.value === "Pause";
            this.value = running ? "Play" : "Pause";
            jetzt.toggleRunning(!running);
        });
        $("#nextParagraph").click(jetzt.nextParagraph);
        $("#nextSentence").click(jetzt.nextSentence);
        $("#previousParagraph").click(jetzt.prevParagraph);
        $("#previousSentence").click(jetzt.prevSentence);
        $("#faster").click(function () {
            return jetzt.adjustWPM(10);
        });
        $("#slower").click(function () {
            return jetzt.adjustWPM(-10);
        });
        $("#smaller").click(function () {
            return jetzt.adjustScale(-0.1);
        });
        $("#larger").click(function () {
            return jetzt.adjustScale(0.1);
        });
    }
    function getArticleFromUri(uri) {
        return WinJS.xhr({
            type: 'get',
            url: 'http://boilerpipe-web.appspot.com/extract?extractor=DefaultExtractor&output=json&extractImages=&url=' + uri,
            data: null
        }).then(function (res) {
            var parsedPage = JSON.parse(res.responseText);
            return parsedPage.response.content;
        });
    }

    function doShareWithPlainText(shareOperation) {
        return shareOperation.data.getTextAsync().then(function (text) {
            display(text, true);
            shareOperation.reportDataRetrieved();
        });
    }

    function doShareWithUri(shareOperation) {
        return shareOperation.data.getUriAsync().then(function (uri) {
            return getArticleFromUri(uri.absoluteUri);
        }).then(function (articleText) {
            display(articleText, true);
            shareOperation.reportDataRetrieved();
        });
    }

    function doShareWithHtml(shareOperation) {
        return shareOperation.data.getHtmlFormatAsync().then(function (htmlFormat) {
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

    function doShare(shareOperation) {
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

    app.onactivated = function (args) {
        if (args.detail.kind === Windows.ApplicationModel.Activation.ActivationKind.shareTarget) {
            var shareOperation = args.detail.shareOperation;
            doShare(args.detail.shareOperation).done(function () {
                return shareOperation.reportDataRetrieved();
            }, function (e) {
                return shareOperation.reportError("Error: " + e.Error);
            });
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

    $(function () {
        $("#doGetUrl").click(function () {
            var url = $("#url").val().trim();
            var expressionWithHttp = '^(https?:\/\/)([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?';
            var regexWithHttp = new RegExp(expressionWithHttp, "i");
            var expressionWithoutHttp = '([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?';
            var regexWithoutHttp = new RegExp(expressionWithoutHttp, "gi");
            var messageDialog;
            if (url === "") {
                messageDialog = new Windows.UI.Popups.MessageDialog("Please type a url, starting with http.");
                return messageDialog.showAsync();
            } else if (url.match(regexWithHttp)) {
                getArticleFromUri(url).then(display);
            } else if (url.match(regexWithoutHttp)) {
                getArticleFromUri("http://" + url).then(display);
            } else {
                messageDialog = new Windows.UI.Popups.MessageDialog("Please select an acceptable (starting with http, www, or at least a correct url).");
                messageDialog.showAsync();
            }
        });
        $("#doShowText").click(function () {
            var text = $("#text").val().trim();
            if (text === "") {
                var messageDialog = new Windows.UI.Popups.MessageDialog("Please type some text.");
                return messageDialog.showAsync();
            }
            display(text);
        });
        $("#newText").click(function () {
            jetzt.close();
            $("#controlButtons").hide();
            $("#inputBlock").show();
            $("#newText").hide();
        });
    });
})();
