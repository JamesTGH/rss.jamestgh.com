const express = require('express')
const app = express()
const path = require('path')
const torrentrss = require('./torrentrss')
const MongoClient = require('mongodb').MongoClient
const mongodb = 'mongodb://127.0.0.1:27017/torrentrss'

app.set('port', process.env.PORT || 3777)
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')
app.use(express.static(path.join(__dirname, 'public')))
app.locals.pretty = true
app.disable('x-powered-by')

app.get('/', (request, response) => {
    response.render('index')
})

app.get('/iptorrents', (request, response) => {
    if (request.query.uid && request.query.key) {
        torrentrss.search('iptorrents', 'https://iptorrents.com/torrents/rss', mongodb, {
            uid: request.query.uid,
            key: request.query.key,
            genre: '20',
            regex: '1080p.*(WEB-DL|WEB DL).*(CMRG|EVO)'
        })
        MongoClient.connect(mongodb.substring(0, mongodb.lastIndexOf('/')), {useUnifiedTopology: true}, (error, db) => {
            if (error) throw error
            db.db(mongodb.split('/')[3]).collection(`iptorrents_${request.query.uid}_${request.query.key}`).find({}).sort({date: -1}).limit(128).toArray((error, data) => {
                if (error) throw error
                response.type('application/xml')
                response.render('torrentrss', {
                    rss_title: 'IPTorrents | 1080p.*(WEB-DL|WEB DL).*(CMRG|EVO) | Movies',
                    rss_link: 'https://iptorrents.com/',
                    rss_description: 'Custom IPTorrents RSS Feed',
                    rss_data: data
                })
                db.close()
            })
        })
    } else {
        response.status(401).render('error', {status: '401: Unauthorized'})
    }
})

app.get('/torrenting', (request, response) => {
    if (request.query.uid && request.query.key) {
        torrentrss.search('torrenting', 'https://torrenting.com/torrents/rss', mongodb, {
            uid: request.query.uid,
            key: request.query.key,
            genre: '49;3;38;1;40;47;11',
            regex: '1080p.*(WEB-DL|WEB DL).*(CMRG|EVO)'
        })
        MongoClient.connect(mongodb.substring(0, mongodb.lastIndexOf('/')), {useUnifiedTopology: true}, (error, db) => {
            if (error) throw error
            db.db(mongodb.split('/')[3]).collection(`torrenting_${request.query.uid}_${request.query.key}`).find({}).sort({date: -1}).limit(128).toArray((error, data) => {
                if (error) throw error
                response.type('application/xml')
                response.render('torrentrss', {
                    rss_title: 'Torrenting | 1080p.*(WEB-DL|WEB DL).*(CMRG|EVO) | Movies',
                    rss_link: 'https://torrenting.com/',
                    rss_description: 'Custom Torrenting RSS Feed',
                    rss_data: data
                })
                db.close()
            })
        })
    } else {
        response.status(401).render('error', {status: '401: Unauthorized'})
    }
})

app.get('/privatehd', (request, response) => {
    if (request.query.pid) {
        torrentrss.search('privatehd', 'https://privatehd.to/rss/torrents/movie', mongodb, {
            pid: request.query.pid,
            regex: '1080p.*(WEB-DL|WEB DL).*(CMRG|EVO)'
        })
        MongoClient.connect(mongodb.substring(0, mongodb.lastIndexOf('/')), {useUnifiedTopology: true}, (error, db) => {
            if (error) throw error
            db.db(mongodb.split('/')[3]).collection(`privatehd_${request.query.pid}`).find({}).sort({date: -1}).limit(128).toArray((error, data) => {
                if (error) throw error
                response.type('application/xml')
                response.render('torrentrss', {
                    rss_title: 'PrivateHD | 1080p.*(WEB-DL|WEB DL).*(CMRG|EVO) | Movies',
                    rss_link: 'https://privatehd.to/',
                    rss_description: 'Custom PrivateHD RSS Feed',
                    rss_data: data
                })
                db.close()
            })
        })
    } else {
        response.status(401).render('error', {status: '401: Unauthorized'})
    }
})

app.get('/torrentgalaxy', (request, response) => {
    torrentrss.search('torrentgalaxy', 'https://torrentgalaxy.to/rss?user=44', mongodb, {
        regex: '1080p.*(WEB-DL|WEB DL).*(CMRG|EVO)'
    })
    MongoClient.connect(mongodb.substring(0, mongodb.lastIndexOf('/')), {useUnifiedTopology: true}, (error, db) => {
        if (error) throw error
        db.db(mongodb.split('/')[3]).collection(`torrentgalaxy`).find({}).sort({date: -1}).limit(128).toArray((error, data) => {
            if (error) throw error
            response.type('application/xml')
            response.render('torrentrss', {
                rss_title: 'TorrentGalaxy | 1080p.*(WEB-DL|WEB DL).*(CMRG|EVO) | Movies',
                rss_link: 'https://torrentgalaxy.to/',
                rss_description: 'Custom TorrentGalaxy RSS Feed',
                rss_data: data
            })
            db.close()
        })
    })
})

app.use((request, response, next) => {
    response.status(404).render('error', {status: '404'})
})

app.listen(app.get('port'), () => {
    console.log('NodeJS started on https://rss.jamestgh.com; press Ctrl-C to terminate.')
})