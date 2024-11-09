import { model, Schema } from "mongoose"

const employeeSchema = new Schema({
    name: {
        type: String,
        required: true,
        uppercase: true
    },
    email: {
        type: String,
        required: true,
        lowercase: true
    },
    
    mobile: {
        type: Number,
        required: true
    },
    designation: {
        type: String,
        required: true,
        lowercase:true
    },
    gender: {
        type: String,
        required: true,
        lowercase:true
    },
    course: {
        type: String,
        required: true,
        lowercase:true
    },
    avatar: {
        type: String,
        required: true
    }
})


export const Employee = model('Employee', employeeSchema)