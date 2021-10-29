const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const Picture = require('../models/picture');


mongoose.connect('mongodb://localhost:27017/better_instagram', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});
const sample = array => array[Math.floor(Math.random() * array.length)];


const seedDB = async () => {
    await Picture.deleteMany({});
    for (let i = 0; i < 50; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const pic = new Picture({
            author: '5fe1b74befa38b2b547ffe21',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quibusdam dolores vero perferendis laudantium, consequuntur voluptatibus nulla architecto, sit soluta esse iure sed labore ipsam a cum nihil atque molestiae deserunt!',
            price,
            geometry: {
                type: "Point",
                coordinates: [-113.1331, 47.0202]
            },
            images:[
                {
                  url: 'https://res.cloudinary.com/dfa7qulez/image/upload/v1609074408/Project/nlpcbvmins0yhbxciyfr.jpg',
                  filename: 'Project/nlpcbvmins0yhbxciyfr'
                },
                {
                  url: 'https://res.cloudinary.com/dfa7qulez/image/upload/v1609074409/Project/hhsn7tu18u9kcf1nflzo.jpg',
                  filename: 'Project/hhsn7tu18u9kcf1nflzo'
                }
              ]
        })
        await pic.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})