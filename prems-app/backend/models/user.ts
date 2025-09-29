const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role:{ type:Number, enum: [0, 1], default: 0} // padrão admin
});

const UserModel  = mongoose.model('User', UserSchema, 'user');

export default UserModel;