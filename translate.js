/*
 * 描述 : 翻译部分，内含单个翻译和全部翻译部分。
 * 参数 : e 触发动作, this 点击的按钮
 * 作者 : liubibo
 * */
function translate(e) {
    var thisFun = arguments.callee;
    var data = {url: "", data: {}};
    var $this = $(this);
    var option = !!e ? !!e.data ? e.data : "single" : "";
    var transSendReport = [];                                                                                           //用来收集异步休息，如果成功追加1，失败则为0；给全部翻译最后弹框提供数据信息。
    /*
     * 描述 : 当转入data为single,回调功能，用于单个翻译该内容，收集该条原文的value属性中数据，
     *      转html实体化之后传递到后台。
     * 参数 : $obj 触发动作按钮, hideTip向后台请求结果是否隐藏提示语。
     * 作者 : liubibo
     * */
    thisFun.single = function ($obj, hideTip) {
        var t = $obj.closest('.msg').find('.content').attr('value');
        var resultData;
        var ret = "";
        var tipWord = "翻译成功";
        data.data.content =
            $('<div>' + $obj.closest('.msg').find('.content').attr('value') + '</div>').html();

        thisFun.checkType($obj);
        thisFun.countTrans(data.data.translator, true);
        thisFun.lastTrans(data.data.translator);
        data.data.to = thisFun.getLang("transLang", data.data.translator);
        thisFun.send(data, $obj, hideTip);
    };
    /*
     * 描述 : 传递给后台数据的函数，如果成功，则将数据转表情到前台，同时选择性弹出提示信息。
     * 参数 : $obj 触发动作按钮
     * 作者 : liubibo
     * */
    thisFun.sendReply = function (locData, $obj, hideTip) {
        $.ajax({
            url: ROOT_URL + locData.url,
            type: 'POST',
            data: locData.data,
            dataType: 'JSON',
            success: function (data) {
                var tipWord;
                if (data.state === 1) {
                    var tgt = data.tgt.replace(/\[\/\s?[：:]\s?(00[0-9])\]|\[\/\s?[：:]\s?(0[1-9][0-9])\]/g, "/:$1$2");   //将表情由[/:000]或者[/：000]或者[/:099] 或者[/ ：099]的多种情况转为/:009格式
                    tgt = tgt.replace(/(^\s?")|("$)/, "");
                    $.each(smileys.smileysJson, function (i, t) {
                        var regE = new RegExp(t.shortCut, "g");                                                        //将表情由/:000转为[Smile]格式
                        tgt = tgt.replace(regE, '[' + t.meaning + ']');
                    });
                    $obj.closest('form').find('[name="content"]').val(tgt).text(tgt);
                    tipWord = "翻译成功";
                    transSendReport.push(1);
                    $obj.closest('.msg').removeClass('failed');
                } else {
                    $obj.closest('.msg').addClass('failed');
                    tipWord = "翻译失败";
                    transSendReport.push(0);
                }
                !hideTip ? window.L.open('tip')(tipWord, 3000) : "";
            },
            error: function (error) {
                $obj.closest('.msg').addClass('failed');
                !hideTip ? window.L.open('tip')("翻译失败", 3000) : "";
                transSendReport.push(0);
            }
        });
    };
    /*
     * 描述 : 回复部分点击翻译按钮，进行回复内容进行翻译。将表情由[Smile]格式转为【/:000】或者【/：000】或者【/:099】 或者【/ ：099】，
     *      后台翻译之后，中文【】会转为英文[]，避免英文会被可以去掉。如果翻译内容为空，则不进行后台翻译。
     * 参数 : $obj 触发动作jq按钮
     * 作者 : liubibo
     * */
    thisFun.reply = function ($obj) {
        var plat = thisFun.bestTrans();
        var val = $obj.closest('form').find('textarea').val();
        if (val.match(/^\s*$/)) {
            L.open('tip')('内容不能为空', 300);
            return false;
        }
        data.data.content = val;
        $.each(smileys.smileysJson, function (i, t) {
            var regE = new RegExp("\\[" + t.meaning + "\\]", "g");
            data.data.content = data.data.content.replace(regE, '【' + t.shortCut + '】');                                //将表情由[Smile]格式转为【/:000】或者【/：000】或者【/:099】 或者【/ ：099】
        });
        data.data.to = thisFun.getLang("transLangReply", plat);
        thisFun.checkType(plat);
        thisFun.sendReply(data, $obj);
    };
    /*
     * 描述 : 检测各个平台，不同平台的回调地址暂时一致。添加url属性到data对象，同时会添加translator属性为平台拼音。
     * 参数 : $obj 触发动作按钮
     * 作者 : liubibo
     * */
    thisFun.checkType = function ($obj) {
        var paltform = {
            "google": "/index.php?c=show_infoMgmt_com&a=translate",
            "baidu": "/index.php?c=show_infoMgmt_com&a=translate",
            "youdao": "/index.php?c=show_infoMgmt_com&a=translate",
            "bing": "/index.php?c=show_infoMgmt_com&a=translate"
        };
        if (typeof $obj === "string") {
            $.each(paltform, function (i, t) {
                if ($obj === i) {
                    data.url = t;
                    data.data.translator = i;
                }
            });
        } else {
            $.each(paltform, function (i, t) {
                if ($obj.hasClass(i)) {
                    data.url = t;
                    data.data.translator = i;
                }
            });
        }
    };
    /*
     * 描述 : 传递给后台数据的函数，如果成功，则将数据转表情到前台，同时选择性弹出提示信息。
     * 参数 : $obj 触发动作按钮
     * 作者 : liubibo
     * */
    thisFun.send = function (locData, $obj, hideTip) {
        $.ajax({
            url: ROOT_URL + locData.url,
            type: 'POST',
            data: locData.data,
            dataType: 'JSON',
            success: function (data) {
                var tipWord;
                if (data.state === 1) {
                    var $msgTrans = $obj.closest('.msg').find('.msg-trans');
                    var tgt = data.tgt && data.tgt.replace(/\/\s?[：:]\s?00[0-9]|\/\s?[：:]\s?0[1-9][0-9]/g,
                            "<img src='http://ae01.alicdn.com/wimg/common/single/emotions/\$1\$2.gif'></img>");
                    tgt = tgt.replace(/(^\s?")|("$)/ig, "");                                                            //去除bing 翻译中会两端都有""
                    if ($msgTrans.length > 0) {                                                                         //如果页面中以及有对应数据的，直接替换内容。
                        $msgTrans.html(tgt);
                    } else {
                        var $msg = $('<div class="msg-trans">' + tgt + '</div>');
                        $msg.appendTo($obj.closest('.msg'));
                    }
                    tipWord = "翻译成功";
                    transSendReport.push(1);
                    $obj.closest('.msg').removeClass('failed');
                } else {
                    $obj.closest('.msg').addClass('failed');
                    tipWord = "翻译失败";
                    transSendReport.push(0);
                }
                !hideTip ? window.L.open('tip')(tipWord, 3000) : "";
            },
            error: function (error) {
                $obj.closest('.msg').addClass('failed');
                !hideTip ? window.L.open('tip')("翻译失败", 3000) : "";
                transSendReport.push(0);
            }
        });
    };
    /*
     * 描述 : 全部翻译按钮，根据按钮的callback属性，进行抓取对应的内容，之后向后台请求翻译。
     *      同时异步添加检查transSendReport的收集数据情况，超过15秒或者收集完毕直接弹出弹框。
     * 参数 : $obj 触发动作按钮
     * 作者 : liubibo
     * */
    thisFun.all = function ($obj) {
        var translator = $this.closest('#msg-history-component').find('.jsTranslator').val();
        var $all;
        if ($obj.attr('callback') === "1") {
            $all = $('.service-part,.customer-part');
        } else if ($obj.attr('callback') === "2") {
            $all = $('.service-part');
        } else if ($obj.attr('callback') === "3") {
            $all = $('.customer-part');
        }
        var checkEnd = setTimeout(function () {
            !!checkSend ? clearInterval(checkSend) : "";
            window.L.open('tip')('翻译超时,', 3000);
        }, 15000);
        var checkSend = setInterval(function () {
            if (transSendReport.length >= $all.length) {
                var succ = 0, failed = 0;
                !!checkSend ? clearInterval(checkSend) : "";
                $.each(transSendReport, function (i, t) {
                    if (t === 1) {
                        succ += 1;
                    } else {
                        failed += 1;
                    }
                });
                clearTimeout(checkEnd);
                window.L.open('tip')('翻译成功' + succ + '条，失败' + failed + '条', 3000);
            }
        }, 400);
        $all.each(function () {
            var $thisTrans = $(this).find('.jsTranslate.' + translator);
            thisFun.single($thisTrans, true);
        });
    };
    /*
     * 描述 : 根据各平台的点击翻译次数来存储（全部翻译存储次数为翻译几条），键名为翻译按钮所在区域。
     * 参数 :
     *      trans : 为平台，如果有，则查询单个平台数据，返回 { baidu: 3 }，如果没有，返回最大的数量的平台和次数
     *      store : 为存储数据，如果有，存储数据的次数，没有则为查询
     * 备注 : 保存结构
     *      countTrans :
     *          {"msg-history-component": 区域ID
     *              {"baidu":1,"google":2,"youdao":3} 对应平台和数量
     *          }
     * 作者 : liubibo
     * */
    thisFun.countTrans = function (trans, store) {
        var locData = thisFun.storedMode('countTrans');
        var areaId = "msg-history-component";
        var areaVal;
        var maxTrans = {};
        if (locData) {
            locData = JSON.parse(locData);
            areaVal = !!locData[areaId] ? locData[areaId] : "";
        } else {
            areaVal = {};
            !!trans ? areaVal[trans] = 0 : "";
            locData = {};
            locData[areaId] = areaVal;
        }
        if (trans) {
            if (!areaVal[trans]) {
                areaVal[trans] = 0;
            }
            if (store) {
                areaVal[trans]++;
                thisFun.storedMode('countTrans', JSON.stringify(locData));
            }
            return areaVal[trans];
        } else {
            if (areaVal) {
                $.each(areaVal, function (i, t) {
                    if (!!Object.keys(maxTrans) && maxTrans[Object.keys(maxTrans)[0]]) {
                        if (maxTrans[Object.keys(maxTrans)[0]] < t) {
                            maxTrans = {};
                            maxTrans[i] = t;
                        }
                    } else {
                        maxTrans[i] = t;
                    }
                });
            }
            return maxTrans;
        }
    };
    /*
     * 描述 : 最后选择的翻译平台，并且换回平台名，trans存在则直接保存平台
     * 备注 : 保存到localStorage的结构为 "lastTrans" : "baidu"
     * 作者 : liubibo
     * */
    thisFun.lastTrans = function (trans) {
        return thisFun.storedMode('lastTrans', trans);
    };
    /*
     * 描述 : 根据最多存储数量的平台和最后一次选择平台数量比较，如果超出2000个，选择最多的存储数量为默认翻译，否则为最后
     *      一次翻译。
     * 参数 :
     *      trans : 为平台，如果有，则查询单个平台数据，返回 { baidu: 3 }，如果没有，返回最大的数量的平台和次数
     *      store : 为存储数据，如果有，存储数据的次数，没有则为查询
     * 备注 : 返回结构为平台
     * 作者 : liubibo
     * */
    thisFun.bestTrans = function () {
        var best = "baidu";
        var count = thisFun.countTrans();
        var countName = !!Object.keys(count) ? Object.keys(count)[0] : "";
        var last = thisFun.lastTrans();
        last = last ? last : "baidu";
        if ( countName === last) {
            best = last;
        } else {
            var lastCount = thisFun.countTrans(last);
            if (parseFloat(count[countName]) > parseFloat(lastCount) + 2000) {
                best = countName;
            } else {
                best = last;
            }
        }
        return best;
    };
    /*
     * 描述 : 用于加载时候初始化回调，默认显示对应最佳平台。
     * 作者 : liubibo
     * */
    thisFun.initBestTrans = function () {
        var bestTrans = thisFun.bestTrans();
        var $translate = $('#msg-history-component').find('.jsTranslate');
        var $translator = $('#msg-history-component').find('.jsTranslator');
        var $transPlatForm = $('#msg-history-component').find('.jsTransPlatForm');
        $translator.val(bestTrans);
        $transPlatForm.filter('.' + bestTrans).addClass('active');
        $transPlatForm.not('.' + bestTrans).removeClass('active');
        $translate.filter('.' + bestTrans).addClass('active');
        $translate.not('.' + bestTrans).removeClass('active');
    };
    /*
     * 描述 : 用于获取翻译目标语言的代号。
     * 参数 :
     *      key : 种类 如（transLang, transLangReply）
     *      plat : 平台，用于辅助判断代号。
     * 作者 : liubibo
     * */
    thisFun.getLang = function (key, plat) {
        var lang;
        var langCode;
        var $lang;
        if (key === "transLang") {
            $lang = $('.jsTransLanger');
        } else if (key === "transLangReply"){
            $lang = $('.jsTransLangReplier');
        }
        lang = $lang.val() || $lang.find('option[select]').val() || $lang.find('option').eq(0).val();
        langCode = thisFun.getLangCode(lang, plat);
        return langCode;
    };
    /*
     * 描述 : 用于点击历史信息翻译语言，同时更新对应select和本地存储。
     * 作者 : liubibo
     * */
    thisFun.transLang = function ($obj) {
        var lang = $obj.attr('trans-lang');
        var $transLang = $('#msg-history-component').find('.jsTransLang');
        var $transLanger = $('#msg-history-component').find('.jsTransLanger');
        thisFun.lastLang("lastLang", lang);
        $transLanger.val(lang);
        $transLang.filter('.' + lang).addClass('active');
        $transLang.not('.' + lang).removeClass('active');
    };
    /*
     * 描述 : 用于点击回复编辑翻译语言，同时更新对应select和本地存储。
     * 作者 : liubibo
     * */
    thisFun.transLangReply = function ($obj) {
        var lang = $obj.attr('trans-lang');
        var $transLangReply = $('#msg-history-component').find('.jsTransLangReply');
        var $transLangReplier = $('#msg-history-component').find('.jsTransLangReplier');
        thisFun.lastLang("lastLangReply", lang);
        $transLangReplier.val(lang);
        $transLangReply.filter('.' + lang).addClass('active');
        $transLangReply.not('.' + lang).removeClass('active');
    };
    /*
     * 描述 : 根据语言和平台，得到平台代码。
     * 作者 : liubibo
     * */
    thisFun.getLangCode = function (key, plat) {
        var ret = "";
        var codeMap = {
            "en": "en",
            "cn": "cn",
            "English": "en",
            "Spanish": "spa",
            "Russian": "ru",
            "Portuguese": "pt"
        };
        $.each(codeMap, function (i, t) {
            if (key === i) {
                if (typeof t === "string") {
                    ret = t;
                    return false;
                } else {
                    $.each(t, function (ind, ite) {
                        if (plat === ind) {
                            ret = ite;
                        }
                    });
                    if (ret === "") {                                                                                   //如果为空，选择other字段
                        ret = t.other || "";
                    }
                }
            }
        });
        return ret || key;
    };
    /*
     * 描述 : 初始化最适合的语言。
     * 作者 : liubibo
     * */
    thisFun.initBestLang = function () {
        var lastLang = thisFun.storedMode("lastLang");
        var lastLangReply = thisFun.storedMode("lastLangReply");
        var $transLang = $('#msg-history-component').find('.jsTransLang');
        var $transLanger = $('#msg-history-component').find('.jsTransLanger');
        var $transLangReply = $('#msg-history-component').find('.jsTransLangReply');
        var $transLangReplier = $('#msg-history-component').find('.jsTransLangReplier');
        $transLanger.val(lastLang);
        $transLang.filter('.' + lastLang).addClass('active');
        $transLang.not('.' + lastLang).removeClass('active');
        $transLangReplier.val(lastLangReply);
        $transLangReply.filter('.' + lastLangReply).addClass('active');
        $transLangReply.not('.' + lastLangReply).removeClass('active');
    };
    /*
     * 描述 : 获取最后选择的语言（历史消息和编辑消息）。
     * 作者 : liubibo
     * */
    thisFun.lastLang = function (key, trans) {
        var key = key ? key : "lastLang";
        return thisFun.storedMode(key, trans);
    };
    /**
     * 描述 : 从本地存储中存储对应的字段，数值为 true 或 false
     * 作者 : liubibo
     */
    thisFun.storedMode = function (key, data) {
        var loc = !!window.localStorage ? window.localStorage : "";
        if (loc) {
            if (data) {
                loc.setItem(key, data);
            } else {
                return loc.getItem(key);
            }
        } else {
            console.warn('浏览器不支持本地存储，不能展现完整模式');
        }
    };
    /**
     * 描述 : 用于点击全部翻译旁的对应平台类型按钮，关联着一个隐藏的select平台类型，对应数据修改，并且保存最后选择平台
     *      （lastTrans）到本地。
     * 参数 : $this 为当前点击按钮。
     * 作者 : liubibo
     */
    thisFun.platform = function ($this) {
        var plat = ["baidu", "youdao", "google", "bing"];
        var $translator = $this.closest('#msg-history-component').find('.jsTranslator');
        $.each(plat, function (i, t) {
            if ($this.hasClass(t)) {
                $translator.val(t);
                thisFun.lastTrans(t);
                return false;
            }
        });
        thisFun.initBestTrans();
    };
    if (option) {
        thisFun[option]($this);
    }
}