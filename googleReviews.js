let app = {

    placeId: null,
    placeData: null,
    shareUrl: null,
    scrollPosition: 0,
    scrollDirection: 'forward',
    scrollElem: null,
    scrollLoop: null,

    init: async function(placeId, theme='light', shareUrl=null) {
        console.log('Google reviews initiate')
        this.placeId = placeId
        this.shareUrl = shareUrl
        this.setTheme(theme)
        this.placeData = await this.getPlaceData()
        // await console.log(this.placeData)
        if (!this.placeData) {
            this.buildErrorsMessage()
            return false
        }
        await console.log('Data fetched')
        await this.buildHeader()
        await this.buildReviews()
        await console.log('Google reviews initiated')
        this.scrollElem = await document.querySelector('.main--inner')
        const btnElements = await document.querySelectorAll('.btn-control')
        await btnElements.forEach(btnElement => {
            btnElement.addEventListener('click', this.handleControlBtn)
        })
        await this.scrollElem.addEventListener('click', _ => {clearInterval(app.scrollLoop)})
        await this.scrollLoop()
    },

    setTheme: function(theme) {
        const container_elem = document.querySelector('.container')
        container_elem.classList.toggle('th-'+theme)
    },

    getPlaceData: async function() {
        let apiData = await fetch(`https://strange-mariner-413409.ew.r.appspot.com/${this.placeId}`, {mode: 'cors'})
        apiData = await apiData.json()
        if ("errors" in apiData) {
            console.log("error to get place")
            const postPlace = await this.postPlace()
            // await console.log(postPlace)
            if (postPlace) {
                apiData = await fetch(`https://strange-mariner-413409.ew.r.appspot.com/${this.placeId}`, {mode: 'cors'})
                apiData = await apiData.json()
                // await console.log(apiData)
            } else {
                return null
            }
        }
        return apiData
    },

    postPlace: async function () {
        let apiPost = await fetch(
            `https://strange-mariner-413409.ew.r.appspot.com/${this.placeId}`,
            {method:'POST', mode: 'cors', credentials: 'omit', headers: {"Content-Type": "application/json"},})
        apiPost = await apiPost.json()
        if ("error" in apiPost) {
            console.log('error to post place')
            return false
        }
        return true
    },

    buildRatingStars: function(rating) {
        let divStar_elem = document.createElement('div')
        divStar_elem.setAttribute('class', 'stars')
        for (let index = 1; index < 6; index++) {
            value = rating / index
            lastValue = rating / (index - 1)
            if (value>= 1) {
                const plainStar_elem = document.createElement('img')
                plainStar_elem.setAttribute('src', 'icon-plain-star.svg')
                divStar_elem.appendChild(plainStar_elem) 
            } else if (value < 1 && lastValue > 1) {
                const halfStar_elem = document.createElement('img')
                halfStar_elem.setAttribute('src', 'icon-half-star.svg')
                divStar_elem.appendChild(halfStar_elem)
            } else {
                const emptyStar_elem = document.createElement('img')
                emptyStar_elem.setAttribute('src', 'icon-empty-star.svg')
                divStar_elem.appendChild(emptyStar_elem)
            }
        }
        return divStar_elem
    },
    
    buildHeader: function () {
        const placeName = this.placeData.place.name
        const rating = this.placeData.place.rating
        const reviewCount = this.placeData.place.reviewCount

        const header_elem = document.querySelector('.template .header').cloneNode(true)

        header_elem.querySelector('.header--place-name h3').innerText = placeName
        header_elem.querySelector('.header--rating').appendChild(this.buildRatingStars(rating))
        const headerStars = header_elem.querySelectorAll('.header--rating img')
        headerStars.forEach(headerStar => {
            headerStar.setAttribute('class', 'header--rating--star')
        });
        header_elem.querySelector('.header--rating--note').innerText = rating
        header_elem.querySelector('.header--rating-count span').innerText = reviewCount

        if (this.shareUrl) {
            const ctaUrlElem = header_elem.querySelector('.header--review-cta')
            ctaUrlElem.setAttribute('href', this.shareUrl)
        } else {
            header_elem.querySelector('.header--review-cta').remove()
        }

        document.querySelector('.container').prepend(header_elem)
        console.log('Header builded')
    },

    buildReview: function (review) {
        const review_elem = document.querySelector('.template > .main--review').cloneNode(true)
        
        const authorImage_elem = review_elem.querySelector('.main--review--author > img')
        authorImage_elem.setAttribute('src', review.authorImage)
        const authorName_elem = review_elem.querySelector('.main--review--author--info--name')
        authorName_elem.setAttribute('href', review.authorUri)
        authorName_elem.innerText = review.authorName
        review_elem.querySelector('.main--review--author--info--date').innerText = this.calculateTimeElapsed(review.publishedDate)
        review_elem.querySelector('.main--review--author').after(this.buildRatingStars(review.rating))
        review_elem.querySelector('.stars').classList.add('main--review--rating')
        const reviewStars = review_elem.querySelectorAll('.main--review--rating img')
        reviewStars.forEach(reviewStar => {
            reviewStar.setAttribute('class', 'main--review--rating--star')
        });
        review_elem.querySelector('.main--review--content > p').innerText = review.content

        return review_elem
    },

    buildReviews: function() {
        this.placeData.place.Reviews.forEach(review => {
            const review_elem = this.buildReview(review)
            const main_elem = document.querySelector('.main--inner')
            main_elem.appendChild(review_elem)
        });
        console.log('Reviews builded')

    },

    buildErrorsMessage: function() {
        document.querySelector('.container').style.gridTemplateColumns = '100%'

        const btnControl_elems = document.querySelectorAll('.btn-control')
        btnControl_elems.forEach(btnControl_elem => {
            btnControl_elem.remove()
        });
        document.querySelector('.main--inner').remove()

        const main_elem = document.querySelector('.main')
        main_elem.style.gridTemplateColumns = '100%' 

        const mainError_elem = document.createElement('div')
        mainError_elem.setAttribute('class', 'error')

        let errorMessage_elem = document.createElement('h3')
        errorMessage_elem.setAttribute('class', 'error--message')
        errorMessage_elem.innerText = "Error : verify place id"

        mainError_elem.appendChild(errorMessage_elem)
        main_elem.appendChild(mainError_elem)
    },

    calculateTimeElapsed: function(date) {
        datePublished = new Date(date)
        dateNow = new Date()

        let diffTime = dateNow.getTime() - datePublished.getTime()
        let diffDays = Math.round(diffTime / (1000 * 3600 * 24))

        if (diffDays < 1) {
            diff = "Aujourd'hui"
        } else if (diffDays > 365) {
            diff = "Plus d'1 an"
        } else if (diffDays >= 31) {
            diff = Math.round(diffDays / 30)+" mois"
        } else {
            diff = diffDays+" jours"
        }

        return diff
    },

    handleControlBtn: function(evt) {
        clearInterval(app.scrollLoop)
        const btn = evt.target.id;
        const scroll_Elem = document.querySelector('.main--inner')
        if (btn === 'next') {
            scroll_Elem.scrollBy(1, 0)
        } else if (btn === 'prev') {
            scroll_Elem.scrollBy(-1, 0)
        }
    },

    scrolling: function() {
        if (this.scrollDirection === 'forward') {
            this.scrollPosition = this.scrollElem.scrollLeft
            this.scrollElem.scrollBy(1, 0)
        } else if (this.scrollDirection === 'backward') {
            this.scrollPosition = this.scrollElem.scrollLeft
            this.scrollElem.scrollBy(-1, 0)
        }
        return true
    },

    scrollLoop: function() {
        this.scrollLoop = setInterval(_ => {
            this.scrolling()
            if (this.scrollDirection === 'forward' && this.scrollPosition === this.scrollElem.scrollLeft && this.scrollPosition > 0 ) {
                this.scrollDirection = 'backward'
            } else if (this.scrollDirection === 'backward' && this.scrollPosition === 0 && this.scrollElem.scrollLeft === 0) {
                this.scrollDirection = 'forward'
            }
        }, 3000)
    },

}
