import mongoose from 'mongoose';
const UserSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String,
    userImage:String,
});

const User = mongoose.model('User', UserSchema);


export default User;