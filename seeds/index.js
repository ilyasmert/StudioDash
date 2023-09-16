const mongoose = require('mongoose');
const Campground = require('../models/campground');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');

main().catch(err => console.log(err));

async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp');
}

const sample = (arr) => {
    return arr[Math.floor(Math.random() * arr.length)];
}

const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 300; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            author: '64f728eca2ce38c97801c127',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Repudiandae nostrum dolores distinctio sapiente autem perferendis animi sequi, porro doloribus dignissimos voluptas repellendus, laudantium explicabo consectetur officia placeat odio mollitia excepturi?',
            price,
            geometry: {
                type: 'Point',
                coordinates: [
                    cities[random1000].longitude,
                    cities[random1000].latitude
                ]
            },
            images: [
                {
                    url: 'https://res.cloudinary.com/dkpvl6dxa/image/upload/v1694373242/YelpCamp/xlr6pdnv0khqecmhngno.jpg',
                    filename: 'YelpCamp/xlr6pdnv0khqecmhngno'
                },
                {
                    url: 'https://res.cloudinary.com/dkpvl6dxa/image/upload/v1694373242/YelpCamp/vyvb88on17ykmffsw4vm.jpg',
                    filename: 'YelpCamp/vyvb88on17ykmffsw4vm'
                }
            ]
        })
        await camp.save();
    }
}

seedDB()
    .then(() => {
        mongoose.connection.close();
    })
