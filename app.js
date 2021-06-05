import express from 'express';
import path from 'path';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import multer from 'multer';
import fs from 'fs';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import ejs from "ejs";
import Product from './models/products.js';
import User from './models/users.js';

const storage = multer.diskStorage({
    destination: './uploads/',
    filename: function(req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
})

// init upload image
const upload = multer({
    storage: storage,
    limits: {filesize : 1000000},
    fileFilter: function(req,file,cb) {
        checkFileType(file,cb);
    }
}).single('productImage');

// Check file type
function checkFileType(file, cb) {
    const fileType = /jpeg|png|jpg|gif/;
    const extname = fileType.test(path.extname(file.originalname).toLowerCase());
    const mimetype = fileType.test(file.mimetype);

    if(mimetype && extname) {
        return cb(null,true)
    } else {
        cb('Error: images only excepted');
    }
}





const app = express();
app.use(cookieParser());
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(cors());
app.engine('html', ejs.renderFile);
app.set('view engine', 'html');

const __dirname = path.resolve(path.dirname(''));
const CONNECTION_URL = 'mongodb+srv://amitsingh:root@cluster0.iagif.mongodb.net/testproducts?retryWrites=true&w=majority';
const PORT = process.env.PORT || 3500;


// Get all Products
app.get('/api/products', async (req, res) => {
    try {
        const product = await Product.find();    
        res.status(200).json({
            product:product,
        });
        
    } catch (error) {
        res.status(404).json({ message: error.message,  content: 'hello2', });
    }

})

// Get Single product
app.get('/api/products/:id', async (req, res) => {  
    const id = req.params.id;
    try {
        const product = await Product.findById(id);
        res.status(200).json(product);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
})


// Create Product 
app.post('/api/product', verifyToken, async (req, res) => {
    console.log(req.body)
    jwt.verify(req.token, 'secretkey', async (err,authData) => {
        if(err) {
            res.status(403).json({
                message:err,
            })
        } else {
            const { title, category, priceRange, productImage, productAuthor, minPurchaseQty } = req.body;
            
            const newProduct = new Product({
                title,
                category,
                priceRange,
                productImage,
                productAuthor,
                minPurchaseQty
            });
            try {
                await newProduct.save();
                res.status(201).json(newProduct);
            } catch (error) {
                res.status(409).json({ message: error.message });
            }
        }
    });       
});

// Update Product
app.patch('/api/products/:id',verifyToken, async (req,res) => {
    jwt.verify(req.token, 'secretkey', async (err,authData) => {
        if(err) {
            res.status(403).json({
                message:err,
            })
        } else {
            try {
                const { title, category, priceRange, productImage, productAuthor, minPurchaseQty } = req.body;
                const id = req.params.id;
                
                const product = await Product.findById(id);
                if(product.productImage) {
                    const pathToFile = __dirname + '/uploads/' + product.productImage;
                    fs.unlink(pathToFile, function(err) {
                    if (err) {
                            throw err
                        } else {
                            console.log("Successfully deleted the file.")
                        }
                    })
                }

                if (!mongoose.Types.ObjectId.isValid(id)) {
                    res.status(404).json({id:id});
                }   
                const updatedProduct = { title, category, priceRange, productImage, productAuthor, minPurchaseQty, _id: id };
                await Product.findByIdAndUpdate(id, updatedProduct, { new: true });
                res.json(updatedProduct);
            } catch(error) {
                res.status(404).json({ message: error.message });
            }
        }
    });   
});



// Delete Product
app.delete('/api/products/:id', verifyToken, async (req,res) => {
    
    jwt.verify(req.token, 'secretkey', async (err,authData) => {
        if(err) {
            res.status(403).json({
                message:err,
            })
        } else {
            try {
                const id = req.params.id;
                
                const product = await Product.findById(id);
                if(product.productImage) {
                    const pathToFile = __dirname + '/uploads/' + product.productImage;
                    fs.unlink(pathToFile, function(err) {
                    if (err) {
                            throw err
                        } else {
                            console.log("Successfully deleted the file.")
                        }
                    })
                }

                if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send(`No post with id: ${id}`);
                await Product.findByIdAndRemove(id);
                res.json({ message: "Product deleted successfully." });
            } catch (error) {
                res.status(404).json({ message: error.message });
            }
        }
    });
});

// -----------------------------------------------------------------------------------------------------------------------------------------


// Get All Users
app.get('/api/users', verifyToken,  (req, res) => {
    jwt.verify(req.token, 'secretkey', async (err,authData) => {
        if(err) {
            res.status(403).json({
                message:err,
                content: 'hello',
            })
        } else {
            try {
                const users = await User.find();    
                res.status(200).json(users);
            } catch (error) {
                res.status(404).json({ message: error.message });
            }
        }   
    })     
})


// Get Single product
app.get('/api/users/:id', verifyToken, (req, res) => {
    jwt.verify(req.token, 'secretkey', async (err,authData) => {
       if(err) {
           res.status(403).json({
               message:err,
           })
       } else {
           
            const id = req.params.id;
            try {
                const user = await User.findById(id);
                
                res.status(200).json(user);
            } catch (error) {
                res.status(404).json({ message: error.message });
            }
       }
   });
})


// Create User
app.post('/api/user', verifyToken, async (req, res) => {
    jwt.verify(req.token, 'secretkey', async (err,authData) => {
        if(err) {
            res.status(403).json({
                message:err,
            })
        } else {
            const { username, email, password, userImage } = req.body;
            const newUser = new User({
                username,
                email,
                password,
                userImage,
            });
            try {
                await newUser.save();
                res.status(201).json(newUser);
            } catch (error) {
                res.status(409).json({ message: error.message });
            }
        }    
    }); 
}); 


// Delete users
app.delete('/api/users/:id', verifyToken, async (req,res) => {
    console.log(req.token);
    jwt.verify(req.token, 'secretkey', async (err,authData) => {
        if(err) {
            res.status(403).json({
                message:err,
                token:req.token,
            })
        } else {
            try {
                const id = req.params.id;
                if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send(`No post with id: ${id}`);
                await User.findByIdAndRemove(id);
                res.json({ message: "User deleted successfully." });
            } catch (error) {
                res.status(404).json({ message: error.message });
            }
        }
    });
});

// Update Product
app.patch('/api/users/:id', async (req,res) => {
    jwt.verify(req.token, 'secretkey', async (err,authData) => {
        if(err) {
            res.status(403).json({
                message:err,
            })
        } else {
            try {
                const { username, email, password, userImage } = req.body;;
                const id = req.params.id;
                if (!mongoose.Types.ObjectId.isValid(id)) {
                    res.status(404).json({id:id});
                }   
                const updatedUser = { username, email, password, userImage, _id: id };
                await User.findByIdAndUpdate(id, updatedUser, { new: true });
                res.json(updatedUser);
            } catch(error) {
                res.status(404).json({ message: error.message });
            }
        }
    });   
});

// Update Product
app.post('/api/uploadImage', verifyToken, async (req,res) => {
    jwt.verify(req.token, 'secretkey', async (err,authData) => {
        if(err) {
            res.status(403).json({
                message:err,
            })
        } else {
            try {
                //res.send('test');
                upload(req,res, (err) => {
                    if(err) {
                        res.render('/views/home.html', {
                            msg:err
                        });
                    } else {
                        res.status(201).json({
                            productImagePath: req.file.filename,
                        });
                    }
                })

            } catch(error) {
                res.status(404).json({ message: error.message });
            }
        }
    });   
});

app.use('/uploads', express.static('uploads'));


// Login the user to the dashboard
app.post('/login', async (req, res, next) => {
    const user = req.body;
    try {
        const userExist = await User.findOne({'username':req.body.username, 'password': req.body.password});
        
        if(userExist != null) {
            jwt.sign({user}, 'secretkey', (err,token) => {
                if(err) {
                    res.status(403).json({
                        message:err,
                    })
                } else {
                    res.cookie('jwt', token, {httpOnly: true});
                    res.redirect('/home');
                }
            });
        } else {
            res.status(401).json({
                message: 'Username or password is wrong please try again',
            })
        }
    } catch(error) {
        res.status(404).json({ message: error.message });
    }
})


// Get Single product
app.get('/', (req, res) => {
    //res.status(200).json({ message: 'Welcome to your personal api' });
    const jwtCookies = req.cookies;
    if(typeof jwtCookies.jwt === 'undefined') {
        res.sendFile('/views/login.html', { root: __dirname });
    } else {
        res.redirect('/home');
    }   

})

app.get('/home', async (req, res) => {
    
    const product = await Product.find();
    res.render(__dirname + "/views/home.html", {product:product});

})






// Token format
// Authorization: Bearer <access_token>

// Verify token
function verifyToken(req, res, next) {
    // get auth header value

    if(typeof  req.cookies !== 'undefined') {
        const parsedCookies = req.cookies;
        if(parsedCookies.jwt !== 'undefined') {
            req.token = parsedCookies.jwt;
            next();
        } else {
            // res.status(403).json({
            //     message: 'Not Authrized for this page'
            // })
            res.redirect('/');
        }
    } else {
        res.redirect('/');
    }

}



mongoose.connect(CONNECTION_URL, {useNewUrlParser:true, useUnifiedTopology: true}).then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on port: ${PORT}`);
    })
}).catch((error) => {
    console.log(error.message);
})

mongoose.set('useFindAndModify', false);