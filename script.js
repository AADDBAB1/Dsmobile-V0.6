/* =========================
   ELEMENTOS
========================= */

const videoPlayer =
document.getElementById("videoPlayer");

const videoInput =
document.getElementById("videoInput");

const subtitleInput =
document.getElementById("subtitleInput");

const videoList =
document.getElementById("videoList");

const seekBar =
document.getElementById("seekBar");

const volumeBar =
document.getElementById("volumeBar");

const subtitleDiv =
document.getElementById("subtitle");

const container =
document.getElementById("videoContainer");

const fullscreenUI =
document.getElementById("fullscreenUI");

/* =========================
   DADOS
========================= */

let videos = [];

let subtitles = [];

let currentVideo = 0;

/* =========================
   AUTO HIDE MENU
========================= */

let hideTimeout;

container.addEventListener("mousemove", ()=>{

    fullscreenUI.classList.remove("hidden");

    clearTimeout(hideTimeout);

    hideTimeout = setTimeout(()=>{

        fullscreenUI.classList.add("hidden");

    },3000);
});

/* =========================
   CARREGAR VIDEOS
========================= */

videoInput.onchange = (e)=>{

    [...e.target.files].forEach(file=>{

        videos.push({

            name:file.name,

            url:URL.createObjectURL(file)
        });

    });

    renderVideos();

    if(videos.length === e.target.files.length){

        loadVideo(0);
    }
};

function renderVideos(){

    videoList.innerHTML = "";

    videos.forEach((video,index)=>{

        const div =
        document.createElement("div");

        div.innerText = video.name;

        div.classList.toggle(
            "active-video",
            index === currentVideo
        );

        div.onclick = ()=>{

            loadVideo(index);
        };

        videoList.appendChild(div);

    });
}

function loadVideo(index){

    currentVideo = index;

    renderVideos();

    videoPlayer.src =
    videos[index].url;

    videoPlayer.play();
}

/* =========================
   CONTROLES
========================= */

function togglePlay(){

    if(videoPlayer.paused){

        videoPlayer.play();

    }else{

        videoPlayer.pause();
    }
}

function stopVideo(){

    videoPlayer.pause();

    videoPlayer.currentTime = 0;
}

function forward(){

    videoPlayer.currentTime =
    Math.min(
        videoPlayer.currentTime + 10,
        videoPlayer.duration || 0
    );
}

function backward(){

    videoPlayer.currentTime =
    Math.max(
        videoPlayer.currentTime - 10,
        0
    );
}

function muteVideo(){

    videoPlayer.muted =
    !videoPlayer.muted;
}

/* =========================
   SEEK BAR
========================= */

videoPlayer.addEventListener(
"timeupdate",
()=>{

    if(videoPlayer.duration){

        seekBar.value =

        (
            videoPlayer.currentTime /

            videoPlayer.duration

        ) * 100;
    }

    updateSubtitle();
});

seekBar.oninput = ()=>{

    if(videoPlayer.duration){

        videoPlayer.currentTime =

        (
            seekBar.value / 100
        ) * videoPlayer.duration;
    }
};

/* =========================
   VOLUME
========================= */

volumeBar.oninput = ()=>{

    videoPlayer.volume =
    volumeBar.value;
};

/* =========================
   FULLSCREEN
========================= */

function toggleFullscreen(){

    if(!document.fullscreenElement){

        if(container.requestFullscreen){

            container.requestFullscreen();
        }

    }else{

        document.exitFullscreen();
    }
}

/* =========================
   LEGENDA
========================= */

subtitleInput.onchange = (e)=>{

    const file =
    e.target.files[0];

    if(!file) return;

    const reader =
    new FileReader();

    reader.onload = (event)=>{

        subtitles =
        parseSRT(
            event.target.result
        );
    };

    reader.readAsText(file);
};

function parseSRT(data){

    const blocks =
    data.split(/\n\s*\n/);

    let result = [];

    blocks.forEach(block=>{

        const lines =
        block.split(/\r?\n/);

        if(lines.length >= 3){

            const time =
            lines[1];

            const text =
            lines
            .slice(2)
            .join(" ");

            const times =
            time.split(" --> ");

            result.push({

                start:
                srtTimeToSeconds(
                    times[0]
                ),

                end:
                srtTimeToSeconds(
                    times[1]
                ),

                text:text
            });
        }
    });

    return result;
}

function srtTimeToSeconds(time){

    const parts =

    time
    .replace(",",".")
    .split(":");

    return(

        parseFloat(parts[0]) * 3600 +

        parseFloat(parts[1]) * 60 +

        parseFloat(parts[2])
    );
}

function updateSubtitle(){

    const current =
    videoPlayer.currentTime;

    const subtitle =
    subtitles.find(sub=>

        current >= sub.start &&

        current <= sub.end
    );

    subtitleDiv.textContent =

    subtitle
    ? subtitle.text
    : "";
}

/* =========================
   TECLADO
========================= */

document.addEventListener(
"keydown",
(e)=>{

    switch(e.code){

        case "Space":

        e.preventDefault();

        togglePlay();

        break;

        case "ArrowRight":

        forward();

        break;

        case "ArrowLeft":

        backward();

        break;

        case "KeyM":

        muteVideo();

        break;

        case "KeyF":

        toggleFullscreen();

        break;
    }
});

/* =========================
   ERRO VIDEO
========================= */

videoPlayer.onerror = ()=>{

    alert(
        "Erro ao reproduzir vídeo"
    );
};

/* =========================
   LIMPAR MEMÓRIA
========================= */

window.addEventListener(
"beforeunload",
()=>{

    videos.forEach(video=>{

        URL.revokeObjectURL(
            video.url
        );
    });
});