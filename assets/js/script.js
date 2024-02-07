const key = 'YOUR_API_KEY_HERE_FROM_GOOGLE_DEVELOPER_CONSOLE'
const baseUrl = 'https://www.googleapis.com/youtube/v3/'

const form = document.querySelector('#ch-url')
const bio = document.querySelector('.bio')
const thumb = document.querySelector('.channel-img img')
const chInfo = bio.querySelector('.channel-info')
const chTitle = chInfo.querySelector('h2')
const chDesc = chInfo.querySelector('p')
const chLink = chInfo.querySelector('a')
const stats = document.querySelector('.stats')
const subCount = stats.querySelector('.subscribers p')
const videoCount = stats.querySelector('.videos p')
const viewCount = stats.querySelector('.views p')
const meta = document.querySelector('.meta')
const crt_at = meta.querySelector('.ch-created p')
const country = meta.querySelector('.cntry p')
const banner = document.querySelector('.banner img')
const latVid = document.querySelector('.lat-vid')
const intl = new Intl.NumberFormat('en-US', {notation: 'compact'})
var tmInt = null
var latVidSrc

form.addEventListener('submit', function (e) {
    if (form.churl.value === '') {
        alert('Please enter a valid channel URL')
        return
    }
    var chId;
    var queryType;
    if (form.churl.value.includes('channel')) {
        chId = form.churl.value.split('channel/')[1]
        queryType = 'id'
    } else if (form.churl.value.includes('user')) {
        chId = form.churl.value.split('user/')[1]
        queryType = 'forUsername'
    } else if (form.churl.value.includes('c/')) {
        chId = form.churl.value.split('c/')[1]
        queryType = 'id'
    } else if (form.churl.value.includes('@')) {
        chId = '@' + form.churl.value.split('@')[1]
        queryType = 'forHandle'
    } else {
        alert('Please enter a valid channel URL')
        return
    }
    getChannelDes(queryType, chId)
})

function getChannelDes (queryType, channelId) {
    if (tmInt != null) {
        clearInterval(tmInt)
    }
    startLoading()
    fetch(`${baseUrl}channels?part=snippet,statistics,brandingSettings&${queryType}=${channelId}&key=${key}`)
    .then(response => response.json())
    .then(data => {
        if (data.pageInfo.totalResults === 0) {
            alert('No channel found')
            stopLoading()
            return
        }
        thumb.src = data.items[0].snippet.thumbnails.medium.url
        chTitle.textContent = data.items[0].snippet.title
        chDesc.textContent = data.items[0].snippet.description
        chLink.href = `https://www.youtube.com/channel/${data.items[0].id}`
        subCount.textContent = intl.format(data.items[0].statistics.subscriberCount)
        videoCount.textContent = data.items[0].statistics.videoCount
        viewCount.textContent = intl.format(data.items[0].statistics.viewCount)
        crt_at.textContent = data.items[0].snippet.publishedAt.split('T')[0]
        country.textContent = data.items[0].snippet.country
        banner.src = data.items[0].brandingSettings.image.bannerExternalUrl
        fetch(`${baseUrl}search?part=snippet,id&channelId=${data.items[0].id}&maxResults=1&order=date&key=${key}`)
        .then(response => response.json())
        .then(data => {
            if (data.items.length > 0) {
                var videoId = data.items[0].id.videoId
                fetch(`${baseUrl}videos?part=snippet,statistics&id=${videoId}&key=${key}`)
                .then(response => response.json())
                .then(data => {
                    var vid = document.createElement('div')
                    vid.classList.add('video')
                    vid.innerHTML = `
                        <h3>Latest Video</h3>
                        <img src="${data.items[0].snippet.thumbnails.medium.url}" alt="">
                        <h3>${data.items[0].snippet.title}</h3>
                        <div class="video-info">
                            <p><i class="fa-solid fa-eye"></i> <span id="lat-views">${data.items[0].statistics.viewCount}</span></p>
                            <p><i class="fa-solid fa-thumbs-up"></i> <span id="lat-likes">${data.items[0].statistics.likeCount}</span></p>
                            <p><i class="fa-solid fa-heart"></i> <span id="lat-favs">${data.items[0].statistics.favoriteCount}</span></p>
                            <p><i class="fa-solid fa-comments"></i> <span id="lat-cmnts">${data.items[0].statistics.commentCount}</span></p>
                        </div>`
                    latVid.innerHTML = ''
                    latVid.appendChild(vid)
                    tmInt = setInterval(() => {
                        fetch(`${baseUrl}videos?part=statistics&id=${videoId}&key=${key}`)
                        .then(response => response.json())
                        .then(data => {
                            document.querySelector('#lat-views').classList.add('animate__animated', 'fadeOut')
                            document.querySelector('#lat-views').textContent = data.items[0].statistics.viewCount
                            document.querySelector('#lat-likes').classList.add('animate__animated', 'fadeOut')
                            document.querySelector('#lat-likes').textContent = data.items[0].statistics.likeCount
                            document.querySelector('#lat-favs').classList.add('animate__animated', 'fadeOut')
                            document.querySelector('#lat-favs').textContent = data.items[0].statistics.favoriteCount
                            document.querySelector('#lat-cmnts').classList.add('animate__animated', 'fadeOut')
                            document.querySelector('#lat-cmnts').textContent = data.items[0].statistics.commentCount

                            setTimeout(() => {
                                document.querySelector('#lat-views').classList.remove('animate__animated', 'fadeIn')
                                document.querySelector('#lat-likes').classList.remove('animate__animated', 'fadeIn')
                                document.querySelector('#lat-favs').classList.remove('animate__animated', 'fadeIn')
                                document.querySelector('#lat-cmnts').classList.remove('animate__animated', 'fadeIn')
                            }, 1000)
                        })
                    }, 5000)
                })
            }
        })
        stopLoading()
    })
}

function startLoading () {
    var div = document.createElement('div')
    div.classList.add('loading')
    form.appendChild(div)
    form.querySelector('button').style.display = 'none'
    form.querySelector('button').setAttribute('disabled', 'disabled')
}
function stopLoading () {
    form.querySelector('.loading').remove()
    form.querySelector('button').style.display = 'inline-block'
    form.querySelector('button').removeAttribute('disabled')
}