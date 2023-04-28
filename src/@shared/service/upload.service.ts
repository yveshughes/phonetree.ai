import AWS from 'aws-sdk';

const s3 = new AWS.S3({
    accessKeyId: "AKIAX7CRDYXPQNRUYPNJ",
    secretAccessKey: "xkhWgYa06z0j1j2BxiNM9StszCUTCdAy1avTFY3x",
    region: 'us-east-1' // region of your bucket
});


module.exports = s3;