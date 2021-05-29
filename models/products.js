import mongoose from 'mongoose';
const ProductSchema = new mongoose.Schema({
    title: String,
    category: String,
    priceRange: String,
    productImage:String,
    productAuthor:String,
    minPurchaseQty: String,
});

const Product = mongoose.model('Product', ProductSchema);


export default Product;