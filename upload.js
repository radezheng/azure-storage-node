var azureStorage = require('azure-storage');

var blobUri = 'https://stobj.blob.core.chinacloudapi.cn';
var SAS_TOKEN = generateSasToken('testupload','testfile', azureStorage.BlobUtilities.SharedAccessPermissions.WRITE ).token
var blobService = azureStorage.createBlobServiceWithSas(blobUri, SAS_TOKEN);

var file = "D:/Training/OneDrive_10_20_2016.zip";


var customBlockSize = 1024 * 1024 * 4;//4M
blobService.singleBlobPutThresholdInBytes = customBlockSize;

var finishedOrError = false;
var speedSummary = blobService.createBlockBlobFromLocalFile('testupload', "testfile", file, 
                        {blockSize : customBlockSize,parallelOperationThreadCount:4}, function(error, result, response) {
    finishedOrError = true;
    if (error) {
        // Upload blob failed
        console.log(error);
    } else {
        // Upload successfully
        console.log('completed');
    }
});
refreshProgress();

//显示进度
function refreshProgress() {
    setTimeout(function() {
        if (!finishedOrError) {
            var process = speedSummary.getCompletePercent();
            console.log("total:" + speedSummary.getTotalSize() + "| " + 
                        "speed:" + speedSummary.getSpeed() + "| " + 
                        "percent:" + speedSummary.getCompletePercent() + "| " + 
                        "uploaded:" + speedSummary.getCompleteSize() 
                        );
            refreshProgress();
        }
    }, 1000);
}

//生成有效期2小时的token
function generateSasToken(container, blobName, permissions) {
        var connString = process.env.AzureWebJobsStorage;
        var blobService = azureStorage.createBlobService(connString);
    
        // Create a SAS token that expires in an hour
        // Set start time to five minutes ago to avoid clock skew.
    
        var startDate = new Date();
        startDate.setMinutes(startDate.getMinutes() - 5);
        var expiryDate = new Date(startDate);
    
        expiryDate.setMinutes(startDate.getMinutes() + 120);
        permissions = permissions || azureStorage.BlobUtilities.SharedAccessPermissions.READ;
    
        var sharedAccessPolicy = {
            AccessPolicy: {
                Permissions: permissions,
                Start: startDate,
                Expiry: expiryDate
            }
        };
        var sasToken = blobService.generateSharedAccessSignature(container, blobName, sharedAccessPolicy);
        return {
            token: sasToken,
            uri: blobService.getUrl(container, blobName, sasToken, true)
        };
    }
