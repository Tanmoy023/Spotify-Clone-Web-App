let currentSong = new Audio();
let play = document.querySelector(".playbarBtn").querySelector("#play")
let previous = document.querySelector(".playbarBtn").querySelector("#previous")
let next = document.querySelector(".playbarBtn").querySelector("#next")
let volume = document.querySelector(".range").getElementsByTagName("input")[0]
let songUl = document.querySelector(".songList").getElementsByTagName("ul")[0]
let cardContainer = document.querySelector(".cardContainer")

let songs;
let currFolder

// function for display all the albums dynamicaly
async function displayAlbums() {
    let a = await fetch(`songs/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let fHref = div.getElementsByTagName("a")
    let array = Array.from(fHref)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if (e.href.includes("/songs/")) {
            let folder = decodeURI(e.href.split("/songs/")[1]);
            // take meta deta of each folder
            let a = await fetch(`songs/${folder}/info.json`)
            let response = await a.json();
            cardContainer.innerHTML = cardContainer.innerHTML + `
                <div data-folder="${folder}" class="card">
                    <div class="play">
                        <img src="svg/pause.svg" alt="play">
                    </div>
                    <img src="songs/${folder}/cover.jpg" alt="SongPhoto">
                    <div class="cardInfo">
                        <h5>${response.title}</h5>
                        <p>${response.description}</p>
                    </div>
                </div> `
        }
    }
    cardClick();
}

// function to read the input on every card's and change all list of songs according to it
function cardClick() {
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            // console.log(item.currentTarget.dataset.folder);
            await getSongs(encodeURI(item.currentTarget.dataset.folder))
            await addSongs();
            playlistClick();
        })
    })
}

// function for get all songs form a specific folder
async function getSongs(folder) {
    currFolder = folder
    let a = await fetch(`songs/${folder}/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/songs/${folder}/`)[1])
            // console.log(">>"+element.href.split(`/songs/${folder}/`)[1]);
        }
    }
}

// function for add all songs in out playlist bar
async function addSongs() {
    playMusic(songs[0], true)

    songUl.innerHTML = []
    for (let song of songs) {
        let text1 = decodeURI(song);
        let text2 = text1.replaceAll("%2C", ",")
        let text = text2.replaceAll(".mp3", "");
        let songName = text.split(" - ")[0];
        let artistName = text.split(" - ")[1];
        songUl.innerHTML = songUl.innerHTML + `
        
    <li>
    <div class="songInfo">
        <div class="songName"><img src="svg/mysic.svg" alt="Music">
            <span>${songName}</span>
        </div>
        <div class="songArtist"><img src="svg/microphone.svg" alt="microphone">
            <span>${artistName}</span>
        </div>
    </div>
    <div>
        <img class="playSong" src="svg/pause.svg" alt="play">
    </div>
    </li>`;
    }
}

// function to read all clicked song's in our displayed plalist
function playlistClick() {
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            let ltxt = e.getElementsByTagName("span")[0].innerHTML;
            let rtxt = e.getElementsByTagName("span")[1].innerHTML;
            let txt1 = ltxt + " - " + rtxt + ".mp3"
            let txt = encodeURI(txt1);
            playMusic(txt)
        })
    })
}

// function to change js time format to formal time format
function timeFormat(seconds) {
    var minutes = Math.floor(seconds / 60);
    var seconds = Math.floor(seconds % 60);
    var formattedMinutes = ('0' + minutes).slice(-2);
    var formattedSeconds = ('0' + seconds).slice(-2);
    return formattedMinutes + ':' + formattedSeconds;
}

// function to play the given Music
const playMusic = (track, pause = false) => {
    // let audio = new Audio("songs/"+track);
    currentSong.src = `songs/${currFolder}/` + track;
    if (pause == false) {
        currentSong.play();
        play.src = "svg/" + "play.svg";
    }
    let txt = decodeURI(track)
    document.querySelector(".playbar").querySelector(".songInfo").innerHTML = txt;
    document.querySelector(".playbar").querySelector(".songTime").innerHTML = "00:00 / 00:00"
}

async function main() {
    displayAlbums();

    await getSongs(encodeURI("Bengali Song"));

    await addSongs();
    playlistClick();

    // read click for play and pause
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "svg/" + "play.svg";
        }
        else {
            currentSong.pause();
            play.src = "svg/" + "pause.svg";
        }
    })

    // update the time-bar according to song's time. And also update the seek bar to represe
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songTime").innerHTML = `${timeFormat(currentSong.currentTime)}/${timeFormat(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%"
    })

    // read the click on seek bar. And change the current song time according to it 
    document.querySelector(".seekbar").addEventListener("click", (e) => {
        // console.log(e.target.getBoundingClientRect().width, e.offsetX);
        let seekPercentage = (e.offsetX / e.target.getBoundingClientRect().width) * 100
        document.querySelector(".circle").style.left = seekPercentage + "%"
        currentSong.currentTime = seekPercentage * currentSong.duration / 100;
    })

    // read the click on hamburger functionality
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0%";
    })

    // read the click on cancel button for hamburger functionality
    document.querySelector(".cancel").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-100%"
    })

    // read the click on previous button and change song according to it
    previous.addEventListener("click", () => {
        // console.log(currentSong.src.split("/songs/")[1]);
        let index = songs.indexOf(currentSong.src.split(`/songs/${currFolder}/`)[1])
        if (index != 0) {
            playMusic(songs[index - 1])
        }
        else {
            alert(decodeURI(currentSong.src.split(`/songs/${currFolder}/`)[1]) + " is the first song of this playlist, You only able to tap next to play next songs")
        }
    })

    // read the click on next button and change song according to it
    next.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split(`/songs/${currFolder}/`)[1])
        if (index != songs.length - 1) {
            playMusic(songs[index + 1])
        }
        else {
            alert(decodeURI(currentSong.src.split(`/songs/${currFolder}/`)[1]) + " is the last song of this playlist, You only able to tap previous to play previous songs")
        }
    })

    // read the click on volume button and change the volume according to it
    volume.addEventListener("change", (e) => {
        // console.log("setting volume to : "+e.target.value);
        currentSong.volume = parseInt(e.target.value) / 100;
    })
    cardClick();

    // add an event listener to mute the track
    document.querySelector(".volumeLogo").addEventListener("click", (e) => {
        if (e.target.src.includes("un_mute.svg")) {
            e.target.src = e.target.src.replaceAll("un_mute.svg", "mute.svg")
            currentSong.volume = 0
            volume.value = 0

        }
        else {
            e.target.src = e.target.src.replaceAll("mute.svg", "un_mute.svg")
            currentSong.volume = 0.5
            volume.value = 50
        }
    })

}
main();
