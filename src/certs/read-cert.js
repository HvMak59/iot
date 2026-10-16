const { X509Certificate } = require('crypto');
const { readFileSync } = require('fs');

const cert = new X509Certificate(readFileSync('ca-cert.pem'));

console.log('Subject   :', cert.subject);
console.log('Issuer    :', cert.issuer);
console.log('Valid from:', cert.validFrom);
console.log('Valid to  :', cert.validTo);
console.log('Is CA     :', cert.ca);
console.log('SAN       :', cert.subjectAltName);
console.log('Fingerprint256:', cert.fingerprint256);