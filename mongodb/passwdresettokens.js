var mongodb = require('mongooseinit').mongodb;
var Schema = mongodb.Schema;

var passwdResetTokenSchema = new Schema({
  _creator : { type: ObjectId, ref: 'Developer' },
  id : ObjectId,
  name : String,
  url : String,
  callback : String,
  description : String,
  client : { id : String, secret : String},
  applyDate : { type: Date, default: Date.now }
}, { _id : false });


var PasswdResetToken = mongodb.model('PasswdResetToken', passwdResetTokenSchema);
