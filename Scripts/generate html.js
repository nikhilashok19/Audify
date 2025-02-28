console.log('Script Loaded');

document.body.addEventListener('keyup', (event) => {
  if (event.key === ' ') {
    checkPlay();
    updatePlayicon();
  }
});

const artistContainer = document.querySelector('.artist-area');
const songsContainer = document.querySelector('.songs-container');
const libraryArtistContainer = document.querySelector('.library .main-area .artist');
let currentSongindex = 0;
let isPlayed = false;
let currentSongpath = 'songs/Anne Marie/Meridian - National Sweetheart.mp3';
let currentSong = new Audio();
currentSong.src = currentSongpath; // Updated path
let progressBar = document.querySelector('.playbar .seekbar .seek-container span .progress');
let playbarSongData = {
  songName: "",
  artistName: "",
  artistImage: ""
}
let songList = [];
let isClicked = false;

// Adding event listener to volume slider
const volumeSlider = document.getElementById('volumeRange');
volumeSlider.addEventListener('input', function () {
  const value = volumeSlider.value;
  if (value <= 50) {
    document.querySelector('.volume-container i').classList.remove('fa-volume-high');
    document.querySelector('.volume-container i').classList.add('fa-volume-low');
  }
  if (value > 50) {
    document.querySelector('.volume-container i').classList.remove('fa-volume-low');
    document.querySelector('.volume-container i').classList.add('fa-volume-high');
  }
  volumeSlider.style.background = `linear-gradient(to right, orange ${value}%, #ccc ${value}%)`;
  currentSong.volume = value / 100;
});

// Adding Event listener on seekbar
const seekbar = document.querySelector('.js-seekbar');
seekbar.addEventListener('click', (event) => {
  const seekbarWidth = seekbar.getBoundingClientRect().width;
  const clickX = event.clientX - seekbar.getBoundingClientRect().left;
  const percentage = (clickX / seekbarWidth) * 100;

  progressBar.style.width = percentage + '%';
  currentSong.currentTime = (percentage * currentSong.duration) / 100;
  currentSong.play();
});

// Event Listener for Song Duration
currentSong.addEventListener('timeupdate', () => {
  if (currentSong.currentTime === currentSong.duration) {
    currentSong.pause();
    document.querySelector('.js-play-btn').classList.remove('fa-pause');
    document.querySelector('.js-play-btn').classList.add('fa-play');
    document.querySelectorAll('.js-playlist-song').forEach((card) => {
      card.querySelector('.js-playlist-play').classList.remove('fa-pause');
      card.querySelector('.js-playlist-play').classList.add('fa-play');
    });
  }
  document.querySelector('.js-current-time').innerText = formatDuration(currentSong.currentTime);
  progressBar.style.width = ((currentSong.currentTime / currentSong.duration) * 100) + '%';
});

document.querySelector('.js-seekbar').addEventListener('click', () => {
  if (currentSong.played) {
    document.querySelector('.js-play-btn').classList.remove('fa-play');
    document.querySelector('.js-play-btn').classList.add('fa-pause');
    isPlayed = true;
    updatePlayicon();
  }
  if (currentSong.paused) {
    document.querySelector('.js-play-btn').classList.remove('fa-pause');
    document.querySelector('.js-play-btn').classList.add('fa-play');
    isPlayed = false;
    updatePlaybar();
  }
});

let artistsData = [];

function playSong(songPath) {
  currentSongpath = songPath;
  currentSong.src = songPath;
  checkPlay();
}

function pauseSong() {
  currentSong.pause();
}

function checkPlay() {
  if (currentSong.paused) {
    isPlayed = true;
    currentSong.play();
    setTimeout(() => {
      document.querySelector('.js-duration').innerText = formatDuration(currentSong.duration);
    }, 200);

    document.querySelector('.js-play-btn').classList.remove('fa-play');
    document.querySelector('.js-play-btn').classList.add('fa-pause');
  } else {
    isPlayed = false;
    currentSong.pause();
    document.querySelector('.js-play-btn').classList.remove('fa-pause');
    document.querySelector('.js-play-btn').classList.add('fa-play');
  }
}

function updatePlayicon() {
  document.querySelectorAll('.js-playlist-song').forEach((card) => {
    card.querySelector('.js-playlist-play').classList.remove('fa-pause');
    card.querySelector('.js-playlist-play').classList.add('fa-play');
  });
  document.querySelectorAll('.js-playlist-song').forEach((card) => {
    let songPath = card.dataset.path;
    if (currentSongpath === songPath) {
      if (isPlayed) {
        card.querySelector('.js-playlist-play').classList.remove('fa-play');
        card.querySelector('.js-playlist-play').classList.add('fa-pause');
      } else {
        card.querySelector('.js-playlist-play').classList.remove('fa-pause');
        card.querySelector('.js-playlist-play').classList.add('fa-play');
      }
    }
  });
}

function updatePlaybar(playbarData) {
  document.querySelector('.playbar-img img').src = playbarData.artistImage;
  document.querySelector('.song-data h4').innerHTML = playbarData.songName;
  document.querySelector('.song-data h5').innerHTML = playbarData.artistName;
}

// Function to format duration in minutes:seconds format
function formatDuration(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  const formattedSeconds = remainingSeconds < 10 ? '0' + remainingSeconds : remainingSeconds;

  return `${minutes}:${formattedSeconds}`;
}

async function getData() {
  let data = await fetch('artists/'); // Changed to relative path
  let response = await data.text();
  let div = document.createElement('div');
  div.innerHTML = response;
  let as = div.querySelectorAll('a');
  as.forEach((a) => {
    if (a.href.endsWith('.jpeg')) {
      let url = new URL(a.href);
      let fileName = url.pathname.split('/')[2].replace('%20', ' ').split('.')[0];
      artistsData.push({
        name: fileName,
        image: `artists/${fileName}.jpeg`
      });
    }
  });
}

function generateHtml(array) {
  let html = '';
  array.forEach((aData) => {
    aData.name = aData.name.replaceAll('%20', ' ');
    html += `
      <div class="artist js-artist" data-artist-name="${aData.name}">
        <div class="artist-photo">
          <img src="${aData.image}" alt="artist-photo">
        </div>
        <div class="artist-details">
          <h4>${aData.name}</h4>
          <h5>Artist</h5>
        </div>
      </div>
  `;
  });
  artistContainer.innerHTML = html;

  // Generating Playlists
  const artistCard = document.querySelectorAll('.js-artist');
  artistCard.forEach((card) => {
    let artistName = card.dataset.artistName;
    card.addEventListener('click', async () => {
      await generatePlaylist(artistName);
      libraryArtistContainer.innerHTML = `
        <div class="img-box">
          <img src="artists/${artistName}.jpeg" alt="Artist-Playlist">
        </div>
        <div class="name">
          <h4>${artistName}</h4>
        </div>
      `;
    });
  });
}

async function generatePlaylist(artistName) {
  document.querySelector('.cover h2').innerText = artistName;
  document.querySelector('.cover img').src = `songs/${artistName}/${artistName}.jpg`;

  currentSongindex = 0;
  songList = [];
  let playList = [];
  let playListHtml = '';
  let data = await fetch(`songs/${artistName}`); // Changed to relative path
  let response = await data.text();
  let div = document.createElement('div');
  div.innerHTML = response;
  let as = div.querySelectorAll('a');
  as.forEach((a) => {
    if (a.href.endsWith('.mp3')) {
      let url = new URL(a.href);
      let fileName = url.pathname.split('/')[3].replaceAll('%20', ' ').split('.')[0];
      playList.push({
        songName: fileName,
      });
    }
  });

  playList.forEach((song, index) => {
    let tempSong = song.songName.replaceAll("%26", "and");
    songList.push(`songs/${artistName}/${song.songName}.mp3`);
    playListHtml += `
    <div class="songs js-playlist-song" data-path="songs/${artistName}/${song.songName}.mp3" data-index="${index}">
          <div class="img-box">
            <img src="songs/${artistName}/cover.jpeg" alt="Song-Cover">
          </div>
          <div class="song-name">
            ${tempSong}
          </div>
          <div class="play-btn">
            <i class="fa-solid fa-play js-playlist-play"></i>
          </div>
      </div>
    `;
  });

  songsContainer.innerHTML = playListHtml;
  updatePlaybar(playbarSongData);
  
  let playButtons = document.querySelectorAll('.js-playlist-song');
  playButtons.forEach((button) => {
    button.addEventListener('click', () => {
      let songPath = button.dataset.path;
      currentSong.src = songPath;
      playSong(songPath);
      playbarSongData.songName = button.querySelector('.song-name').innerText;
      playbarSongData.artistName = artistName;
      playbarSongData.artistImage = `songs/${artistName}/cover.jpeg`;
      updatePlaybar(playbarSongData);
      isClicked = true;
    });
  });
}

// Main Function to Initialize the App
async function main() {
  await getData(); // Fetch artist data
  generateHtml(artistsData); // Generate artist HTML
}

// Call the main function
main();
