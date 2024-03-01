let app = {
    placeId: null,
    placeData: null,
    shareUrl: null,

    init: async function(placeId, theme='light', numOfwords=40, shareUrl=null, fakeData) {
        console.log('Google reviews initiate')
        this.placeId = placeId
        this.shareUrl = shareUrl
        this.placeData = await fakeData
        await console.log('Data fetched')
        await this.buildHeader()
        await this.buildReviews()
        await console.log('Google reviews initiated')
    },

    getPlaceData: async function() {
        let apiData = await fetch(`https://strange-mariner-413409.ew.r.appspot.com/${this.placeId}`, {mode: 'cors'})
        apiData = await apiData.json()
        return apiData
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
            const ctaUrlElem = header_elem.querySelector('.header--review-cta a')
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
            const main_elem = document.querySelector('.main')
            main_elem.appendChild(review_elem)
        });
        console.log('Reviews builded')

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

}
