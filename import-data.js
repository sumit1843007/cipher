// mode 
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

const fs = require('fs');
const tourSchema = require('./model/tour');
const mongoose = require('mongoose');

const toursData = JSON.parse(fs.readFileSync(`./data.json`));

const DB = process.env.URL.replace('<PASSWORD>', process.env.PASSWORD);

mongoose.connect(DB).then(() => {
    console.log(" db connection established");
}).catch(err => {
    console.log(err);
});


const importData = async () => {
    try {
        await tourSchema.create(toursData);
        console.log("added data to db");
    } catch (error) {
        if (error) {
            console.log("failed to add data to db");
        }
    }
    process.exit();
};

const deleteData = async () => {
    try {
        await tourSchema.deleteMany();
        console.log("delete data to db");
    } catch (error) {
        if (error) {
            console.log("failed to delete data to db");
        }
    }
    process.exit();
};


if (process.argv[2] === '--import') {
    importData();
}
if (process.argv[2] === '--delete') {
    deleteData();
}
console.log(process.argv);
