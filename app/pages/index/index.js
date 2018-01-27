Page({
    // 前往相册页
    gotoAlbum() {
        wx.navigateTo({ url: '../album/album' });
    },

    data:{
        ages : ''
    },
    formatNumber(n){
        return (''+n)[1] ? n : '0' + n;
    },
    formatTime(t){
        return t.getFullYear() + '-' + this.formatNumber(t.getMonth() + 1) + '-' + this.formatNumber(t.getDate())  + ' ' + this.formatNumber(t.getHours()) + ':' +this.formatNumber(t.getMinutes()) + ':' + this.formatNumber(t.getSeconds());
    },
    onLoad() {
        let birthday = '2018-01-10 10:00:00'
        this.setData({ ages : this.getAge(birthday,this.formatTime(new Date()))
        });
    },

    getAge(beginStr, endStr) {
        var reg = new RegExp(
                /^(\d{1,4})(-|\/)(\d{1,2})\2(\d{1,2})(\s)(\d{1,2})(:)(\d{1,2})(:{0,1})(\d{0,2})$/);
        var beginArr = beginStr.match(reg);
        var endArr = endStr.match(reg);

        var days = 0;
        var month = 0;
        var year = 0;

        days = endArr[4] - beginArr[4];
        if (days < 0) {
            month = -1;
            days = 30 + days;
        }

        month = month + (endArr[3] - beginArr[3]);
        if (month < 0) {
            year = -1;
            month = 12 + month;
        }

        year = year + (endArr[1] - beginArr[1]);

        var yearString = year > 0 ? year + "岁" : "";
        var mnthString = month > 0 ? month + "月" : "";
        var dayString = days > 0 ? days + "天" : "";

        /*
         * 1 如果岁 大于等于1 那么年龄取 几岁
         * 2 如果 岁等于0 但是月大于1 那么 取几月
         * 3 如果天等于0天小于3天 取小时
         * 例如出生2天 就取 48小时
         */
        var result = "";
        if (year >= 1) {
            if (month >= 1) {
                result = days > 0 ? yearString + mnthString + dayString : yearString + mnthString;
                }
            else{
                result = days > 0 ? yearString + dayString : yearString;
            }

        } else {
            if (month >= 1) {
                result = days > 0 ? mnthString + dayString : mnthString;
            } else {
                var begDate = new Date(beginArr[1], beginArr[3] - 1,
                        beginArr[4], beginArr[6], beginArr[8], beginArr[10]);
                var endDate = new Date(endArr[1], endArr[3] - 1, endArr[4],
                        endArr[6], endArr[8], endArr[10]);

                var between = (endDate.getTime() - begDate.getTime()) / 1000;
                days = Math.floor(between / (24 * 3600));
                var hours = Math.floor(between / 3600 - (days * 24));
                var dayString = days > 0 ? days + "天" : "";
                result = days >= 3 ? dayString : days * 24 + hours + "小时";
            }
        }

        return result;
    },


});




