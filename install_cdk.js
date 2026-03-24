const { execSync } = require('child_process');
try {
    console.log('Starting installation of @angular/cdk@18...');
    execSync('npm install @angular/cdk@18 --save', { stdio: 'inherit' });
    console.log('Installation successful!');
} catch (error) {
    console.error('Installation failed:', error);
    process.exit(1);
}
