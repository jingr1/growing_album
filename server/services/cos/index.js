const COS = require('cos-nodejs-sdk-v5')
const config = require('../../config')

var cos = new COS({
    // 必选参数
    SecretId: config.cosSecretId,
    SecretKey: config.cosSecretKey,
    // 可选参数
    FileParallelLimit: 3,    // 控制文件上传并发数
    ChunkParallelLimit: 3,   // 控制单个文件下分片上传并发数
    ChunkSize: 1024 * 1024,  // 控制分片大小，单位 B
});
module.exports = cos
