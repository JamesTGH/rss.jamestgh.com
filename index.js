const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '/.env') })
const express = require('express')
const app = express()
const torrentrss = require('./torrentrss')
const { MongoClient, ServerApiVersion } = require('mongodb')
const mongodb = process.env.MONGODB


app.set('port', process.env.PORT)
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')
app.use(express.static(path.join(__dirname, 'public')))
app.locals.pretty = true
app.disable('x-powered-by')

app.get('/', (req, res) => {
    res.render('index')
})

app.get('/iptorrents', (req, res) => {
    if (req.query.uid && req.query.key) {
        torrentrss.search('iptorrents', 'https://iptorrents.com/torrents/rss', mongodb, {
            uid: req.query.uid,
            key: req.query.key,
            genre: '20',
            regex: '1080p.*(WEB-DL|WEB DL).*(CMRG|EVO)'
        })
        MongoClient.connect(mongodb, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 }, (err, db) => {
            if (err) throw err
            db.db(mongodb.split('/')[3]).collection(`iptorrents_${req.query.uid}_${req.query.key}`).find({}).sort({date: -1}).limit(128).toArray((err, data) => {
                if (err) throw err
                res.type('application/xml')
                res.render('torrentrss', {
                    rss_title: 'IPTorrents | 1080p.*(WEB-DL|WEB DL).*(CMRG|EVO) | Movies',
                    rss_link: 'https://iptorrents.com/',
                    rss_description: 'Custom IPTorrents RSS Feed',
                    rss_data: data
                })
                db.close()
            })
        })
    } else {
        res.status(401).render('error', {status: '401: Unauthorized'})
    }
})

app.get('/torrenting', (req, res) => {
    if (req.query.uid && req.query.key) {
        torrentrss.search('torrenting', 'https://torrenting.com/torrents/rss', mongodb, {
            uid: req.query.uid,
            key: req.query.key,
            genre: '49;3;38;1;40;47;11',
            regex: '1080p.*(WEB-DL|WEB DL).*(CMRG|EVO)'
        })
        MongoClient.connect(mongodb, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 }, (err, db) => {
            if (err) throw err
            db.db(mongodb.split('/')[3]).collection(`torrenting_${req.query.uid}_${req.query.key}`).find({}).sort({date: -1}).limit(128).toArray((err, data) => {
                if (err) throw err
                res.type('application/xml')
                res.render('torrentrss', {
                    rss_title: 'Torrenting | 1080p.*(WEB-DL|WEB DL).*(CMRG|EVO) | Movies',
                    rss_link: 'https://torrenting.com/',
                    rss_description: 'Custom Torrenting RSS Feed',
                    rss_data: data
                })
                db.close()
            })
        })
    } else {
        res.status(401).render('error', {status: '401: Unauthorized'})
    }
})

app.get('/privatehd', (req, res) => {
    if (req.query.pid) {
        torrentrss.search('privatehd', 'https://privatehd.to/rss/torrents/movie', mongodb, {
            pid: req.query.pid,
            regex: '1080p.*(WEB-DL|WEB DL).*(CMRG|EVO)'
        })
        MongoClient.connect(mongodb, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 }, (err, db) => {
            if (err) throw err
            db.db(mongodb.split('/')[3]).collection(`privatehd_${req.query.pid}`).find({}).sort({date: -1}).limit(128).toArray((err, data) => {
                if (err) throw err
                res.type('application/xml')
                res.render('torrentrss', {
                    rss_title: 'PrivateHD | 1080p.*(WEB-DL|WEB DL).*(CMRG|EVO) | Movies',
                    rss_link: 'https://privatehd.to/',
                    rss_description: 'Custom PrivateHD RSS Feed',
                    rss_data: data
                })
                db.close()
            })
        })
    } else {
        res.status(401).render('error', {status: '401: Unauthorized'})
    }
})

app.get('/torrentgalaxy', (req, res) => {
    torrentrss.search('torrentgalaxy', 'https://torrentgalaxy.to/rss?user=44', mongodb, {
        regex: '1080p.*(WEB-DL|WEB DL).*(CMRG|EVO)'
    })
    MongoClient.connect(mongodb, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 }, (err, db) => {
        if (err) throw err
        db.db(mongodb.split('/')[3]).collection(`torrentgalaxy`).find({}).sort({date: -1}).limit(128).toArray((err, data) => {
            if (err) throw err
            res.type('application/xml')
            res.render('torrentrss', {
                rss_title: 'TorrentGalaxy | 1080p.*(WEB-DL|WEB DL).*(CMRG|EVO) | Movies',
                rss_link: 'https://torrentgalaxy.to/',
                rss_description: 'Custom TorrentGalaxy RSS Feed',
                rss_data: data
            })
            db.close()
        })
    })
})

app.use((req, res, next) => {
    res.status(404).render('error', {status: '404'})
})

app.listen(app.get('port'), () => {
    console.log('NodeJS started on https://rss.jamestgh.com; press Ctrl-C to terminate.')
})