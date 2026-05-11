import express from "express";
import axios from "axios";
import dotenv from "dotenv";
 

const app = express();
const API_MAP = "http://api.openweathermap.org/geo/1.0/direct";
const API_WEATHER = "https://api.openweathermap.org/data/2.5/forecast";
dotenv.config();
const port = process.env.PORT;
const mapAPI = process.env.MAP_API;
const weatherAPI = process.env.WEATHER_API;


const dateConverter = (region, city) => {
let year;
let yearAPI;
let month;
let monthAPI;
let day;
let dayAPI;
let today = new Date();
const array = (today.toLocaleString("en-US", {
        timeZone: `${region}/${city}`
    })).split(/[/ ,]/);

array[1] = array[1] < 10? "0" + array[1] : array[1];
array[0] = array[0] < 10? "0" + array[0] : array[0];

let todayDate = `${array[2]}-${array[0]}-${array[1]}`;
const tomorrow = new Date(todayDate);
tomorrow.setDate(tomorrow.getDate() + 1);

year = (today.getFullYear()).toString();
month = tomorrow.getMonth() + 1;
monthAPI = month < 10 ? "0" + month.toString() : month.toString();
day = tomorrow.getDate();
dayAPI = day < 10 ? "0" + day.toString() : day.toString(); 

let realDate = `${year}-${monthAPI}-${dayAPI}`;
return realDate;
}

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", (req, res) => {
    res.render("index.ejs", {
        weather: "Rain or not",
    });
});

app.post("/submit", async (req, res) => {
    const cityName = req.body['cityName'];
    const cityConverter = cityName.replaceAll(" ", "_");
    const regionName = req.body['regionName'].replaceAll(' ', '_');

    let date = dateConverter(regionName, cityConverter);

    try {
        const responseMap = await axios.get(API_MAP, {
            params: {
                q: cityName,
                appid: mapAPI,
            }
        });
        const lat = responseMap.data[0].lat;
        const lon = responseMap.data[0].lon;
        console.log(lat, lon)
        const responseWeather = await axios.get(API_WEATHER, {
            params: {
                lat: lat,
                lon: lon,
                appid: weatherAPI,          
            } 
        });
        let rainCheck = '';
        const listArray = responseWeather.data.list;
        for (const element of listArray){
            let spiltElement = element.dt_txt.split(" ");
            if (date === spiltElement[0] && element.rain){
                rainCheck = 'It will rain';
                break;
            }
            else {
               rainCheck = "It won't rain";
            }
        };

        res.render("index.ejs", {
            weather: rainCheck
        });
    }
    catch(error) {
        console.error("Failed to make a request: ",error.message? error.message : error);
    }
});

app.listen(port, () => {
    console.log("http://localhost:" + port);
});