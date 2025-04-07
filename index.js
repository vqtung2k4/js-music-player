const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const _PLAYER_STORAGE = 'TUNGV'

const player = $('.player')
const cd = $('.cd')
const header = $('header h2')
const cdThumb = $('.cd-thumb')
const audio = $('#audio')
const volume = $('#volume')
const playBtn = $('.btn-toggle-play')
const progress = $('#progress')
const prevBtn = $('.btn-prev')
const nextBtn = $('.btn-next')
const randBtn = $('.btn-random')
const repeatBtn = $('.btn-repeat')
const playlist = $('.playlist')



const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(_PLAYER_STORAGE)) || {},
    songs: [
        {
            name: 'Đừng làm trái tim anh đau',
            singer: 'Son Tung MTP',
            path: './music/1.mp3',
            image: './img/1.jpg'
        },
        {
            name: 'Khong Tu Cau',
            singer: 'Tony Nguyen',
            path: './music/2.mp3',
            image: './img/2.jpg'
        },
        {
            name: 'Anh Thoi Nhan Nhuong',
            singer: 'Dung Hoang Pham',
            path: './music/3.mp3',
            image: './img/3.jpg'
        },
        {
            name: 'Anh Thoi Nhan Nhuong',
            singer: 'Dung Hoang Pham',
            path: './music/4.mp3',
            image: './img/4.jpg'
        }
    ],

    setConfig: function(key, value) {
        this.config[key] = value;
        localStorage.setItem(_PLAYER_STORAGE, JSON.stringify(this.config))
    },

    render: function () {
        const htmls = this.songs.map((song, index) => {
            return `
            <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index="${index}">
                <div class="thumb"
                    style="background-image: url('${song.image}')">
                </div>
                <div class="body">
                    <h3 class="title">${song.name}</h3>
                    <p class="author">${song.singer}</p>
                </div>
                <div class="option">
                    <i class="fas fa-ellipsis-h"></i>
                </div>
            </div>
            `
        })
        $('.playlist').innerHTML = htmls.join('')
    },

    defineProperties: function () {
        Object.defineProperty(this, 'currentSong', {
            get: function () {
                return this.songs[this.currentIndex]
            }
        })
    },
    handleEvent: function () {
        const _this = this
        const cdWidth = cd.offsetWidth

        //Handle rotate CD
        const cdThumbAnimate = cdThumb.animate([
            { transform: 'rotate(360deg)' }
        ], {
            duration: 10000, //10 secs
            iterations: Infinity
        })
        cdThumbAnimate.pause()
        //Handle zoom in/out cd
        document.onscroll = function () {
            const scrollTop = window.scrollY || document.documentElement.scrollTop
            const newCdWidth = Math.max(0, cdWidth - scrollTop)

            // console.log(newCdWidth)
            cd.style.width = newCdWidth + 'px'
            cd.style.opacity = newCdWidth / cdWidth
        }

        //Handle change volume
        volume.oninput = function(e) {
            audio.volume = e.target.value / 100
            _this.setConfig('volume', e.target.value)
        }

        //Handle play button
        playBtn.onclick = function () {
            if (_this.isPlaying) {
                audio.pause()
            } else {
                audio.play()
            }
        }

        //When song is playing
        audio.onplay = function () {
            _this.isPlaying = true
            player.classList.add('playing')
            cdThumbAnimate.play()
        }
        //When song is pause
        audio.onpause = function () {
            _this.isPlaying = false
            player.classList.remove('playing')
            cdThumbAnimate.pause()
        }
        //When audio timeline running
        audio.ontimeupdate = function () {
            if (audio.duration) {
                const progressPercent = Math.floor(audio.currentTime / audio.duration * 100)
                progress.value = progressPercent
            }
        }

        //Handle when seek
        progress.oninput = function (e) {
            const seekTime = audio.duration / 100 * e.target.value
            audio.currentTime = seekTime
        }

        //Handle when next song
        nextBtn.onclick = function () {
            if (_this.isRandom) {
                _this.playRandomSong()
            } else {
                _this.nextSong()
            }
            audio.play()
            _this.render()
        }
        //Handle when prev song
        prevBtn.onclick = function () {
            if (_this.isRandom) {
                _this.playRandomSong()
            } else {
                _this.prevSong()
            }
            audio.play()
            _this.render()
        }
        //Handle of random button
        randBtn.onclick = function () {
            _this.isRandom = !_this.isRandom
            _this.setConfig('isRandom', _this.isRandom)
            randBtn.classList.toggle('active', _this.isRandom)
        }
        //Handle repeat button
        repeatBtn.onclick = function () {
            _this.isRepeat = !_this.isRepeat
            _this.setConfig('isRepeat', _this.isRepeat)
            repeatBtn.classList.toggle('active', _this.isRepeat)
        }
        //Handle when audio ended
        audio.onended = function () {
            if (_this.isRepeat) {
                audio.play()
            } else {
                nextBtn.click()
            }
        }

        //Listen 'click' to playlist
        playlist.onclick = function (e) {
            const songNode =  e.target.closest('.song:not(.active)')
            if(
               songNode ||
                e.target.closest('.option')
            ) {
                //When click into song (not active song)
                if(songNode) {
                   _this.currentIndex = Number(songNode.getAttribute('data-index'))
                   _this.loadCurrentSong()
                   _this.render()
                   audio.play()
                }
                //When click into song options
                if(e.target.closest('.option')) {

                }
            }
        }
    },

    loadCurrentSong: function () {


        header.textContent = this.currentSong.name
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`
        audio.src = this.currentSong.path



    },

    loadConfig: function() {
        this.isRandom = this.config.isRandom || false
        this.isRepeat = this.config.isRepeat || false
        audio.volume = (this.config.volume || 50) / 100
        volume.value = (this.config.volume || 50)
    },

    nextSong: function () {
        this.currentIndex++
        if (this.currentIndex >= this.songs.length) {
            this.currentIndex = 0
        }
        this.loadCurrentSong()
    },

    prevSong: function () {
        this.currentIndex--
        // console.log(this.currentIndex)
        if (this.currentIndex < 0) {
            this.currentIndex = this.songs.length - 1
        }
        this.loadCurrentSong()
    },

    playRandomSong: function () {
        let newIndex
        do {
            newIndex = Math.floor(Math.random() * this.songs.length)
        } while (newIndex === this.currentIndex)

        this.currentIndex = newIndex
        this.loadCurrentSong()
    },


    start: function () {
        // Assign config to app (Read from local storage)
        this.loadConfig();
        
        this.defineProperties();
        this.handleEvent();
    
        this.loadCurrentSong();
        this.render();
    
        // Set the initial state of the buttons based on the config
        randBtn.classList.toggle('active', this.isRandom);
        repeatBtn.classList.toggle('active', this.isRepeat);
    }
}

app.start()