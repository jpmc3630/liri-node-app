require("dotenv").config();
var Spotify = require('node-spotify-api');

var keys = require("./keys.js");
var spotify = new Spotify(keys.spotify);

const axios = require('axios');
const inquirer = require('inquirer');
const moment = require('moment');
const fs = require('fs');


var util = require('util');
var log_file = fs.createWriteStream(__dirname + '/log.txt', {flags : 'a'});
var log_stdout = process.stdout;

console.log = function(d) {
  log_file.write(util.format(d) + '\n');
  log_stdout.write(util.format(d) + '\n');
};

let searchStr;
let searchStrDisplay;

// Parse LIRI cli -options


// Switch to seperate functions of the LIRI app
function parseInput(processArr) {

    let searchArr = [];
    let instruction = processArr[2];

    for (let i = 3; i < processArr.length; i++){
        searchArr.push(processArr[i])
    }
    
    searchStr = searchArr.join('+');
    searchStrDisplay = searchArr.join(' ');
    

    switch(instruction) {
        case `concert-this`:
            concertSearch();
            break;
        case `spotify-this-song`:
            spotifySearch();
            break;
        case `movie-this`:
            movieSearch();
            break;
        case `do-what-it-says`:
            doFile();
            break;
        default:
          console.log(`\nIncorrect use. Please include an insruction followed by a query. For example:`);
          console.log(`concert-this <artist or band>`);
          console.log(`spotify-this-song <song title>`);
          console.log(`movie-this <movie title>`);
          console.log(`do-what-it-says\n`);
      }

}

parseInput(process.argv);

function concertSearch() {

    console.log(`\n Searching for "${searchStrDisplay}" concerts...\n`);

    axios.get(`https://rest.bandsintown.com/artists/${searchStr}/events?app_id=codingbootcamp`)
      .then(function (response) {
        // handle success

        
        console.log(`-------------------------------------------\n`);
        console.log(`             Upcoming Concerts              \n`);
        console.log(`-------------------------------------------\n`);
        
        if (response.data.length < 1) console.log(`No results found :(\n`);
            
       

        for (let i=0; i < response.data.length; i++) {
    
            console.log(`${response.data[i].venue.name} - ${response.data[i].venue.city} ${response.data[i].venue.country} - ${moment(response.data[i].datetime).format(`DD/MM/YYYY`)}\n`);
        }
       
        console.log('-------------------------------------------\n\n');
    
      })
      .catch(function (error) {
        // handle error
        console.log(`-------------------------------------------\n`);
        console.log(error.response.data.errorMessage);
        console.log(`-------------------------------------------\n`);
      });

}



function spotifySearch() {

    if (!searchStrDisplay) {
        console.log(`\n You did not enter a track name to search for ... defaulting to:`);
        searchStrDisplay = `The Sign`;
    }

    console.log(`\n Searching for track "${searchStrDisplay}" on Spotify...\n`);

    spotify.search({ type: 'track', query: searchStrDisplay }, function(err, data) {
        if (err) {
          return console.log('Error occurred: ' + err);
        }
       
        console.log(`-------------------------------------------\n`);
        console.log(`            Spotify Track Search           \n`);
        console.log(`-------------------------------------------\n`);

        if (data.tracks.items.length < 1) {
            console.log(`No results found :(`);
            console.log(`\n-------------------------------------------\n`);
        } else {

                for (let i = 0 ; i < data.tracks.items.length ; i++) {

                        console.log(`Artist(s): ${data.tracks.items[i].artists[0].name}`);
                        console.log(`Track: ${data.tracks.items[i].name}`);
                        console.log(`From Album: ${data.tracks.items[i].album.name}`); 
                        console.log(`Spotify Preview URL: ${data.tracks.items[i].preview_url}`);

                        console.log(`\n-------------------------------------------\n`);

                }
        }
    });
}


function refinedOMDB(query) {

    axios.get(`http://www.omdbapi.com/?apikey=trilogy&i=${query}`)
            .then(function (response) {
            
                
                console.log(`\nTitle: ${response.data.Title}`);
                console.log(`Year: ${response.data.Year}\n`);
                
                console.log(`Country: ${response.data.Country}`);
                console.log(`Language: ${response.data.Language}`);
                console.log(`Actors: ${response.data.Actors}`);
                console.log(`Plot: ${response.data.Plot}\n`);
                
                if (response.data.Ratings[0]) console.log(`IMDB Rating: ${response.data.Ratings[0].Value}`);
                if (response.data.Ratings[1]) console.log(`Rotten Tomatoes Rating: ${response.data.Ratings[1].Value}\n`);

            })
            .catch(function (error) {
                // handle error
                console.log(`\n-------------------------------------------\n`);
                console.log(error);
                console.log(`\n-------------------------------------------\n`);
            });
}

function movieSearch() {

    // print header and repeat user input

    if (!searchStrDisplay) {
        console.log(`\n You did not enter a movie to search for ... defaulting to my favourite`);
        searchStrDisplay = `Mr Nobody`;
        searchStr = `Mr+Nobody`;
    }

    console.log(`\nSearching for movie "${searchStrDisplay}" on OMDB...`);


        console.log(`\n-------------------------------------------\n`);
        console.log(`             OMDB Movie Search             \n`);
        console.log(`-------------------------------------------\n`);


    // axios omdb call
        axios.get(`http://www.omdbapi.com/?apikey=trilogy&s=${searchStr}`)
        .then(function (response) {


            if (!response.data.Search) {
                console.log(`No results found :(`);
                console.log(`\n-------------------------------------------\n`);
            } else if (response.data.Search.length == 1) {

                refinedOMDB(response.data.Search[0].imdbID);

                
            } else {
                
                    let idArr = [];
                    let titlesArr = [];

                    for (let i = 0 ; i < response.data.Search.length ; i++) {
                        if (response.data.Search[i].Type == 'movie') {
                            idArr.push(response.data.Search[i].imdbID);
                            titlesArr.push(`${response.data.Search[i].Title} - ${response.data.Search[i].Year}`);                
                        }
                        
                    }

                    const questions = [
                        { type: 'list', name: 'movieChoice', message: 'Multiple movies found, please choose which one:\n', choices: titlesArr },
                        ];
                    
                    inquirer
                        .prompt(questions)
                        .then(function (answers) {
            
                            let refinedSearchStr = idArr[titlesArr.indexOf(answers.movieChoice)];
                            refinedOMDB(refinedSearchStr);
                        });
                }
        })
        .catch(function (error) {
            // handle error
            console.log(`-------------------------------------------\n\n`);
            console.log(error.response.data.errorMessage);
            console.log(`-------------------------------------------\n`);
        });
}


function doFile() {

    fs.readFile('./random.txt', 'utf8' , function read(err, data) {
        if (err) {
            throw err;
        }
  
        let fromFileArr = ['blah1', 'blah2']; // some place holders to match the pro argv arr format

        let temp = data.split(`,`);

        for (let i=0; i < temp.length; i++) {
            str = temp[i].replace(/"/g,""); //remove quotation marks form file input
            fromFileArr.push(str);
            
        }

        parseInput(fromFileArr);

    });
}
