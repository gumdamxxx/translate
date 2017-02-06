loadHistory({
    "sendObj": {"orderId": 'ID_123456'},
    "template": "#chat-history",
    "target": "#msg-history-component",
    "url": "/index.php?c=show_infoMgmt_sm_orderMsg&a=getOrderMsgByOrderId",
    "prepend": false
});                                                                                                                     //ajax加载留言信息
translate();                                                                                                            //初始化翻译
translate.initBestTrans();                                                                                              //初始化最适合翻译平台
translate.initBestLang();                                                                                               //初始化最适合翻译语言