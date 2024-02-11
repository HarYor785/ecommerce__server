import mongoose from "mongoose";

const subCategory = new mongoose.Schema({
    name: {
        type: String,
        unique: true,
    },
    slug: {
        type: String
    },
    description: {
        type: String,
    },
})

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
        unique: true,
    },
    subCategory: [subCategory],
    slug: {
        type: String,
    },
    description: {
        type: String,
    },
    attachment: { 
        type: String,
    },
},
{timestamps: true}
)

const Category = new mongoose.model("Category", categorySchema)

export default Category