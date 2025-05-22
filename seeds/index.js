const mongoose = require('mongoose');
const cities=require('./cities');
const {places,descriptors}=require('./seedHelpers');
const Campground = require('../models/campground');

mongoose.set('strictQuery', true);
mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp');

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    await Campground.deleteMany({});
    for(let i=0;i<300;i++){
        const random1000=Math.floor(Math.random()*1000);
        const price=Math.floor(Math.random()*20)+10;
        const camp=new Campground({
            author:'682b2cd6e96fb5630d28071f',
            location:`${cities[random1000].city},${cities[random1000].state}`,
            title:`${sample(descriptors)} ${sample(places)}`,
            description:'Lorem ipsum dolor sit amet consectetur adipisicing elit. Cum iusto, nostrum rem voluptas nesciunt ea, alias esse voluptatibus repellendus quos explicabo, distinctio recusandae consequatur voluptates quis id. Laborum, maiores veniam',
            price,
            geometry:{
                type:"Point",
                coordinates:[
                    cities[random1000].longitude,
                    cities[random1000].latitude,
                ]
            },
            images: [
                {
                    url: 'https://res.cloudinary.com/dmjokf4os/image/upload/v1747704863/YelpCamp/gf6bjnojoyitd8lx4ynb.png',
                    filename: 'YelpCamp/gf6bjnojoyitd8lx4ynb'
                },
                {
                    url: 'https://res.cloudinary.com/dmjokf4os/image/upload/v1747704862/YelpCamp/v3a4f2d8pje34curvbld.png',
                    filename: 'YelpCamp/v3a4f2d8pje34curvbld'
                }
            ]
        })
        await camp.save();
    }
}

seedDB()

// .then(() => {
//     mongoose.connection.close();
// })