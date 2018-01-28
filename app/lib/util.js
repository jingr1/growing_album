function makeContent(type, content, description) {
        return {
          type: type,
          content: content,
          description: description,
        };
    }

module.exports = {
    // 一维数组转二维数组


    listToMatrix(list, elementsPerSubArray) {
        let matrix = [], i, k;
        let extname, type;

        for (i = 0, k = -1; i < list.length; i += 1) {
            if (i % elementsPerSubArray === 0) {
                k += 1;
                matrix[k] = [];
            }
            if(list[i] === 0){
                type = 'UNKNOW'
            }
            else{
                extname = list[i].toLowerCase().split('.').splice(-1)
                if(extname[0] === 'mp4'){
                    type = 'VIDIO'
                }
                else{
                    type = 'IMAGE'
                }
            }
            matrix[k].push(makeContent(type,list[i],''));
        }

        return matrix;
    },

    // 为promise设置简单回调（无论成功或失败都执行）
    always(promise, callback) {
        promise.then(callback, callback);
        return promise;
    },
};
