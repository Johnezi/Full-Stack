import mongoose from "mongoose"

// Define the schema for a Container
const ContainerSchema = new mongoose.Schema({
  header: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  headerColor: { type: String, default: "white" } ,
  index: { type: Number, required: true }


});

// Export the Container model
export default mongoose.model("Container", ContainerSchema)
