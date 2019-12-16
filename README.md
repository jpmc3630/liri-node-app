# LIRI BOT Node App
![LIRI-BOT demo gif](demo/LIRIdemo.gif)

LIRI BOT is a CLI node app that can search Spotify for songs, Bands in Town for concerts, and OMDB for movies, and provide concise results.

## Use
Please include an insruction followed by a query. 
For example to use at command line type:

** node liri.js <instruction> <query> **

concert-this <artist or band>
spotify-this-song <song title>
movie-this <movie title>
do-what-it-says 

do-what-it-says) reads instruction and query from the editable default.txt file, in this format:
spotify-this-song,"wuthering heights"

## Features
* prints received API data to the console in a concise and readable format.
* writes everything printed to the console to ** log.txt ** file.
* uses Inquirer to provide CLI menu options when more than one movie is returned in the movie-this (OMDB) search.

## Dependencies
LIRI BOT uses various node packages:

* The node-spotify-api package.
* Axios for other API calls.
* Inquirer for some CLI menus.
* Moment for date formatting.