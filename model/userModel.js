const connectDB = require('../databaseConnection/dbConnection');
const { ObjectId } = require('mongodb');
const crypto = require('crypto');
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
            console.log('Error in creating user')
            if(err.code === 11000) {
                return 11000
            }
            return null
        }
    }

    static async Login(email, password) {
        try{
            const db = await connectDB()
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

    static async EmailResetToken(email) {
        try{
            const db = await connectDB()
            const user = await db.collection('users').findOne({email: email})
            if(!user){
                return null
            }
            const resetToken = await crypto.randomBytes(32).toString('hex')
            const resetTokenExpiration = Date.now() + 600000
            user.resetToken = resetToken
            user.resetTokenExpiration = resetTokenExpiration
            await db.collection('users').updateOne({email}, {$set: {resetToken, resetTokenExpiration}})
            return { userId: user._id, resetToken}
        }
        catch(err){
            console.log('Error in Finding User');
            console.log(err)
            return null

        }
    }

    static async FindResetToken(userId, resetToken) {
        try {
            const _id = new ObjectId(userId)
            const db = await connectDB()
            const user = await db.collection('users').findOne({_id: _id, resetToken, resetTokenExpiration: {$gt:Date.now()}})
            if(!user){
                return null
            }
            return true

        }
        catch (err) {
            console.log(err);
            return null
        }
    }

    static async ResetPassword(userId, resetToken, password) {
        try {
            const _id = new ObjectId(userId)
            const db = await connectDB()
            const user = await db.collection('users').findOne({_id: _id, resetToken, resetTokenExpiration: {$gt:Date.now()}})
            if(!user){
                return null
            }
            const hashedPassword = await bcrypt.hash(password, 10)
            await db.collection('users').updateOne({_id: _id}, {$set: {password: hashedPassword, resetToken: null, resetTokenExpiration: null}})
            // const updated = await db.collection('users').findOne({_id: _id})
            return true

        }
        catch (err) {
            console.log(err);
            return null
        }
    }
}

module.exports = User