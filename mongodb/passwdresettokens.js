var mongodb = require('mongooseinit').mongodb;
var Schema = mongodb.Schema;

var passwdResetTokenSchema = new Schema({
  _creator : { type: ObjectId, ref: 'Developer' },
  expirationDate : Date
}, { id : false });


var PasswdResetToken = mongodb.model('PasswdResetToken', passwdResetTokenSchema);
