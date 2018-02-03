const config = require('../../config.js');
const { listToMatrix, always } = require('../../lib/util.js');
const request = require('../../lib/request.js');
const api = require('../../lib/api.js');

Page({
    data: {
        // 相册列表数据
        albumList: [],

        // 图片布局列表（二维数组，由`albumList`计算而得）
        layoutList: [],

        // 布局列数
        layoutColumnSize: 3,

        // 是否显示loading
        showLoading: false,

        // loading提示语
        loadingMessage: '',

        // 是否显示toast
        showToast: false,

        // 提示消息
        toastMessage: '',

        // 是否显示动作命令
        showActionsSheet: false,

        // 当前操作的图片
        imageInAction: '',

        // 图片预览模式
        previewMode: false,

        // 当前预览索引
        previewIndex: 0,

        //文件类型
        fileType:'',
    },

    // 显示loading提示
    showLoading(loadingMessage) {
        this.setData({ showLoading: true, loadingMessage });
    },

    // 隐藏loading提示
    hideLoading() {
        this.setData({ showLoading: false, loadingMessage: '' });
    },

    // 显示toast消息
    showToast(toastMessage) {
        this.setData({ showToast: true, toastMessage });
    },

    // 隐藏toast消息
    hideToast() {
        this.setData({ showToast: false, toastMessage: '' });
    },

    // 隐藏动作列表
    hideActionSheet() {
        this.setData({ showActionsSheet: false, imageInAction: '' });
    },

    onLoad() {
        this.renderAlbumList();

        this.getAlbumList().then((resp) => {
            if (resp.code !== 0) {
                // 图片列表加载失败
                return;
            }

            this.setData({ 'albumList': this.data.albumList.concat(resp.data) });
            this.renderAlbumList();
        });
    },

    // 获取相册列表
    getAlbumList() {
        this.showLoading('加载列表中…');
        setTimeout(() => this.hideLoading(), 1000);
        return request({ method: 'GET', url: api.getUrl('/list') });
    },

    // 渲染相册列表
    renderAlbumList() {
        let layoutColumnSize = this.data.layoutColumnSize;
        let layoutList = [];

        if (this.data.albumList.length) {
            layoutList = listToMatrix([0,0].concat(this.data.albumList), layoutColumnSize);

            let lastRow = layoutList[layoutList.length - 1];
            if (lastRow.length < layoutColumnSize) {
                let supplement = Array(layoutColumnSize - lastRow.length).fill(0);
                lastRow.push(...supplement);
            }
        }

        this.setData({ layoutList });
    },

    uploadMultiFile(filePaths,successUp,failUp,i,length){
      wx.uploadFile({
                    url: api.getUrl('/upload'),
                    filePath: filePaths[i],
                    name: 'image',
                    success: (resp) => {
                        successUp++;
                        let response = JSON.parse(resp.data);
                        if (response.code === 0) {
                            console.log(response);

                            let albumList = this.data.albumList;
                            albumList.unshift(response.data.imgUrl);

                            this.setData({ albumList });
                            this.renderAlbumList();

                            this.showToast('图片上传成功');
                        } else {
                            console.log(response);
                        }
                    },
                    fail: (res) => {
                        failUp ++;
                        console.log('fail', res);
                    },
                    complete: () => {
                        i ++;
                        if(i == length)
                        {
                          this.hideLoading();
                          this.showToast('总共'+successUp+'张上传成功,'+failUp+'张上传失败！');
                        }
                        else
                        {  //递归调用uploadDIY函数
                            this.uploadMultiFile(filePaths,successUp,failUp,i,length);
                        }
                    },
                });
    },
    // 从相册选择照片或拍摄照片
    chooseImage() {
        wx.chooseImage({
            count: 9,
            sizeType: ['original', 'compressed'],
            sourceType: ['album', 'camera'],

            success: (res) => {
                this.showLoading('正在上传图片…');

                console.log(api.getUrl('/upload'));
                var successUp = 0; //成功个数
                var failUp = 0; //失败个数
                var length = res.tempFilePaths.length; //总共个数
                this.uploadMultiFile(res.tempFilePaths,successUp,failUp,0,length);

            },
        });
    },

    // 从相册选择视频或拍摄视频
    chooseVidio() {
        wx.chooseVideo({
            sourceType: ['album', 'camera'],
            maxDuration: 60,
            camera: 'back',
            success: (res) => {
                this.showLoading('正在上传视频…');

                wx.uploadFile({
                    url: api.getUrl('/upload'),
                    filePath: res.tempFilePath,
                    name: 'image',

                    success: (res) => {
                        let response = JSON.parse(res.data);

                        if (response.code === 0) {
                            console.log(response);

                            let albumList = this.data.albumList;
                            albumList.unshift(response.data.imgUrl);

                            this.setData({ albumList });
                            this.renderAlbumList();

                            this.showToast('视频上传成功');
                        } else {
                            console.log(response);
                        }
                    },

                    fail: (res) => {
                        console.log('fail', res);
                    },

                    complete: () => {
                        this.hideLoading();
                    },
                });

            },
        });
    },
    // 进入预览模式
    enterPreviewMode(event) {
        if (this.data.showActionsSheet) {
            return;
        }

        let imageUrl = event.target.dataset.src;
        let previewIndex = this.data.albumList.indexOf(imageUrl);
        let extname = imageUrl.toLowerCase().split('.').splice(-1)

        this.setData({ previewMode: true, previewIndex: previewIndex,fileType: extname[0] });
    },

    // 退出预览模式
    leavePreviewMode() {
        this.setData({ previewMode: false, previewIndex: 0 });
    },

    // 进入预览模式
    updatePreviewMode(event) {
        if (this.data.showActionsSheet) {
            return;
        }

        let imageUrl = this.data.albumList[event.detail.current];
        let extname = imageUrl.toLowerCase().split('.').splice(-1)

        this.setData({ fileType: extname[0] });
    },
    // 显示可操作命令
    showActions(event) {
        this.setData({ showActionsSheet: true, imageInAction: event.target.dataset.src });
    },

    // 下载图片
    downloadImage() {
        console.log('download_image_url', this.data.imageInAction);
        let extname = this.data.imageInAction.toLowerCase().split('.').splice(-1)
        wx.getSetting({
            success(res) {
                if (!res.authSetting['scope.writePhotosAlbum']) {
                    wx.authorize({
                        scope: 'scope.writePhotosAlbum',
                        success() {
                            // 用户已经同意小程序使用录音功能，后续调用 wx.startRecord 接口不会弹窗询问
                            wx.saveVideoToPhotosAlbum()
                        }
                    })
                }
            }
        })
        if(extname[0] === 'mp4'){
            this.showLoading('正在保存视频…');
            wx.downloadFile({
                url: this.data.imageInAction,
                type: 'video',
                success: (resp) => {
                    wx.saveVideoToPhotosAlbum({
                        filePath: resp.tempFilePath,
                        success: (resp) => {
                            this.showToast('视频保存成功');
                        },

                        fail: (resp) => {
                            console.log('fail', resp);
                        },

                        complete: (resp) => {
                            console.log('complete', resp);
                            this.hideLoading();
                        },
                    });
                },

                fail: (resp) => {
                    console.log('fail', resp);
                },
            });
        }
        else{
            this.showLoading('正在保存图片…');
            wx.downloadFile({
                url: this.data.imageInAction,
                type: 'image',
                success: (resp) => {
                    wx.saveImageToPhotosAlbum({
                        filePath: resp.tempFilePath,
                        success: (resp) => {
                            this.showToast('图片保存成功');
                        },

                        fail: (resp) => {
                            console.log('fail', resp);
                        },

                        complete: (resp) => {
                            console.log('complete', resp);
                            this.hideLoading();
                        },
                    });
                },

                fail: (resp) => {
                    console.log('fail', resp);
                },
            });
        }
        this.setData({ showActionsSheet: false, imageInAction: '' });
    },

    // 删除图片
    deleteImage() {
        let imageUrl = this.data.imageInAction;
        let filepath = '/' + imageUrl.split('/').slice(3).join('/');

        this.showLoading('正在删除图片…');
        this.setData({ showActionsSheet: false, imageInAction: '' });

        request({
            method: 'POST',
            url: api.getUrl('/delete'),
            data: { filepath },
        })
        .then((resp) => {
            if (resp.code !== 0) {
                // 图片删除失败
                return;
            }

            // 从图片列表中移除
            let index = this.data.albumList.indexOf(imageUrl);
            if (~index) {
                let albumList = this.data.albumList;
                albumList.splice(index, 1);

                this.setData({ albumList });
                this.renderAlbumList();
            }

            this.showToast('图片删除成功');
        })
        .catch(error => {
            console.log('failed', error);
        })
        .then(() => {
            this.hideLoading();
        });
    },
});
