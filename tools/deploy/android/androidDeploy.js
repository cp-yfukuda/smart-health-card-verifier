const process = require('process');
const { publish } = require("./publisher")
const { accessSync, constants } = require('fs');
var path = require('path');
const args = require('minimist')(process.argv.slice(2))
/* Deployment support */
/* argument 
  --googleApiKeyFilePath=<google api json key file path> \
  --packageName=<package name> \
  --aabFilePath=<aabFilePath> \ 
  --track=internal
  --status=draft
  */

console.info('args = ' + JSON.stringify( args))

function exists(filePath) {  
  var res = false;
  try {
    accessSync(filePath, constants.F_OK)
    res = true
  } catch(e) {
    ;;
  }
  console.info( "res ============ " + res )
  return res;
}

const validate = async ()=> {
  if( !!!googleApiKeyFilePath ) {
    throw  new Error( "--googleApiKeyFilePath=<api key json>  argument is missing")
  }
  if( !exists( googleApiKeyFilePath ) ){
   throw  new Error( `googleApiKeyFilePath: ${googleApiKeyFilePath} does not exists`) 
  }
  if( !!!aabFilePath ) {
    throw  new Error( "--aabFilePath=<directory to the aab>")
  }
  if( !exists( aabFilePath ) ){
   throw  new Error( `aabFilePath: ${aabFilePath} does not exists` ) 
  }

}

const upload = async ()=> {
  validate();
  try{
    publish({
      keyFile: googleApiKeyFilePath,
      packageName: packageName,
      aabFile: aabFilePath,
      track: track,aabFilePath, 
      status: status,
    })
    .then(() => {
      console.log("Success");
    })
    .catch(error => {
      console.error(error);
    });
  }catch( e ) {
      console.log('file Does not exist' + e );
  }
}

const rootPath =  process.cwd();
const packageName          = args['packageName']
const googleApiKeyFilePath = args['googleApiKeyFilePath']
const aabFilePath = args['aabFilePath']
const track       = args['track'] || 'internal'
const status      = args['status'] || 'completed'

console.log(`rootPath:  ${rootPath}` );
console.log(`Uploading pakcage:  ${packageName}` );
console.log(`track:  ${track}` );
console.log(`googleApiKeyFilePath:  ${googleApiKeyFilePath}` );
console.log(`aabFilePath:  ${aabFilePath}` );
console.log(`status:  ${status}` );

upload()
