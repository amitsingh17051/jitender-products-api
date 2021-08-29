import mongoose from 'mongoose';
const ProductSchema = new mongoose.Schema({
    title: String,
    category: String,
    priceRange: String,
    ageRange: String,
    productImage:String,
    productAuthor:String,
    userId: String,
    minPurchaseQty: String,
},{ timestamps: true });

const Product = mongoose.model('Product', ProductSchema);


export default Product;