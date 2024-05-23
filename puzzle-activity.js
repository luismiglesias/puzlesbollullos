/**
 * Puzzle activity (Export)
 *
 * Released under Attribution-ShareAlike 4.0 International License.
 * Author: Manuel Narváez Martínez
 * License: http://creativecommons.org/licenses/by-sa/4.0/
 *
 */
var $eXePuzzle = {
    idevicePath: "",
    borderColors: {
        black: "#1c1b1b",
        blue: "#0056b3",
        green: "#006641",
        red: "#a2241a",
        white: "#ffffff",
        yellow: "#f3d55a",
    },
    colors: {
        black: "#1c1b1b",
        blue: "#0056b3",
        green: "#006641",
        red: "#a2241a",
        white: "#ffffff",
        yellow: "#fcf4d3",
    },
    options: [],
    hasSCORMbutton: false,
    isInExe: false,
    userName: "",
    previousScore: "",
    initialScore: "",
    hasLATEX: false,
    idevicePath: "",
    init: function () {
        this.activities = $(".puzzle-IDevice");
        if (this.activities.length == 0) return;
        if (!$eXePuzzle.supportedBrowser("pzl")) return;
        if (typeof $exeAuthoring != "undefined" && $("#exe-submitButton").length > 0) {
            this.activities.hide();
            if (typeof _ != "undefined") this.activities.before("<p>" + _("Order") + "</p>");
            return;
        }
        if ($(".QuizTestIdevice .iDevice").length > 0) this.hasSCORMbutton = true;
        if (typeof $exeAuthoring != "undefined") this.isInExe = true;
        this.idevicePath = this.isInExe ? "/scripts/idevices/puzzle-activity/export/" : "";
        if ($("body").hasClass("exe-scorm")) this.loadSCORM_API_wrapper();
        else this.enable();
    },
    loadSCORM_API_wrapper: function () {
        if (typeof pipwerks == "undefined") $exe.loadScript("SCORM_API_wrapper.js", "$eXePuzzle.loadSCOFunctions()");
        else this.loadSCOFunctions();
    },
    loadSCOFunctions: function () {
        if (typeof exitPageStatus == "undefined") $exe.loadScript("SCOFunctions.js", "$eXePuzzle.enable()");
        else this.enable();
        $eXePuzzle.mScorm = scorm;
        var callSucceeded = $eXePuzzle.mScorm.init();
        if (callSucceeded) {
            $eXePuzzle.userName = $eXePuzzle.getUserName();
            $eXePuzzle.previousScore = $eXePuzzle.getPreviousScore();
            $eXePuzzle.mScorm.set("cmi.core.score.max", 10);
            $eXePuzzle.mScorm.set("cmi.core.score.min", 0);
            $eXePuzzle.initialScore = $eXePuzzle.previousScore;
        }
    },
    updateScorm: function (prevScore, repeatActivity, instance) {
        var mOptions = $eXePuzzle.options[instance],
            text = "";
        $("#pzlSendScore-" + instance).hide();
        if (mOptions.isScorm === 1) {
            if (repeatActivity && prevScore !== "") {
                text = mOptions.msgs.msgSaveAuto + " " + mOptions.msgs.msgYouLastScore + ": " + prevScore;
            } else if (repeatActivity && prevScore === "") {
                text = mOptions.msgs.msgSaveAuto + " " + mOptions.msgs.msgPlaySeveralTimes;
            } else if (!repeatActivity && prevScore === "") {
                text = mOptions.msgs.msgOnlySaveAuto;
            } else if (!repeatActivity && prevScore !== "") {
                text = mOptions.msgs.msgActityComply + " " + mOptions.msgs.msgYouLastScore + ": " + prevScore;
            }
        } else if (mOptions.isScorm === 2) {
            $("#pzlSendScore-" + instance).show();
            if (repeatActivity && prevScore !== "") {
                text = mOptions.msgs.msgPlaySeveralTimes + " " + mOptions.msgs.msgYouLastScore + ": " + prevScore;
            } else if (repeatActivity && prevScore === "") {
                text = mOptions.msgs.msgPlaySeveralTimes;
            } else if (!repeatActivity && prevScore === "") {
                text = mOptions.msgs.msgOnlySaveScore;
            } else if (!repeatActivity && prevScore !== "") {
                $("#pzlSendScore-" + instance).hide();
                text = mOptions.msgs.msgActityComply + " " + mOptions.msgs.msgYouScore + ": " + prevScore;
            }
        }
        $("#pzlRepeatActivity-" + instance).text(text);
        $("#pzlRepeatActivity-" + instance).fadeIn(1000);
    },
    getUserName: function () {
        var user = $eXePuzzle.mScorm.get("cmi.core.student_name");
        return user;
    },
    getPreviousScore: function () {
        var score = $eXePuzzle.mScorm.get("cmi.core.score.raw");
        return score;
    },
    endScorm: function () {
        $eXePuzzle.mScorm.quit();
    },
    enable: function () {
        $eXePuzzle.loadGame();
    },
    loadGame: function () {
        $eXePuzzle.options = [];
        $eXePuzzle.activities.each(function (i) {
            var dl = $(".puzzle-DataGame", this),
                mOption = $eXePuzzle.loadDataGame(dl, this);
            $eXePuzzle.options.push(mOption);
            var pzl = $eXePuzzle.createInterfaceSelecciona(i);
            dl.before(pzl).remove();
            $("#pzlGameMinimize-" + i).hide();
            $("#pzlGameContainer-" + i).hide();
            if (mOption.showMinimize) {
                $("#pzlGameMinimize-" + i)
                    .css({
                        cursor: "pointer",
                    })
                    .show();
            } else {
                $("#pzlGameContainer-" + i).show();
            }
            $("#pzlDivFeedBack-" + i).prepend($(".puzzle-feedback-game", this));
            $eXePuzzle.addEvents(i);
            $eXePuzzle.showPuzzle(0, i);
            $("#pzlDivFeedBack-" + i).hide();
        });
        if ($eXePuzzle.hasLATEX && typeof MathJax == "undefined") {
            $eXePuzzle.loadMathJax();
        }
    },
    Decrypt: function (str) {
        if (!str) str = "";
        str = str == "undefined" || str == "null" ? "" : str;
        str = unescape(str);
        try {
            var key = 146,
                pos = 0,
                ostr = "";
            while (pos < str.length) {
                ostr = ostr + String.fromCharCode(key ^ str.charCodeAt(pos));
                pos += 1;
            }

            return ostr;
        } catch (ex) {
            return "";
        }
    },
    getPhraseDefault: function () {
        var q = new Object();
        q.cards = [];
        q.msgError = "";
        q.msgHit = "";
        q.definition = "";
        q.puzzle = "";
        return q;
    },

    loadDataGame: function (data, sthis) {
        var json = data.text();
        json = $eXePuzzle.Decrypt(json);
        var mOptions = $eXePuzzle.isJsonString(json),
            $audiosDef = $(".puzzle-LinkAudiosDef", sthis),
            $imagesDef = $(".puzzle-LinkImagesDef", sthis),
            $audiosClue = $(".puzzle-LinkAudiosClue", sthis);
            hasLatex = /(?:\$|\\\(|\\\[|\\begin\{.*?})/.test(json);
        if (hasLatex) {
            $eXePuzzle.hasLATEX = true;
        }
        mOptions.playerAudio = "";
        mOptions.solutionShown = false;
        mOptions.hits = 0;
        mOptions.errors = 0;
        mOptions.score = 0;
        mOptions.gameActived = true;
        mOptions.counter = 0;
        mOptions.gameOver = false;
        mOptions.gameStarted = false;
        mOptions.obtainedClue = false;
        mOptions.fullscreen = false;
        mOptions.hits = 0;
        mOptions.active = 0;
        mOptions.selectedTile = null;
        mOptions.loading = false;
        mOptions.audiofirst = false;
        for (var i = 0; i < mOptions.puzzlesGame.length;i++){
            var q = mOptions.puzzlesGame[i];
            q.type = typeof q.type == "undefined" ? 1:  q.type;
        }
        $imagesDef.each(function () {
            var iqb = parseInt($(this).text());
            if (!isNaN(iqb) && iqb < mOptions.puzzlesGame.length) {
                mOptions.puzzlesGame[iqb].url = $(this).attr("href");
                if (mOptions.puzzlesGame[iqb].url.length < 4) {
                    mOptions.puzzlesGame[iqb].url = "";
                }
            }
        });
        $audiosDef.each(function () {
            var iqa = parseInt($(this).text());
            if (!isNaN(iqa) && iqa < mOptions.puzzlesGame.length) {
                mOptions.puzzlesGame[iqa].audioDefinition = $(this).attr("href");
                if (mOptions.puzzlesGame[iqa].audioDefinition.length < 4) {
                    mOptions.puzzlesGame[iqa].audioDefinition = "";
                }
            }
        });
        $audiosClue.each(function () {
            var iqa = parseInt($(this).text());
            if (!isNaN(iqa) && iqa < mOptions.puzzlesGame.length) {
                mOptions.puzzlesGame[iqa].audioClue = $(this).attr("href");
                if (mOptions.puzzlesGame[iqa].audioClue.length < 4) {
                    mOptions.puzzlesGame[iqa].audioClue = "";
                }
            }
        });
        mOptions.evaluation = typeof mOptions.evaluation == "undefined" ? false : mOptions.evaluation;
        mOptions.evaluationID = typeof mOptions.evaluationID == "undefined" ? "" : mOptions.evaluationID;
        mOptions.id = typeof mOptions.id == "undefined" ? false : mOptions.id;
        mOptions.puzzlesGame = $eXePuzzle.getQuestions(mOptions.puzzlesGame, mOptions.percentajeQuestions);
        if (mOptions.randomPuzzles){
            mOptions.puzzlesGame = $eXePuzzle.shuffleAds(mOptions.puzzlesGame);
        }
        mOptions.numberQuestions = mOptions.puzzlesGame.length;
        return mOptions;
    },

    showPuzzle: function (num, instance) {
        var mOptions = $eXePuzzle.options[instance];
        mOptions.active = num;
        mOptions.puzzle = mOptions.puzzlesGame[num];
        mOptions.attemps = 0;
        mOptions.loading = num == 0 && mOptions.puzzle.showTime;
        mOptions.audiofirst = num == 0 && mOptions.puzzle.audioDefinition.length > 3;
        $eXePuzzle.stopSound(instance);
        $eXePuzzle.showMessage(3, mOptions.puzzlesGame[num].definition, instance);
        $("#pzlImage-" + instance).hide();
        $("#pzlShowImage-" + instance).hide();
        $("#pzlShowNumber-" + instance).hide();
        $("#pzlTime-" + instance).hide();
        $("#pzlImgTime-" + instance).hide();
        $("#pzlAttemps-" + instance).hide();
        $("#pzlImgAttemps-" + instance).hide();
        $("#pzlAttemps-" + instance).text('0');
        $("#pzlAuthor-" + instance).html(mOptions.puzzle.author);
        $("#pzlImage-" + instance).attr('alt',mOptions.puzzle.atl || mOptions.msgs.msgNoImage);

        $("#pzlImagePuzzle-" + instance)
            .find(".PZLP-Tile")
            .remove();
        $("#pzlImagePuzzle-" + instance)
            .find(".PZLP-TileChang")
            .remove();
            $("#pzlImagePuzzle-" + instance)
            .find(".PZLP-Completed")
            .fadeOut();
        $eXePuzzle.showImagePuzzle(num, instance);
        
        $("#pzlAudioDef-" + instance).hide();
        $("#pzlAudioClue-" + instance).hide();
    },

    getQuestions: function (questions, percentaje) {
        var mQuestions = questions;
        if (percentaje < 100) {
            var num = Math.round((percentaje * questions.length) / 100);
            num = num < 1 ? 1 : num;
            if (num < questions.length) {
                var array = [];
                for (var i = 0; i < questions.length; i++) {
                    array.push(i);
                }
                array = $eXePuzzle
                    .shuffleAds(array)
                    .slice(0, num)
                    .sort(function (a, b) {
                        return a - b;
                    });
                mQuestions = [];
                for (var i = 0; i < array.length; i++) {
                    mQuestions.push(questions[array[i]]);
                }
            }
        }
        return mQuestions;
    },

    playSound: function (selectedFile, instance) {
        var mOptions = $eXePuzzle.options[instance];
        mOptions.audiofirst = false;
        selectedFile = $eXePuzzle.extractURLGD(selectedFile);
        function getPathname(url) {
            var a = document.createElement('a');
            a.href = url;
            return a.pathname;
        }
        var selectedFilePathname = getPathname(selectedFile);
        var currentAudioPathname = mOptions.playerAudio ? getPathname(mOptions.playerAudio.src) : null;
        if (mOptions.playerAudio && !mOptions.playerAudio.paused && selectedFilePathname === currentAudioPathname) {
            mOptions.playerAudio.pause();
        } else if (mOptions.playerAudio && mOptions.playerAudio.paused && selectedFilePathname === currentAudioPathname) {
            mOptions.playerAudio.play().catch((error) => console.error("Error playing audio:", error));
        } else {
            if (mOptions.playerAudio) {
                mOptions.playerAudio.pause();
                mOptions.playerAudio.currentTime = 0;
            }
            mOptions.playerAudio = new Audio(selectedFile);
            mOptions.playerAudio.play().catch((error) => console.error("Error playing audio:", error));
        }
    },
    stopSound: function (instance) {
        var mOptions = $eXePuzzle.options[instance];
        if (mOptions.playerAudio && typeof mOptions.playerAudio.pause == "function") {
            mOptions.playerAudio.pause();
            mOptions.playerAudio = null;
        }
    },
    isJsonString: function (str) {
        try {
            var o = JSON.parse(str, null, 2);
            if (o && typeof o === "object") {
                return o;
            }
        } catch (e) {}
        return false;
    },
    createInterfaceSelecciona: function (instance) {
        var html = "",
            path = $eXePuzzle.idevicePath,
            msgs = $eXePuzzle.options[instance].msgs,
            html = "";
        html +=
            '<div class="PZLP-MainContainer" id="pzlMainContainer-' +  instance + '">\
        <div class="PZLP-GameMinimize" id="pzlGameMinimize-' +  instance + '">\
            <a href="#" class="PZLP-LinkMaximize" id="pzlLinkMaximize-' +  instance + '" title="' +  msgs.msgMaximize + '"><img src="' +  path + 'puzzleIcon.png"  class="PZLP-IconMinimize PZLP-Activo"  alt="">\
            <div class="PZLP-MessageMaximize" id="pzlMessageMaximize-' +  instance + '">' +  msgs.msgPlayStart + '</div>\
            </a>\
        </div>\
        <div class="PZLP-GameContainer" id="pzlGameContainer-' +  instance + '">\
            <div class="PZLP-GameScoreBoard" id="pzlGameScoreBoard-' +  instance + '">\
                <div class="PZLP-GameScores">\
                    <div class="exeQuextIcons  exeQuextIcons-Number"  id="pzlPNumberIcon-' +  instance + '" title="' +  msgs.msgNumQuestions + '"></div>\
                    <p><span class="sr-av">' +  msgs.msgNumQuestions + ': </span><span id="pzlPNumber-' +  instance + '">0</span></p>\
                    <div class="exeQuextIcons exeQuextIcons-Hit" title="' +  msgs.msgHits + '"></div>\
                    <p style="display:none;"><span class="sr-av">' +  msgs.msgHits + ': </span><span id="pzlPHits-' +  instance + '">0</span></p>\
                    <div style="display:none;" class="exeQuextIcons  exeQuextIcons-Error" title="' +  msgs.msgErrors + '"></div>\
                    <p><span class="sr-av">' +  msgs.msgErrors + ': </span><span id="pzlPErrors-' +  instance + '">0</span></p>\
                    <div class="exeQuextIcons  exeQuextIcons-Score" id="pzlPScoreIcon-' +  instance + '" title="' +  msgs.msgScore + '"></div>\
                    <p><span class="sr-av">' +  msgs.msgScore + ': </span><span id="pzlPScore-' +  instance + '">0</span></p>\
                </div>\
                <div class="PZLP-Info" id="pzlInfo-' +  instance + '"></div>\
                    <div class="PZLP-TimeNumber">\
                        <strong><span class="sr-av">' +  msgs.msgTimePuzzle + ':</span></strong>\
                        <div class="exeQuextIcons  exeQuextIcons-Time" id="pzlImgTime-' +  instance + '" title="' +  msgs.msgTimePuzzle + '"></div>\
                        <p  id="pzlTime-' +  instance + '" class="PZLP-PTime">00:00</p>\
                        <strong><span class="sr-av">' +  msgs.msgAttempsNumbers + ':</span></strong>\
                        <div class="exeQuextIcons  exeQuextIcons-Number" id="pzlImgAttemps-' +  instance + '" title="' +  msgs.msgAttempsNumbers + '"></div>\
                         <p  id="pzlAttemps-' +  instance + '" class="PZLP-PAttemps">0</p>\
                        <a href="#" id="pzlShowImage-' +  instance + '" title="' +  msgs.msgShowImage + '">\
                            <strong><span class="sr-av">' +  msgs.msgShowImage + ':</span></strong>\
                            <div class="exeQuextIcons exeQuextIcons-ShowImage  PZLP-Activo"></div>\
                        </a>\
                        <a href="#" id="pzlShowNumber-' +  instance + '" title="' +  msgs.msgShowNumbers + '">\
                            <strong><span class="sr-av">' +  msgs.msgShowNumbers + ':</span></strong>\
                            <div class="exeQuextIcons exeQuextIcons-Numbers PZLP-Activo"></div>\
                        </a>\
                        <a href="#" class="PZLP-LinkMinimize" id="pzlLinkMinimize-' +  instance + '" title="' +  msgs.msgMinimize + '">\
                            <strong><span class="sr-av">' +  msgs.msgMinimize + ':</span></strong>\
                            <div class="exeQuextIcons exeQuextIcons-Minimize  PZLP-Activo"></div>\
                        </a>\
                        <a href="#" class="PZLP-LinkFullScreen" id="pzlLinkFullScreen-' +  instance + '" title="' +  msgs.msgFullScreen + '">\
                            <strong><span class="sr-av">' +  msgs.msgFullScreen + ':</span></strong>\
                            <div class="exeQuextIcons exeQuextIcons-FullScreen  PZLP-Activo" id="pzlFullScreen-' +  instance + '"></div>\
                        </a>\
                  </div>\
            </div>\
            <div class="PZLP-Multimedia" id="pzlMultimedia-' +  instance + '">\
              <div class="PZLP-QuestionDiv" id="pzlQuestionDiv-' +  instance + '">\
                <div class="PZLP-Message" id="pzlMessage-' +  instance + '"></div>\
                <a href="#" id="pzlAudioDef-' +  instance + '" class="PZLP-LinkAudioDef">\
                    <img src="' +   $eXePuzzle.idevicePath + 'exequextplayaudio.svg">\
                </a>\
                <a href="#" id="pzlAudioClue-' +  instance + '" class="PZLP-LinkAudioDef">\
                    <img src="' +   $eXePuzzle.idevicePath + 'exequextplayaudio.svg">\
                </a>\
              </div>\
              <div class="PZLP-ImageDiv" id="pzlImageDiv-' +  instance + '">\
                  <img class="PZLP-ImageDef" id="pzlImage-' +  instance + '"  src="' +  path + 'slcmImage.png" alt="' +  msgs.msgNoImage + '" />\
                  <div class="PZLP-ImagePuzzle" id="pzlImagePuzzle-' +  instance + '">\
            </div>\
            </div>\
            <div class="PZLP-Author" id="pzlAuthor-' +  instance + '"></div>\
            <div class="PZLP-Cubierta" id="pzlCubierta-' +  instance + '">\
                <div class="PZLP-GameOverExt" id="pzlGameOver-' +  instance + '">\
                    <div class="PZLP-StartGameEnd" id="pzlMesasgeEnd-' +  instance + '"></div>\
                    <div class="PZLP-GameOver">\
                        <div class="PZLP-DataImage">\
                            <img src="' +  path + 'exequextwon.png" class="PZLP-HistGGame" id="pzlHistGame-' +  instance + '" alt="' +  msgs.msgAllQuestions + '" />\
                            <img src="' +  path + 'exequextlost.png" class="PZLP-LostGGame" id="pzlLostGame-' +  instance + '"  alt="' +  msgs.msgTimeOver + '" />\
                        </div>\
                        <div class="PZLP-DataScore">\
                            <p id="pzlOverNumCards-' +  instance + '"></p>\
                            <p id="pzlOverHits-' +  instance + '"></p>\
                            <p style="display:none;" id="pzlOverErrors-' +  instance + '"></p>\
                            <p id="pzlOverScore-' +  instance + '"></p>\
                        </div>\
                    </div>\
                    <div class="PZLP-StartGameEnd"><a href="#" id="pzlStartGameEnd-' +  instance + '">' +  msgs.msgPlayAgain + '</a></div>\
                </div>\
                <div class="PZLP-CodeAccessDiv" id="pzlCodeAccessDiv-' +  instance + '">\
                    <div class="PZLP-MessageCodeAccessE" id="pzlMesajeAccesCodeE-' +  instance + '"></div>\
                    <div class="PZLP-DataCodeAccessE">\
                        <label class="sr-av">' +  msgs.msgCodeAccess + ':</label><input type="text" class="PZLP-CodeAccessE" id="pzlCodeAccessE-' +  instance + '" placeholder="' +  msgs.msgCodeAccess + '">\
                        <a href="#" id="pzlCodeAccessButton-' +  instance + '" title="' +  msgs.msgSubmit + '">\
                            <strong><span class="sr-av">' +  msgs.msgSubmit + '</span></strong>\
                            <div class="exeQuextIcons-Submit PZLP-Activo"></div>\
                        </a>\
                    </div>\
                </div>\
                <div class="PZLP-ShowClue" id="pzlShowClue-' +  instance + '">\
                    <p class="sr-av">' +  msgs.msgClue + '</p>\
                    <p class="PZLP-PShowClue" id="pzlPShowClue-' +  instance + '"></p>\
                    <a href="#" class="PZLP-ClueBotton" id="pzlClueButton-' +  instance + '" title="' +  msgs.msgContinue + '">' +  msgs.msgContinue + ' </a>\
                </div>\
            </div>\
            <div class="PZLP-DivFeedBack" id="pzlDivFeedBack-' +  instance + '">\
                <input type="button" id="pzlFeedBackClose-' +  instance + '" value="' +  msgs.msgClose + '" class="feedbackbutton" />\
            </div>\
            <div class="PZLP-AuthorGame" id="pzlAuthorGame-' +  instance + '"></div>\
        </div>\
    </div>\
    ' +
            this.addButtonScore(instance);

        return html;
    },

    addButtonScore: function (instance) {
        var mOptions = $eXePuzzle.options[instance];
        var butonScore = "";
        var fB = '<div class="PZLP-BottonContainer">';
        if (mOptions.isScorm == 2) {
            var buttonText = mOptions.textButtonScorm;
            if (buttonText != "") {
                if (this.hasSCORMbutton == false && ($("body").hasClass("exe-authoring-page") || $("body").hasClass("exe-scorm"))) {
                    this.hasSCORMbutton = true;
                    fB += '<div class="PZLP-GetScore">';
                    if (!this.isInExe) fB += '<form action="#" onsubmit="return false">';
                    fB += '<p><input type="button" id="pzlSendScore-' + instance + '" value="' + buttonText + '" class="feedbackbutton" /> <span class="PZLP-RepeatActivity" id="pzlRepeatActivity-' + instance + '"></span></p>';
                    if (!this.isInExe) fB += "</form>";
                    fB += "</div>";
                    butonScore = fB;
                }
            }
        } else if (mOptions.isScorm == 1) {
            if (this.hasSCORMbutton == false && ($("body").hasClass("exe-authoring-page") || $("body").hasClass("exe-scorm"))) {
                this.hasSCORMbutton = true;
                fB += '<div class="PZLP-GetScore">';
                fB += '<p><span class="PZLP-RepeatActivity" id="pzlRepeatActivity-' + instance + '"></span></p>';
                fB += "</div>";
                butonScore = fB;
            }
        }
        fB = +"</div>";
        return butonScore;
    },

    showImagePuzzle: function (num, instance) {
        var mOptions = $eXePuzzle.options[instance],
            q = mOptions.puzzlesGame[num],
            $image = $("#pzlImage-" + instance),
            $author = $("#pzlAuthor-" + instance);
        $author.hide();
        if (q.url.length < 4) {
            return false;
        }
        $image.hide();
        $("#pzlShowNumber-" + instance).hide();
        $("#pzlShowImage-" + instance).hide();
        $image.attr("alt", q.alt);
        $image.off("load");
        $image.off("error");
        $image.prop("src", q.url).on("load", function () {
            $eXePuzzle.handleImageLoad(this, instance, q);
            if (q.showImage) $("#pzlShowImage-" + instance).show();
            if (q.showNumber) $("#pzlShowNumber-" + instance).show(); 
         }).on("error", function () {
            return false;
        });
    },


    handleImageLoad: function (image, instance, q) {
        mOptions = $eXePuzzle.options[instance];
        if (!image.complete || typeof image.naturalWidth == "undefined" || image.naturalWidth == 0) {
            return false;
        } else {
            var mData = $eXePuzzle.placeImageWindows(image.naturalWidth, image.naturalHeight, instance);
            q.data = mData,
            $eXePuzzle.drawImage("#pzlImagePuzzle-" + instance, image, mData);
            $eXePuzzle.placePuzzlePieces(mData,instance);
            var $author = $("#pzlAuthor-" + instance);
            if (q.audioDefinition && q.audioDefinition.length > 4) {
                if(!mOptions.audiofirst) $eXePuzzle.playSound(q.audioDefinition, instance);
                $("#pzlAudioDef-" + instance).css("display", "block");
            }
            if (q.author.length > 0) {
                $author.show();
            }
            if (q.alt.length > 0) {
                $(image).prop("alt", q.alt);
            }
            $(image).hide();
            return true;
        }
    },

    placePuzzlePieces: function (mData, instance) {
        var mOptions = $eXePuzzle.options[instance],
            q = mOptions.puzzlesGame[mOptions.active],
            width = mData.w,
            height = mData.h,
            cols = q.columns,
            rows = q.rows,
            classPiece = q.type == 0 ? 'PZLP-Tile': 'PZLP-TileChange';
        q.parts = [];
        q.tileSizeX = Math.round(width / cols);
        q.tileSizeY = Math.round(height / rows);
        q.emptyX = cols - 1;
        q.emptyY = rows - 1;
        var z = 0;
        $("#pzlImagePuzzle-" + instance)
            .find(".PZLP-Tile")
            .remove();
        $("#pzlImagePuzzle-" + instance)
            .find(".PZLP-TileChange")
            .remove();
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                var x = j * q.tileSizeX;
                var y = i * q.tileSizeY;
                if (q.type == 0 && (i === rows - 1 && j === cols - 1)) {
                    q.parts.push(null);
                    continue;
                }
                   $("#pzlImagePuzzle-" + instance).append(`
                <div id="pzlTile${instance}-${z}" class="${classPiece}" data-index="${z}" data-x="${j}" data-y="${i}" data-x1="${j}" data-y1="${i}" style="
                  left: ${x}px; 
                  top: ${y}px; 
                  background-image: url('${q.url}');
                  background-size: ${width}px ${height}px;
                  width: ${q.tileSizeX}px; 
                  height: ${q.tileSizeY}px;
                  background-position: -${x}px -${y}px;"><span class="PZLP-NumberShow">${z+1}</span>
                </div>
            `);
                q.parts.push({ x: j, y: i, id: z });
                z++;
            }
        }
        $eXePuzzle.shuffle(instance, cols);
        var correct = $eXePuzzle.checkCorrectPlaces(instance);
        if(correct){
            $eXePuzzle.showPuzzle(mOptions.active,instance);
            return;
        }

        if (q.showTime > 0 ) {
            $("#pzlTime-" + instance).show();
            if(!$eXePuzzle.isMobile()) $("#pzlImgTime-" + instance).show();
            mOptions.counter = 0;
            mOptions.counterClock = setInterval(function () {
                var isvisible = $("#pzlCubierta-"+instance).is(':visible');
                if (mOptions.gameStarted && !isvisible && !mOptions.loading) {
                    mOptions.counter++
                    $eXePuzzle.uptateTime(mOptions.counter, instance);
                }
            }, 1000);
        }
        if(q.showAttemps){
            $("#pzlAttemps-" + instance).show();
            $("#pzlImgAttemps-" + instance).show();
        }
        mOptions.lastwidth =  0;
        mOptions.gameStarted = true;
        mOptions.gameActived  = false;
    },


     debounce: function(func, wait) {
        let timeout;
        return function(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    onContainerResize(instance, entries) {
        var mOptions = $eXePuzzle.options[instance];
        for (let entry of entries) {
            if (entry.target.id === 'pzlGameContainer-' + instance) {
                var isvisible = $('#pxlGameContainer-'+instance).is(':visible')
                if(!mOptions || !mOptions.gameStarted || isvisible ) return;

                $eXePuzzle.resizePuzzlePieces(instance);
            }
        }
    },

    showCompletedWindows: function(instance){
        var mOptions = $eXePuzzle.options[instance],
            q = mOptions.puzzlesGame[mOptions.active],
            ms = q.clue && q.clue.length > 0 ? q.clue : '',
            mr = mOptions.active == mOptions.puzzlesGame.length-1 ? mOptions.msgs.msgsTerminate : mOptions.msgs.msgsNext,
            wd =`<div class="PZLP-Completed">
        <div class="PZLP-CompletedLeft">
            <img src="${$eXePuzzle.idevicePath}exequextlost.png" alt="${mOptions.msgs.msgsCompletedPuzzle}">
        </div>
        <div class="PZLP-CompletedRight">
            <div class="PZLP-CompletedText">
                <p>${mOptions.msgs.msgsCompletedPuzzle}</p>
                <p>${ms}</p>
            </div>
            <div class="PZLP-CompletedButtons">
                <a href="#" class="PZLP-RepeatPuzzle">${mOptions.msgs.msgsRepeat}</a>
                <a href="#" class="PZLP-NextPuzzle">${mr}</a>
            </div>
        </div>
    </div>`
    $("#pzlImagePuzzle-" + instance).find('.PZLP-Completed').remove();
    $("#pzlImagePuzzle-" + instance).append(wd)
    $("#pzlImagePuzzle-" + instance).find('.PZLP-Completed').hide();
    $("#pzlImagePuzzle-" + instance).find('.PZLP-Completed').fadeIn();
    $eXePuzzle.updateScore(true,instance)

    },

    resizePuzzlePieces: function (instance) {
        var mOptions = $eXePuzzle.options[instance],
            q = mOptions.puzzlesGame[mOptions.active];          
            if (typeof q == "undefined" || typeof q.data == "undefined") return;
            mOptions.lastwidth =  mOptions.lastwidth == 0 ? q.data.wm : mOptions.lastwidth;
            if($eXePuzzle.isMobile()){
                mOptions.lastwidth = $('#pzlMultimedia-'+instnace).width();
            }
            var cols = q.columns,
                wid =$('#pzlImagePuzzle-' + instance).width(),
                hid =$('#pzlImagePuzzle-' + instance).height(),
                wm = $('#pzlMultimedia-' + instance).width(),
                xp = wm / mOptions.lastwidth,
                width = xp * wid,
                height = xp * hid,
                cols = q.columns,
                rows = q.rows,
                newWidth = Math.round(width / cols),
                newHeight = Math.round(height / rows),
                left= Math.round((wm - width)/ 2),
                pieceClass = q.type == 0?'.PZLP-Tile':'.PZLP-TileChange';
            mOptions.lastwidth = $('#pzlMultimedia-' + instance).width();
            $("#pzlImagePuzzle-" + instance).css({
                width:Math.round(xp * wid)+'px',
                height:Math.round(xp * hid)+'px',
                top:0,
                left:left+'px'
            });
            $("#pzlImage-" + instance).css({
                width:Math.round(xp * wid)+'px',
                height:Math.round(xp * hid)+'px',
                top:0,
                left:left+'px',
            });
        q.tileSizeX = newWidth;
        q.tileSizeY = newHeight;
        $("#pzlImagePuzzle-" + instance)
            .find(pieceClass)
            .each(function () {
                var $piece = $(this);
                var i = $piece.data('index')
                var colIndex = $piece.data('x1');
                var rowIndex =$piece.data('y1');
                var x = $piece.data('x') * newWidth;
                var y = $piece.data('y') * newHeight
                var backgroundPositionX = -colIndex * newWidth + "px";
                var backgroundPositionY = -rowIndex * newHeight + "px";
                $piece.css({
                    "left": x + "px",
                    "top": y + "px",
                    "background-image": `url("${q.url}")`,
                    "background-position": backgroundPositionX + " " + backgroundPositionY,
                    "background-size": `${width}px ${height}px`,
                    "width": newWidth + "px",
                    "height": newHeight + "px",
                });
            });
    },

    showSholution:function(instance){
        var mOptions = $eXePuzzle.options[instance],
        q = mOptions.puzzlesGame[mOptions.active],
        width = q.data.w,
        height = q.data.h,
        cols = q.columns,
        rows = q.rows,
        pieceClass = q.type == 0 ? 'PZLP-Tile' : 'PZLP-TileChange',
        z = 0;
        $("#pzlImage-" + instance).css({'opacity': '0.2', 'display':'block'});
        $("#pzlImagePuzzle-" + instance)
            .find("."+ pieceClass)
            .remove();
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                var x = j * q.tileSizeX;
                var y = i * q.tileSizeY;
                $("#pzlImagePuzzle-" + instance).append(`
                <div id="pzlTile${instance}-${z}" class="${pieceClass}" data-index="${z}" data-x="${j}" data-y="${i}" data-x1="${j}" data-y1="${i}" style="
                  left: ${x}px; 
                  top: ${y}px; 
                  background-image: url('${q.url}');
                  background-size: ${width}px ${height}px;
                  width: ${q.tileSizeX}px; 
                  height: ${q.tileSizeY}px;
                  background-position: -${x}px -${y}px;
                  opacity: 0;
                  z-index: 12;
                  transition: opacity 0.5s ease;"><span class="PZLP-NumberShow">${z+1}</span>
                </div>
            `);
                z++;
            }
        }
        var ns = $eXePuzzle.generateRandomArray(z)
        var counter = 0;
        var counterClock = setInterval(function () {
                if (counter < z) {
                    $(`#pzlTile${instance}-${ns[counter]}`).css({'opacity':1});
                }else{
                    clearInterval(counterClock);
                    counterClock = null;
                    $("#pzlImage-" + instance).css({'opacity': '1', 'display':'none'});
                    setTimeout(function(){
                        $eXePuzzle.showCompletedWindows(instance)
                    },100)
                }
                counter++
        }, 500);

    },
    generateRandomArray:function(num) {
        let array = [];
        for (let i = 0; i < num; i++) {
            array.push(i);
        }
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    },
    shuffle: function (instance, columns) {
        var mOptions = $eXePuzzle.options[instance],
            q = mOptions.puzzlesGame[mOptions.active];

        for (let i = q.parts.length - 2; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [q.parts[i], q.parts[j]] = [q.parts[j], q.parts[i]];
        }
        if (q.type == 0 && (!$eXePuzzle.isSolvable(q.parts, columns))) {
            for (let i = 0; i < q.parts.length - 1; i++) {
                if (q.parts[i] !== null && q.parts[i + 1] !== null && q.parts[i].id > q.parts[i + 1].id) {
                    let tmp = q.parts[i];
                    q.parts[i] = q.parts[i + 1];
                    q.parts[i + 1] = tmp;
                    break;
                }
            }
        }
        q.parts.forEach((part, index) => {
            const selector = `#pzlTile${instance}-${index}`;
            const tile = $(selector);
            if (part) {
                const x = part.x;
                const y = part.y;
                const lf=  x * q.tileSizeX
                const tp = y * q.tileSizeY;
                tile.data("x", x);
                tile.data("y", y);
                tile.css({ left: lf + "px", top: tp + "px" });
            }
        });
    },
    isSolvable: function (parts, columns) {
        let inversions = 0;
        let emptyRow = 0;
        parts.forEach((currentPart, index) => {
            if (currentPart && currentPart.id !== null) {
                for (let j = index + 1; j < parts.length; j++) {
                    if (parts[j] && parts[j].id !== null && currentPart.id > parts[j].id) {
                        inversions++;
                    }
                }
            }
        });
        if (columns % 2 === 0) {
            return (inversions + emptyRow) % 2 === 0;
        } else {
            return inversions % 2 === 0;
        }
    },
    checkCorrectPlaces(instance){
        var mOptions = $eXePuzzle.options[instance],
            q = mOptions.puzzlesGame[mOptions.active],
            cols = q.columns,
            isSolved = true,
            classPieee = q.type == 0?'.PZLP-Tile' : '.PZLP-TileChange';
        $("#pzlGameContainer-" + instance)
            .find(classPieee)
            .each(function () {
                var $tile = $(this);
                var index = $tile.data("index");
                var expectedX = index % cols;
                var expectedY = Math.floor(index / cols);
                var currentX = $tile.data("x");
                var currentY = $tile.data("y");
                if (expectedX !== currentX || expectedY !== currentY) {
                    isSolved = false;
                    return false; 
                }
            });
            return isSolved;

    },
    checkIfSolved: function (instance) {
        var mOptions = $eXePuzzle.options[instance],
            q = mOptions.puzzlesGame[mOptions.active],
            isSolved = $eXePuzzle.checkCorrectPlaces(instance);
            mOptions.loading = false;
            mOptions.attemps++;
            $("#pzlAttemps-" + instance).text(mOptions.attemps);
            if (q.audioDefinition.length>4 && mOptions.audiofirst){
                $eXePuzzle.playSound(q.audioDefinition,instance)
            }
        if (isSolved) {
            mOptions.gameActived = true;
            if (q.audioClue && q.audioClue.length > 4){
                $("#pzlAudioClue-" + instance).css("display", "block");
                $eXePuzzle.playSound(q.audioClue, instance)
            }

           $eXePuzzle.showSholution(instance)
           
            if (mOptions.isScorm == 1) {
                if (mOptions.repeatActivity || $eXePuzzle.initialScore === "") {
                    var score = ((mOptions.hits * 10) / mOptions.puzzlesGame.length).toFixed(2);
                    $eXePuzzle.sendScore(instance, true);
                    $("#pzlRepeatActivity-" + instance).text(mOptions.msgs.msgYouScore + ": " + score);
                    $eXePuzzle.initialScore = score;
                }
            }
           //$eXePuzzle.showCompletedWindows(instance);          
           clearInterval(mOptions.counterClock);
        }
    },
    drawImage: function (div, image, mData) {
        $(image).css({
            position: "absolute",
            left: mData.x + "px",
            top:0,
            width: mData.w + "px",
            height: mData.h + "px",
        });
        $(div).css({
            position: "absolute",
            left: mData.x + "px",
            top: 0,
            width: mData.w + "px",
            height: mData.h + "px",
        });
    },
    placeImageWindows: function ( naturalWidth, naturalHeight, instance) {
        var wDiv = $('#pzlImageDiv-'+ instance).width()  > 200 ?  $('#pzlImageDiv-'+ instance).width() : 900,
            hDiv = $('#pzlImageDiv-'+ instance).height() > 112 ? $('#pzlImageDiv-'+ instance).height() : 504,
            wM = $('#pzlMultimeda-'+ instance).width() > 200 ?  $('#pzlMultimeda-'+ instance).width() : 900,
            hM = $('#pzlMultimeda-'+ instance).height() > 112 ?  $('#pzlMultimeda-'+ instance).height() : 504;

            var varW = naturalWidth / wDiv,
            varH = naturalHeight / hDiv,
            wImage = wDiv,
            hImage = hDiv,
            xImagen = 0,
            yImagen = 0;
        if (varW > varH) {
            wImage = parseInt(wDiv);
            hImage = parseInt(naturalHeight / varW);
            yImagen = parseInt((hDiv - hImage) / 2);
        } else {
            wImage = parseInt(naturalWidth / varH);
            hImage = parseInt(hDiv);
            xImagen = parseInt((wDiv - wImage) / 2);
        }
        return {
            w: wImage,
            h: hImage,
            x: xImagen,
            y: yImagen,
            wm: wM,
            hm: hM
        };
    },
    updateEvaluationIcon: function (instance) {
        var mOptions = $eXePuzzle.options[instance];
        if (mOptions.id && mOptions.evaluation && mOptions.evaluationID.length > 0) {
            var node = $("#nodeTitle").text(),
                data = $eXePuzzle.getDataStorage(mOptions.evaluationID),
                score = "",
                state = 0;
            if (!data) {
                $eXePuzzle.showEvaluationIcon(instance, state, score);
                return;
            }
            const findObject = data.activities.find((obj) => obj.id == mOptions.id && obj.node === node);
            if (findObject) {
                state = findObject.state;
                score = findObject.score;
            }
            $eXePuzzle.showEvaluationIcon(instance, state, score);
            var ancla = "ac-" + mOptions.id;
            $("#" + ancla).remove();
            $("#pzlMainContainer-" + instance)
                .parents("article")
                .prepend('<div id="' + ancla + '"></div>');
        }
    },
    showEvaluationIcon: function (instance, state, score) {
        var mOptions = $eXePuzzle.options[instance];
        var $header = $("#pzlGameContainer-" + instance)
            .parents("article")
            .find("header.iDevice_header");
        var icon = "exequextsq.png",
            alt = mOptions.msgs.msgUncompletedActivity;
        if (state == 1) {
            icon = "exequextrerrors.png";
            alt = mOptions.msgs.msgUnsuccessfulActivity.replace("%s", score);
        } else if (state == 2) {
            icon = "exequexthits.png";
            alt = mOptions.msgs.msgSuccessfulActivity.replace("%s", score);
        }
        $("#pzlEvaluationIcon-" + instance).remove();
        var sicon = '<div id="pzlEvaluationIcon-' + instance + '" class="PZLP-EvaluationDivIcon"><img  src="' + $eXePuzzle.idevicePath + icon + '"><span>' + mOptions.msgs.msgUncompletedActivity + "</span></div>";
        $header.eq(0).append(sicon);
        $("#pzlEvaluationIcon-" + instance)
            .find("span")
            .eq(0)
            .text(alt);
    },
    updateEvaluation: function (obj1, obj2, id1) {
        if (!obj1) {
            obj1 = {
                id: id1,
                activities: [],
            };
        }
        const findObject = obj1.activities.find((obj) => obj.id === obj2.id && obj.node === obj2.node);

        if (findObject) {
            findObject.state = obj2.state;
            findObject.score = obj2.score;
            findObject.name = obj2.name;
            findObject.date = obj2.date;
        } else {
            obj1.activities.push({
                id: obj2.id,
                type: obj2.type,
                node: obj2.node,
                name: obj2.name,
                score: obj2.score,
                date: obj2.date,
                state: obj2.state,
            });
        }
        return obj1;
    },
    getDateString: function () {
        var currentDate = new Date();
        var formattedDate = currentDate.getDate().toString().padStart(2, "0") + "/" + (currentDate.getMonth() + 1).toString().padStart(2, "0") + "/" + currentDate.getFullYear().toString().padStart(4, "0") + " " + currentDate.getHours().toString().padStart(2, "0") + ":" + currentDate.getMinutes().toString().padStart(2, "0") + ":" + currentDate.getSeconds().toString().padStart(2, "0");
        return formattedDate;
    },

    saveEvaluation: function (instance) {
        var mOptions = $eXePuzzle.options[instance],
            score = ((mOptions.hits * 10) / mOptions.numberQuestions).toFixed(2);
        if (mOptions.id && mOptions.evaluation && mOptions.evaluationID.length > 0) {
            var name = $("#pzlGameContainer-" + instance)
                    .parents("article")
                    .find(".iDeviceTitle")
                    .eq(0)
                    .text(),
                node = $("#nodeTitle").text();
            var formattedDate = $eXePuzzle.getDateString();
            var scorm = {
                id: mOptions.id,
                type: mOptions.msgs.msgTypeGame,
                node: node,
                name: name,
                score: score,
                date: formattedDate,
                state: parseFloat(score) >= 5 ? 2 : 1,
            };
            var data = $eXePuzzle.getDataStorage(mOptions.evaluationID);
            data = $eXePuzzle.updateEvaluation(data, scorm);
            data = JSON.stringify(data, mOptions.evaluationID);
            localStorage.setItem("dataEvaluation-" + mOptions.evaluationID, data);
            $eXePuzzle.showEvaluationIcon(instance, scorm.state, scorm.score);
        }
    },
    getDataStorage: function (id) {
        var id = "dataEvaluation-" + id,
            data = $eXePuzzle.isJsonString(localStorage.getItem(id));
        return data;
    },
    sendScore: function (instance, auto) {
        var mOptions = $eXePuzzle.options[instance],
            message = "",
            score = ((mOptions.hits * 10) / mOptions.puzzlesGame.length).toFixed(2);
        if (mOptions.gameStarted || mOptions.gameOver) {
            if (typeof $eXePuzzle.mScorm != "undefined") {
                if (!auto) {
                    if (!mOptions.repeatActivity && $eXePuzzle.previousScore !== "") {
                        message = $eXePuzzle.userName !== "" ? $eXePuzzle.userName + " " + mOptions.msgs.msgOnlySaveScore : mOptions.msgs.msgOnlySaveScore;
                    } else {
                        $eXePuzzle.previousScore = score;
                        $eXePuzzle.mScorm.set("cmi.core.score.raw", score);
                        message = $eXePuzzle.userName !== "" ? $eXePuzzle.userName + ", " + $exe_i18n.yourScoreIs + " " + score : $exe_i18n.yourScoreIs + " " + score;
                        if (!mOptions.repeatActivity) {
                            $("#pzlSendScore-" + instance).hide();
                        }
                        $("#pzlRepeatActivity-" + instance).text($exe_i18n.yourScoreIs + " " + score);
                        $("#pzlRepeatActivity-" + instance).show();
                    }
                } else {
                    $eXePuzzle.previousScore = score;
                    score = score === "" ? 0 : score;
                    $eXePuzzle.mScorm.set("cmi.core.score.raw", score);
                    $("#pzlRepeatActivity-" + instance).text($exe_i18n.yourScoreIs + " " + score);
                    $("#pzlRepeatActivity-" + instance).show();
                    message = "";
                }
            } else {
                message = mOptions.msgs.msgScoreScorm;
            }
        } else {
            var hasClass = $("body").hasClass("exe-scorm");
            message = hasClass ? mOptions.msgs.msgEndGameScore : mOptions.msgs.msgScoreScorm;
        }
        if (!auto) alert(message);
    },

    clear: function (puzzle) {
        return puzzle.replace(/[&\s\n\r]+/g, " ").trim();
    },
    getFullscreen: function (element) {
        if (element.requestFullscreen) {
            element.requestFullscreen();
        } else if (element.mozRequestFullScreen) {
            element.mozRequestFullScreen();
        } else if (element.webkitRequestFullscreen) {
            element.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
        } else if (element.msRequestFullscreen) {
            element.msRequestFullscreen();
        }
    },

    toggleFullscreen: function (element, instance) {
        var mOptions = $eXePuzzle.options[instance],
            element = element || document.documentElement;
        if (!document.fullscreenElement && !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) {
            mOptions.fullscreen = true;
            $eXePuzzle.getFullscreen(element);
        } else {
            mOptions.fullscreen = false;
            $eXePuzzle.exitFullscreen(element);
        }
    },
    exitFullscreen: function () {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    },
    addEvents: function (instance) {
        var mOptions = $eXePuzzle.options[instance];
        $("#pzlAudioDef-" + instance).hide();
        $("#pzlAudioClue-" + instance).hide();
        $("#pzlShowClue-" + instance).hide();
        $("#pzlPHits-" + instance).text(mOptions.hits);
        $("#pzlPNumber-" + instance).text(mOptions.numberQuestions);
        $("#pzlPScore-" + instance).text(mOptions.score);
        $("#pzlPErrors-" + instance).text(mOptions.errors);
        $("#pzlCubierta-" + instance).hide();
        $("#pzlGameOver-" + instance).hide();
        $("#pzlTime-" + instance).hide();
        $("#pzlImgTime-" + instance).hide();
        $("#pzlAttemps-" + instance).hide();
        $("#pzlImgAttemps-" + instance).hide();


        $("#pzlLinkMaximize-" + instance).on("click touchstart", function (e) {
            e.preventDefault();
            $("#pzlGameContainer-" + instance).show();
            $("#pzlGameMinimize-" + instance).hide();
        });
        $("#pzlLinkMinimize-" + instance).on("click touchstart", function (e) {
            e.preventDefault();
            $("#pzlGameContainer-" + instance).hide();
            $("#pzlGameMinimize-" + instance)
                .css("visibility", "visible")
                .show();
        });
        $("#pzlCubierta-" + instance).hide();
        $("#pzlGameOver-" + instance).hide();
        $("#pzlCodeAccessDiv-" + instance).hide();
        $("#pzlLinkFullScreen-" + instance).on("click touchstart", function (e) {
            e.preventDefault();
            var element = document.getElementById("pzlGameContainer-" + instance);
            $eXePuzzle.toggleFullscreen(element, instance);
        });
        $("#pzlFeedBackClose-" + instance).on("click", function (e) {
            $("#pzlDivFeedBack-" + instance).hide();
            $("#pzlGameOver-" + instance).show();
        });
        if (mOptions.itinerary.showCodeAccess) {
            $("#pzlMesajeAccesCodeE-" + instance).text(mOptions.itinerary.messageCodeAccess);
            $("#pzlCodeAccessDiv-" + instance).show();
            $("#pzlCubierta-" + instance).show();
        }
        $("#pzlCodeAccessButton-" + instance).on("click touchstart", function (e) {
            e.preventDefault();
            $eXePuzzle.enterCodeAccess(instance);
        });
        $("#pzlCodeAccessE-" + instance).on("keydown", function (event) {
            if (event.which == 13 || event.keyCode == 13) {
                $eXePuzzle.enterCodeAccess(instance);
                return false;
            }
            return true;
        });
        $("#pzlPNumber-" + instance).text(mOptions.numberQuestions);
        $(window).on("unload", function () {
            if (typeof $eXePuzzle.mScorm != "undefined") {
                $eXePuzzle.endScorm();
            }
        });
        if (mOptions.isScorm > 0) {
            $eXePuzzle.updateScorm($eXePuzzle.previousScore, mOptions.repeatActivity, instance);
        }
        $("#pzlSendScore-" + instance).click(function (e) {
            e.preventDefault();
            $eXePuzzle.sendScore(instance, false);
            $eXePuzzle.saveEvaluation(instance);
        });

        $("#pzlStartGameEnd-" + instance).on("click", function (e) {
            e.preventDefault();
            $eXePuzzle.showPuzzle(0, instance);
            $eXePuzzle.startGame(instance);
            $("#pzlCubierta-" + instance).hide();
        });
        $("#pzlClueButton-" + instance).on("click", function (e) {
            e.preventDefault();
            $("#pzlShowClue-" + instance).hide();
            $("#pzlCubierta-" + instance).fadeOut();
        });

        if (mOptions.time == 0) {
            $("#pzlTime-" + instance).hide();
            $("#pzlImgTime-" + instance).hide();
            $eXePuzzle.uptateTime(0, instance);
        } else {
            $eXePuzzle.uptateTime(0 * 60, instance);
        }
        if (mOptions.author.trim().length > 0 && !mOptions.fullscreen) {
            $("#pzlAuthorGame-" + instance).html(mOptions.msgs.msgAuthor + ": " + mOptions.author);
            $("#pzlAuthorGame-" + instance).show();
        }
        $("#pzlnextPuzzle-" + instance).hide();
        $("#pzlShowImage-" + instance).hide();
        $("#pzlShowNumber-" + instance).hide();

        $eXePuzzle.updateEvaluationIcon(instance);

        $("#pzlAudioDef-" + instance).on("click", function (e) {
            e.preventDefault();
            mOptions.loading = false;
            var sound = mOptions.puzzlesGame[mOptions.active].audioDefinition;
            if(sound && sound.length > 4){
                $eXePuzzle.playSound(sound, instance);
            }
        });
        $("#pzlAudioClue-" + instance).on("click", function (e) {
            e.preventDefault();
            var sound = mOptions.puzzlesGame[mOptions.active].audioClue;
            if(sound && sound.length > 4){
                $eXePuzzle.playSound(sound, instance);
            }
        });
        $("#pzlMultimedia-" + instance).on("click", ".PZLP-Tile", function () {

            var q = mOptions.puzzlesGame[mOptions.active];
            if(mOptions.gameActived || mOptions.gameOver || !mOptions.gameStarted) return;

            var $tile = $(this);
            var tileX = $tile.data('x');
            var tileY =  $tile.data('y');
            
            if ((Math.abs(q.emptyX - tileX) === 1 && q.emptyY === tileY) || (Math.abs(q.emptyY - tileY) === 1 && q.emptyX === tileX)) {
                mOptions.gameActived = true;
                $tile.animate(                    {
                        left: q.emptyX * q.tileSizeX,
                        top: q.emptyY * q.tileSizeY,
                        
                    },
                    300,
                    function () {
                        $tile.data("x", q.emptyX);
                        $tile.data("y", q.emptyY);
                        q.emptyX = tileX;
                        q.emptyY = tileY;
                        mOptions.gameActived = false;
                        $eXePuzzle.checkIfSolved(instance);
                    }
                );
            }
        });
        $("#pzlImagePuzzle-" + instance).on("click", ".PZLP-TileChange", function() {
            if(mOptions.gameActived || mOptions.gameOver || !mOptions.gameStarted) return;
            var $tile = $(this);
            if (!mOptions.selectedTile) {
                mOptions.selectedTile = $tile;
                $tile.css('border', '3px solid #fb0000');
            } else if ($tile.is(mOptions.selectedTile)) {
                mOptions.selectedTile.css('border', '1px solid white');
                mOptions.selectedTile = null;
            } else {
                var selectedX = $tile.data('x');
                var selectedY = $tile.data('y');
                $tile.data("x", mOptions.selectedTile.data('x'));
                $tile.data("y", mOptions.selectedTile.data('y'));
                mOptions.selectedTile.data('x',selectedX)
                mOptions.selectedTile.data('y',selectedY)
                var selectedTileX = mOptions.selectedTile.css('left');
                var selectedTileY =  mOptions.selectedTile.css('top');
                mOptions.selectedTile.css({'z-index':'20', 'border': '1px solid white'})
                $tile.css({'z-index':'20','border': '1px solid white'})
                mOptions.gameActived = true;
                mOptions.selectedTile.animate({
                    left: $tile.css('left'),
                    top: $tile.css('top'),
                }, 300);
                $tile.animate({
                    left: selectedTileX,
                    top: selectedTileY
                }, 300, function() {
                    mOptions.selectedTile.css({'z-index':'1'})
                    $tile.css({'z-index':'1'})
                    mOptions.selectedTile = null;
                    mOptions.gameActived = false;
                    $eXePuzzle.checkIfSolved(instance);
                });
            }
        });
        $("#pzlShowImage-" + instance).on("mouseenter click touchstart", function (e) {
            e.preventDefault();
            $("#pzlImage-" + instance).css({
                "z-index": "10",
                'display': "block"
            });
        });
        $("#pzlShowImage-" + instance).on("mouseleave touchend", function (e) {
            e.preventDefault();
            $("#pzlImage-" + instance).hide();
        });

        $("#pzlShowNumber-" + instance).on("click touchstart", function (e) {
            e.preventDefault();
            var $numbers = $("#pzlImagePuzzle-" + instance).find('.PZLP-NumberShow');
            $numbers.each(function() {
                var $number = $(this);
                if ($number.css('display') === 'none') {
                    $number.css({
                        'display': "flex",
                        "z-index": 11
                    });
                } else {
                    $number.css('display', 'none');
                }
            });
        });
        $("#pzlImagePuzzle-" + instance).on("click", ".PZLP-NextPuzzle",function(e){
            e.preventDefault();
            $eXePuzzle.nextPuzzle(instance);

        });

        $("#pzlImagePuzzle-" + instance).on("click", ".PZLP-RepeatPuzzle",function(e){
            e.preventDefault();
            mOptions.hits--;
            $eXePuzzle.updateScoreRepeat(instance)
            $eXePuzzle.showPuzzle(mOptions.active, instance);
        });


        var resizeObserver = new ResizeObserver($eXePuzzle.debounce(function(entries) {
            $eXePuzzle.onContainerResize(instance, entries);
        }, 100));
        var container = document.getElementById('pzlGameContainer-' + instance);
        if (container) {
            resizeObserver.observe(container);
        }
    },
    nextPuzzle: function (instance) {
        var mOptions = $eXePuzzle.options[instance]; 
        $eXePuzzle.stopSound(instance);
        mOptions.active++;
        if (mOptions.active < mOptions.puzzlesGame.length) {
            $eXePuzzle.showPuzzle(mOptions.active, instance);
        } else {
            $eXePuzzle.gameOver(1, instance);
        }
    },
    enterCodeAccess: function (instance) {
        var mOptions = $eXePuzzle.options[instance];
        if (mOptions.itinerary.codeAccess == $("#pzlCodeAccessE-" + instance).val()) {
            $("#pzlCodeAccessDiv-" + instance).hide();
            $("#pzlCubierta-" + instance).hide();
        } else {
            $("#pzlMesajeAccesCodeE-" + instance)
                .fadeOut(300)
                .fadeIn(200)
                .fadeOut(300)
                .fadeIn(200);
            $("#pzlCodeAccessE-" + instance).val("");
        }
    },

    startGame: function (instance) {
        var mOptions = $eXePuzzle.options[instance];
        if (mOptions.gameStarted) {
            return;
        }
        mOptions.hits = 0;
        mOptions.errors = 0;
        mOptions.score = 0;
        mOptions.gameActived = false;
        mOptions.counter = 0;
        mOptions.gameOver = false;
        mOptions.gameStarted = false;
        mOptions.obtainedClue = false;;
        $("#pzlShowClue-" + instance).hide();
        $("#pzlPHits-" + instance).text(mOptions.hits);
        $("#pzlPNumber-" + instance).text(mOptions.numberQuestions);
        $("#pzlPScore-" + instance).text(mOptions.score);
        $("#pzlPErrors-" + instance).text(mOptions.errors);
        $("#pzlCubierta-" + instance).hide();
        $("#pzlGameOver-" + instance).hide();

    },
    uptateTime: function (time,instance) {
         var mtime =$eXePuzzle.getTimeToString(time)
         $("#pzlTime-" + instance).text(mtime);
    },
    getTimeToString: function (iTime) {
        var mMinutes = parseInt(iTime / 60) % 60;
        var mSeconds = iTime % 60;
        return (mMinutes < 10 ? "0" + mMinutes : mMinutes) + ":" + (mSeconds < 10 ? "0" + mSeconds : mSeconds);
    },
    gameOver: function (type, instance) {
        var mOptions = $eXePuzzle.options[instance];
        if (!mOptions.gameStarted) {
            return;
        }
        $("#pzlImagePuzzle-" + instance).find('.PZLP-Completed').remove();
        mOptions.gameStarted = false;
        mOptions.gameActived = true;
        mOptions.gameOver = true;
        clearInterval(mOptions.counterClock);
        $eXePuzzle.stopSound(instance);
        $("#pzlCubierta-" + instance).show();
        $eXePuzzle.showScoreGame(type, instance);
        $eXePuzzle.saveEvaluation(instance);
        if (mOptions.isScorm == 1) {
            if (mOptions.repeatActivity || $eXePuzzle.initialScore === "") {
                var score = ((mOptions.hits * 10) / mOptions.puzzlesGame.length).toFixed(2);
                $eXePuzzle.sendScore(instance, true);
                $("#pzlRepeatActivity-" + instance).text(mOptions.msgs.msgYouScore + ": " + score);
                $eXePuzzle.initialScore = score;
            }
        }
        $eXePuzzle.showFeedBack(instance);
        $("#pzlCodeAccessDiv-" + instance).hide();
    },

    showFeedBack: function (instance) {
        var mOptions = $eXePuzzle.options[instance];
        var puntos = (mOptions.hits * 100) / mOptions.puzzlesGame.length;
        if (mOptions.feedBack) {
            if (puntos >= mOptions.percentajeFB) {
                $("#pzlGameOver-" + instance).hide();
                $("#pzlDivFeedBack-" + instance)
                    .find(".puzzle-feedback-game")
                    .show();
                $("#pzlDivFeedBack-" + instance).show();
            } else {
                $eXePuzzle.showMessage(1, mOptions.msgs.msgTryAgain.replace("%s", mOptions.percentajeFB), instance, false);
            }
        }
    },
    isMobile: function () {
        return navigator.userAgent.match(/Android/i) || navigator.userAgent.match(/BlackBerry/i) || navigator.userAgent.match(/iPhone|iPad|iPod/i) || navigator.userAgent.match(/Opera Mini/i) || navigator.userAgent.match(/IEMobile/i);
    },

    showScoreGame: function (type, instance) {
        var mOptions = $eXePuzzle.options[instance],
            msgs = mOptions.msgs,
            $pzlHistGame = $("#pzlHistGame-" + instance),
            $pzlLostGame = $("#pzlLostGame-" + instance),
            $pzlOverNumCards = $("#pzlOverNumCards-" + instance),
            $pzlOverHits = $("#pzlOverHits-" + instance),
            $pzlOverErrors = $("#pzlOverErrors-" + instance),
            $pzlOverScore = $("#pzlOverScore-" + instance),
            $pzlCubierta = $("#pzlCubierta-" + instance),
            $pzlGameOver = $("#pzlGameOver-" + instance),
            message = "",
            messageColor = 1;
        $pzlHistGame.hide();
        $pzlLostGame.hide();
        $pzlOverNumCards.show();
        $pzlOverHits.show();
        var mclue = "";
        switch (type) {
            case 0:
                message = msgs.mgsAllPhrases;
                messageColor = 2;
                $pzlHistGame.show();
                if (mOptions.itinerary.showClue) {
                    var text = mOptions.msgs.msgClue + " " + mOptions.itinerary.clueGame;
                    if (mOptions.obtainedClue) {
                        mclue = text;
                    } else {
                        mclue = msgs.msgTryAgain.replace("%s", mOptions.itinerary.percentageClue);
                    }
                }
                break;
            case 1:
                messageColor = 3;
                message = msgs.mgsAllPhrases;
                $pzlLostGame.show();
                if (mOptions.itinerary.showClue) {
                    var text = mOptions.msgs.msgClue + " " + mOptions.itinerary.clueGame;
                    if (mOptions.obtainedClue) {
                        mclue = text;
                    } else {
                        mclue = msgs.msgTryAgain.replace("%s", mOptions.itinerary.percentageClue);
                    }
                }
                break;
            case 2:
                messageColor = 3;
                message = msgs.msgTimeOver;
                $pzlLostGame.show();
                if (mOptions.itinerary.showClue) {
                    var text = mOptions.msgs.msgClue + " " + mOptions.itinerary.clueGame;
                    if (mOptions.obtainedClue) {
                        mclue = text;
                    } else {
                        mclue = msgs.msgTryAgain.replace("%s", mOptions.itinerary.percentageClue);
                    }
                }
                break;
            case 3:
                messageColor = 3;
                message = msgs.mgsAllPhrases;
                $pzlLostGame.show();
                if (mOptions.itinerary.showClue) {
                    var text = mOptions.msgs.msgClue + " " + mOptions.itinerary.clueGame;
                    if (mOptions.obtainedClue) {
                        mclue = text;
                    } else {
                        mclue = msgs.msgTryAgain.replace("%s", mOptions.itinerary.percentageClue);
                    }
                }
                break;
            default:
                break;
        }
        $eXePuzzle.showMessage(messageColor, message, instance, true);
        $pzlOverNumCards.html(msgs.msgActivities + ": " + mOptions.puzzlesGame.length);
        $pzlOverHits.html(msgs.msgHits + ": " + mOptions.hits);
        $pzlOverErrors.html(msgs.msgErrors + ": " + mOptions.errors);
        $pzlOverScore.html(msgs.msgScore + ": " + ((mOptions.hits / mOptions.numberQuestions) * 10).toFixed(2));
        $pzlGameOver.show();
        $pzlCubierta.show();
        $("#pzlShowClue-" + instance).hide();
        if (mOptions.itinerary.showClue) {
            $eXePuzzle.showMessage(3, mclue, instance, true);
        }
    },
    shuffleAds: function (arr) {
        for (var j, x, i = arr.length; i; j = parseInt(Math.random() * i), x = arr[--i], arr[i] = arr[j], arr[j] = x);
        return arr;
    },

    getRetroFeedMessages: function (iHit, instance) {
        var mOptions = $eXePuzzle.options[instance],
            sMessages = iHit ? mOptions.msgs.msgSuccesses : mOptions.msgs.msgFailures;
        sMessages = sMessages.split("|");
        return sMessages[Math.floor(Math.random() * sMessages.length)];
    },
    loadMathJax: function () {
        if (!window.MathJax) {
            window.MathJax = $exe.math.engineConfig;
        }
        var script = document.createElement("script");
        script.src = $exe.math.engine;
        script.async = true;
        document.head.appendChild(script);
    },
    updateLatex: function (mnodo) {
        setTimeout(function () {
            if (typeof MathJax != "undefined") {
                try {
                    if (MathJax.Hub && typeof MathJax.Hub.Queue == "function") {
                        MathJax.Hub.Queue(["Typeset", MathJax.Hub, "#" + mnodo]);
                    } else if (typeof MathJax.typeset == "function") {
                        var nodo = document.getElementById(mnodo);
                        MathJax.typesetClear([nodo]);
                        MathJax.typeset([nodo]);
                    }
                } catch (error) {
                    console.log("Error al refrescar cuestiones");
                }
            }
        }, 100);
    },
    updateScore: function (correctAnswer, instance) {
        var mOptions = $eXePuzzle.options[instance],
            obtainedPoints = 0, 
            sscore = 0;
        if (correctAnswer) {
            mOptions.hits++;
            obtainedPoints = 10 / mOptions.puzzlesGame.length;
        } else {
            mOptions.errors++;
        }
        mOptions.score = mOptions.score + obtainedPoints;
        sscore = mOptions.score % 1 == 0 ? mOptions.score : mOptions.score.toFixed(2);
        $("#pzlPNumber-" + instance).text(mOptions.puzzlesGame.length - mOptions.hits - mOptions.errors);
        $("#pzlPErrors-" + instance).text(mOptions.errors);
        $("#pzlPScore-" + instance).text(sscore);
        $("#pzlPHits-" + instance).text(mOptions.hits);
        if ((mOptions.score / mOptions.puzzlesGame.length) * 100 > mOptions.itinerary.percentageClue) {
            mOptions.obtainedClue = true;
        }
        $eXePuzzle.saveEvaluation(instance);

    },
    updateScoreRepeat: function (instance) {
        var mOptions = $eXePuzzle.options[instance],
            obtainedPoints=  10 / mOptions.puzzlesGame.length, 
            sscore = 0;
        mOptions.score = mOptions.score - obtainedPoints;
        sscore = mOptions.score % 1 == 0 ? mOptions.score : mOptions.score.toFixed(2);
        $("#pzlPNumber-" + instance).text(mOptions.puzzlesGame.length - mOptions.hits - mOptions.errors);
        $("#pzlPErrors-" + instance).text(mOptions.errors);
        $("#pzlPScore-" + instance).text(sscore);
        $("#pzlPHits-" + instance).text(mOptions.hits);
        if ((mOptions.score / mOptions.puzzlesGame.length) * 100 > mOptions.itinerary.percentageClue) {
            mOptions.obtainedClue = true;
        }
        $eXePuzzle.saveEvaluation(instance);

    },
    getMessageErrorAnswer: function (instance) {
        return $eXePuzzle.getRetroFeedMessages(false, instance);
    },
    showMessage: function (type, message, instance, end) {
        var mOptions = $eXePuzzle.options[instance],
            colors = ["#555555", $eXePuzzle.borderColors.red, $eXePuzzle.borderColors.green, $eXePuzzle.borderColors.blue, $eXePuzzle.borderColors.yellow],
            color = colors[type],
            $pzlMessage = $("#pzlMessage-" + instance);
        $pzlMessage.html(message);
        $pzlMessage.css({
            color: color,
            "font-style": "bold",
        });
        $pzlMessage.show();
        if (end) {
            $pzlMessage.hide();
            color = 1;
            if (mOptions.score >= 6) {
                color = 2;
            }
            $("#pzlMesasgeEnd-" + instance).html(message);
            $("#pzlMesasgeEnd-" + instance).css({
                color: color,
            });
            $eXePuzzle.showMessage(message);
        }
    },

    supportedBrowser: function (idevice) {
        var ua = window.navigator.userAgent,
            msie = ua.indexOf("MSIE "),
            sp = true;
        if (msie > 0) {
            var ie = parseInt(ua.substring(msie + 5, ua.indexOf(".", msie)), 10);
            if (ie < 10) {
                var bns =
                    $("." + idevice + "-bns")
                        .eq(0)
                        .text() || "Your browser is not compatible with this tool.";
                $("." + idevice + "-instructions").text(bns);
                sp = false;
            }
        }
        return sp;
    },
    extractURLGD: function (urlmedia) {
        var sUrl = urlmedia;
        if (urlmedia.toLowerCase().indexOf("https://drive.google.com") == 0 && urlmedia.toLowerCase().indexOf("sharing") != -1) {
            sUrl = sUrl.replace(/https:\/\/drive\.google\.com\/file\/d\/(.*?)\/.*?\?usp=sharing/g, "https://docs.google.com/uc?export=open&id=$1");
        }
        return sUrl;
    },
};
$(function () {
    $eXePuzzle.init();
});
