function loadHistory(data) {
    var thisFun = arguments.callee;
    /*
     * 描述用于ajax获取数据。
     * 作者 : liubibo
     * */
    thisFun.getMessage = function (locData) {
        $.ajax({
            url: ROOT_URL + locData.url,
            type: 'POST',
            data: locData.sendObj,
            dataType: 'JSON',
            success: function (json) {
                if (json.state) {                                                                                      //默认执行语句，或者回调对应的函数
                    loadHistoryData.data = json.data;
                    loadHistoryData.loaded = true;
                    if (!locData.ajaxSuc) {
                        locData.data = json.data;
                        thisFun.categoryTL(locData);
                    } else {
                        locData.ajaxSuc();
                    }
                    if ( skinChanged.setCookies(skinChanged.key) == 0 ) {
                        relatedOrderSku();                                                                              //当客服聊天记录加载之后，回调相关订单和相关sku部分
                    }
                } else {
                    if (!locData.ajaxEmpty) {
                        var infoWord = locData.noContentInfo ? locDatanoContentInfo : "未搜索到该历史纪录";
                        var $info = $('<div class="bg-primary textC add-space small-padding small-distance">'
                            + infoWord + '</div>');
                        $(locData.target).html($info);
                    } else {
                        locData.ajaxEmpty();
                    }
                }
            },
            error: function () {
                if (!locData.ajaxErr) {
                    var info = $('<div class="bg-primary textC add-space small-padding small-distance">' +
                        '网络异常</div>');
                    $(locData.target).html(info);
                } else {
                    locData.ajaxErr();
                }

            }
        });
    };
    /*
     * 描述 : 用于加载html模板到页面
     * 作者 : liubibo
     * */
    thisFun.categoryTL = function (locData) {
        var tlCategory = $(locData.template).html();
        var renderer = Handlebars.compile(tlCategory);
        var result;
        Handlebars.registerHelper('reverseArr', function (msgList, options) {
            if ($.isArray(msgList) && msgList.length > 0) {
                return options.fn(msgList.reverse());
            } else if (msgList.constructor.name === "Object") {
                var tempArr = [];
                for (var key in msgList) {
                    tempArr.push(msgList[key]);
                }
                tempArr.reverse();
                return options.fn(tempArr);
            }
        });
        Handlebars.registerHelper("checkContent", function (val, options) {
            var ret = "";
            val.content = val.content.replace('< img >', '');
            $.each(val.filePath, function (i, t) {
                if (!!t.lPath) {
                    if (!!t.sPath) {
                        ret = options.fn({imgHref: t.lPath, imgSrc: t.sPath});
                    } else {
                        ret = options.inverse({imgHref: t.lPath});
                    }
                }
            });
            return ret;
        });
        /*
         * 描述 : 用于将带有图片表情的内容转成图片。
         * 作者 : liubibo
         * */
        Handlebars.registerHelper("contentWithImg", function (content, options) {
            var t = $('<p value="" class="content"></p>');
            var contentWithImg = content;
            contentWithImg = contentWithImg.replace(/(\r|\n)+/ig, "$1");                                                //去除空格
            contentWithImg = contentWithImg
                .replace(/(https?:\/\/[^\r\n\s]{1,300}\.[^\r\n\s]{1,300}\.(?:html|htm|asp|jsp|php))/ig,                 //转化url为点击链接
                    "<a target=\"_blank\" href=\"$1\">$1</a>"
                );
            contentWithImg = contentWithImg.replace(/\/:00([0-9])|\/:0([1-9][0-9])/g,
                "<img src='http://ae01.alicdn.com/wimg/common/single/emotions/\$1\$2.gif'></img>");
            t.attr('value', content);
            t.html(contentWithImg);
            return t.get(0).outerHTML;
        });
        result = renderer(locData.data);
        draft = locData.data.draft ? locData.data.draft : "";
        $(document.getElementById('orderMsgData').elements['content']).attr('origin-value', draft)
            .val(locData.data.draft);                                                                                   //将草稿放入输入框(TigerYum.)
        $('.jsChangeRank').removeClass('tag-icon-0')
            .addClass('tag-icon-' + locData.data.msgData.params.rank).data('rank', locData.data.msgData.params.rank);   //初始化标签
        if (locData.prepend === false || locData.prepend === "false") {
            $(locData.target).html(result);
        } else if (locData.prepend === true || locData.prepend === "true") {
            $(locData.target).prepend(result);
        } else {
            $(locData.target).append(result);
        }
    };
    thisFun.getMessage(data);
}