const CONF = {
    // Node.js 监听的端口号
    port: '9993',
    ROUTE_BASE_PATH: '/applet',

    cosRegion: '',
    // SecretId
    cosSecretId: '',
    // SecretKey
    cosSecretKey: '',
    // Bucket 名称
    cosFileBucket: '',

    cosUploadFolder:'/'
}

CONF.cosDomain = (() => `https://${CONF.cosFileBucket}.file.myqcloud.com/`)()
module.exports = CONF
