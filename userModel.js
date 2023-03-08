const connectDB = require('./dbConnection');
const bcrypt = require('bcryptjs');

const User  = class User {
    constructor(name, email, password){
        this.name = name
        this.email = email
        this.password = password
    }

    async save() {
        try{
            const hashedPassword = await bcrypt.hash(this.password, 10)
            const db = await connectDB()
            const result = await db.collection('users').insertOne({name: this.name, email: this.email, password: hashedPassword})
            const user = await db.collection('users').findOne({_id: result.insertedId}, {projection: {name: 1, email: 1, _id:0}})
            return user
        } 
        catch(err){
            console.log('Error in creating user');
            console.log(err);
            return null
        }
    }

    static async findUser(email, password) {
        try{
            const db = await connectDB()
            const query = {email: email}
            const user = await db.collection('users').findOne({email: email})
            if(!user){
                return null
            }
            const userPassword = user.password
            const isMatched = await bcrypt.compare(password, userPassword)
            if(!isMatched){
                return null
            }
            return {name: user.name, email: user.email}
        }
        catch(err){
            console.log('Error in Finding User');
            console.log(err)
            return null

        }
    }
}

module.exports = User