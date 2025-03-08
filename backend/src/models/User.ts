import mongoose from "mongoose"

// Define the schema for a User
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }
})

// Export the User model
export default mongoose.model("User", UserSchema)