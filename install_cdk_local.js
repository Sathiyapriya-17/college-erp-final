const https = require('https');
const fs = require('fs');
const { execSync } = require('child_process');

const url = 'https://registry.npmjs.org/@angular/cdk/-/cdk-18.2.0.tgz';
const dest = 'cdk.tgz';

console.log('Downloading @angular/cdk...');
const file = fs.createWriteStream(dest);
https.get(url, (response) => {
    response.pipe(file);
    file.on('finish', () => {
        file.close();
        console.log('Download complete. Installing locally...');
        try {
            execSync('npm install ./cdk.tgz --save', { stdio: 'inherit' });
            console.log('Installation successful!');
            fs.unlinkSync(dest);
        } catch (err) {
            console.error('Installation failed:', err);
        }
    });
}).on('error', (err) => {
    fs.unlinkSync(dest);
    console.error('Download failed:', err.message);
});
