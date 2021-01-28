// ==UserScript==
// @name              hmlan
// @namespace         https://github.com/suliang20/hmlan-auto
// @version           0.2
// @description       直播自动发送消息!
// @author            suliang20
// @license           MIT
// @supportURL        https://github.com/suliang20/hmlan-auto
// @updateURL         https://github.com/suliang20/hmlan-auto/blob/main/hmlan.user.js
// @downloadURL       https://github.com/suliang20/hmlan-auto/blob/main/hmlan.user.js
// @match             *://m.hmlan.com/h5/live/share.html*
// @match             *://m.hmlan.com/h5/live/offlive.html*
// @require           https://cdn.bootcss.com/jquery/1.12.4/jquery.min.js
// @grant none
// ==/UserScript==

(function() {
    'use strict';

    // Your code here...

    //  定时器
    var interval;
    var autoTime = 0;
    var startFlat = false;

    (function() {
        // document.getElementsByTagName("option")[1].selected = true;
        // document.form1.bh.value = "ID:NO";
        // document.form1.mm.value = "passwd";

        //  添加autoSendMsgDiv
        document.querySelector('body').appendChild(createAutoDiv());

        //  绑定自动发送事件
        autoSendMsgStartTimeout();

        //  绑定手动发送事件
        SendMsgStart();

        //  绑定自动出价事件
        // autoBidEndInterval();
    })();

    /**
     * 创建自动发送消息容器
     * @returns {ChildNode}
     */
    function createAutoDiv() {
        var div = '<div id="autoSendMsg" style="position: fixed; width: 300px; height: 300px; top: 0; right: 0; ' +
            'background-color: red;">';
        div += '<p><label>时间</label><input type="text" id="autoTime" value="2"></p>';
        div += '<p><label>内容</label><input type="text" id="autoSendMsgText"></p>';
        div += '<p><buttom type="buttom" id="autoSendMsgButtom">自动发送开始</buttom></p>';
        div += '<p></p>';
        div += '<p><buttom type="buttom" id="SendMsgButtom">手动发送</buttom></p>';
        div += "</div>";

        let tempNode = document.createElement('div');
        tempNode.innerHTML = div;
        return tempNode.firstChild;
    }

    /**
     * 自动发送消息计时开始
     */
    function autoSendMsgStartTimeout() {
        document.querySelector('#autoSendMsgButtom').onclick = function() {
            //  自动发送消息计时结束
            autoSendMsgEndTimeout();
            autoSendMsgStart()
        };
    }

    /**
     * 手动发送消息
     * @constructor
     */
    function SendMsgStart() {
        document.querySelector('#SendMsgButtom').onclick = function() {
            //  自动发送消息计时结束
            autoSendMsgEnd();
            //  发送消息
            SendMsg();
        };
    }

    /**
     * 自动发送消息计时结束
     */
    function autoSendMsgEndTimeout() {
        document.querySelector('#autoSendMsgButtom').onclick = function() {
            autoSendMsgEnd();
        };
    }

    /**
     * 自动发送消息开始
     */
    function autoSendMsgStart() {
        document.querySelector('#autoSendMsgButtom').innerHTML = "自动发送结束";
        //  获取定时时间
        autoTime = document.querySelector('#autoTime').value;
        autoTime = parseInt(autoTime) * 1000;
        autoSendMsgTimeout();

    }

    /**
     * 自动发送消息定时器
     */
    function autoSendMsgTimeout() {
        if (autoTime > 0) {
            setTimeout(function() {
                //  发送消息
                SendMsg();
                var sleepTime = Math.round(Math.random() * autoTime);
                sleep(sleepTime);
                autoSendMsgTimeout();
            }, autoTime);
        }
    }

    /**
     * 自动发送消息结束
     */
    function autoSendMsgEnd() {
        document.querySelector('#autoSendMsgButtom').innerHTML = "自动发送开始";
        autoTime = 0;
        autoSendMsgStartTimeout();
    }

    /**
     * 发送消息
     */
    function SendMsg() {
        //获取聊天内容
        // var cmtValue = $(".commentInput").html();
        var cmtValue = document.querySelector('#autoSendMsgText').value;
        //图片表情转换符号
        $("#MsgEditText").html(replaceFaceCode(cmtValue));
        //获取文本格式
        var RecmtValue = $("#MsgEditText").text();

        if (RecmtValue == "") {
            appToast("内容不能为空");
            //  结束自动发送消息
            autoSendMsgEnd();
            return;
        } else {
            //粉丝标识
            if (IsAttention) {
                RecmtValue = RecmtValue + "##100000##"
            } else {
                RecmtValue = RecmtValue + "##000000##"
            }
            //判断@
            if (isC2C != "") {
                RecmtValue = RecmtValue.replace(isC2C, "");
                RecmtValue = RecmtValue.replace(/(^\s*)/g, "");
                RecmtValue = isC2C + "# " + RecmtValue;
            }
            let message = tim.createTextMessage({
                to: groupID,
                conversationType: TIM.TYPES.CONV_GROUP,
                payload: {
                    text: RecmtValue
                }
            });
            // 2. 发送消息
            let promise = tim.sendMessage(message);
            promise.then(function(imResponse) {
                // 发送成功
                appToast2("发送成功", 800);
                AppendIm(sessionStorage.getItem("local-username"), replaceFaceImg(RecmtValue), 3, MyRateTotal); //加入聊天信息
                isC2C = "";
                BlurInput();
                clickLayerMask();
            }).catch(function(imError) {
                // 发送失败
                appToast("发送失败");
                FocusInput();
                console.warn('sendMessage error:', imError);
            });
        }
    }



    /**
     * 自动出价计时开始
     */
    function autoBidStartInterval() {
        document.querySelector('#autoBidButtom').onclick = function() {
            autoBidStart();
        };
    }

    /**
     * 自动出价计时结束
     */
    function autoBidEndInterval() {
        document.querySelector('#autoBidButtom').onclick = function() {
            autoBidEnd();
        };
    }

    /**
     * 自动出价开始
     */
    function autoBidStart() {
        document.querySelector('#autoBidButtom').innerHTML = "自动出价结束";
        //  获取定时时间
        autoTime = document.querySelector('#autoTime').value;
        autoTime = parseInt(autoTime) * 1000;
        interval = window.setInterval(autoBid, autoTime);
        autoBidEndInterval();
        //  强制关闭自动发送消息
        autoSendMsgEnd();
    }

    /**
     * 自动出价结束
     */
    function autoBidEnd() {
        document.querySelector('#autoBidButtom').innerHTML = "自动出价开始";
        autoTime = 0;
        window.clearInterval(interval);
        autoBidStartInterval();
    }

    /**
     * 自动出价
     */
    function autoBid() {
        //  已经开始返回
        if (startFlat == true) {
            return;
        }
        startFlat = true;

        var sleepTime = Math.round(Math.random() * autoTime);
        sleep(sleepTime);

        //判断是否正在提交
        if (isBiding == true) {

            //  开始标记
            startFlat = false;

            return;
        } else {
            SubmitBid();
        }

        //  开始标记
        startFlat = false;
    }



    /**
     * 参数n为休眠时间，单位为毫秒:
     * @param n
     */
    function sleep(n) {
        var start = new Date().getTime();
        //  console.log('休眠前：' + start);
        while (true) {
            if (new Date().getTime() - start > n) {
                break;
            }
        }
        // console.log('休眠后：' + new Date().getTime());
    }

})();