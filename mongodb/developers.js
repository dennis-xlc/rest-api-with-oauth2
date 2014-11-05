var mongodb = require('mongooseinit').mongodb;
var Schema = mongodb.Schema;

var developerSchema = new Schema({
  id : ObjectId,
  name : String,
  email : String,
  joinDate : { type: Date, default: Date.now },
  profile : {
    avatarImg : String,
    fullName : String,
    location : String,
    company : String,
    url : String
  }
}, { _id : false });


exports.Developer = mongodb.model('Developer', developerSchema);
