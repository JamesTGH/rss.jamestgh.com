const express = require('express')
const app = express()
const path = require('path')
const cron = require('node-cron')
const torrentrss = require('./torrentrss')
const { MongoClient, ServerApiVersion } = require('mongodb')
require('dotenv').config({ path: path.join(__dirname, '/.env') })


app.set('port', process.env.PORT || 4000)
app.set('mongodb', process.env.MONGODB || 'mongodb://127.0.0.1:27017/torrentrss')
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
        torrentrss.search('iptorrents', 'https://iptorrents.com/torrents/rss', app.get('mongodb'), {
            uid: req.query.uid,
            key: req.query.key,
            genre: '20',
            regex: '1080p.*(WEB-DL|WEB DL).*(CMRG|EVO)'
        })
        MongoClient.connect(app.get('mongodb'), { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 }, (err, db) => {
            if (err) throw err
            db.db(app.get('mongodb').split('/')[3]).collection(`iptorrents_${req.query.uid}_${req.query.key}`).find({}).sort({date: -1}).limit(128).toArray((err, data) => {
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
        res.status(401).render('error', { status: '401: Unauthorized' })
    }
})

app.get('/torrenting', (req, res) => {
    if (req.query.uid && req.query.key) {
        torrentrss.search('torrenting', 'https://torrenting.com/torrents/rss', app.get('mongodb'), {
            uid: req.query.uid,
            key: req.query.key,
            genre: '49;3;38;1;40;47;11',
            regex: '1080p.*(WEB-DL|WEB DL).*(CMRG|EVO)'
        })
        MongoClient.connect(app.get('mongodb'), { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 }, (err, db) => {
            if (err) throw err
            db.db(app.get('mongodb').split('/')[3]).collection(`torrenting_${req.query.uid}_${req.query.key}`).find({}).sort({date: -1}).limit(128).toArray((err, data) => {
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
        res.status(401).render('error', { status: '401: Unauthorized' })
    }
})

app.get('/privatehd', (req, res) => {
    if (req.query.pid) {
        torrentrss.search('privatehd', 'https://privatehd.to/rss/torrents/movie', app.get('mongodb'), {
            pid: req.query.pid,
            regex: '1080p.*(WEB-DL|WEB DL).*(CMRG|EVO)'
        })
        MongoClient.connect(app.get('mongodb'), { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 }, (err, db) => {
            if (err) throw err
            db.db(app.get('mongodb').split('/')[3]).collection(`privatehd_${req.query.pid}`).find({}).sort({date: -1}).limit(128).toArray((err, data) => {
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
        res.status(401).render('error', { status: '401: Unauthorized' })
    }
})

app.get('/torrentgalaxy', (req, res) => {
    torrentrss.search('torrentgalaxy', 'https://torrentgalaxy.to/rss?user=44', app.get('mongodb'), {
        regex: '1080p.*(WEB-DL|WEB DL).*(CMRG|EVO)'
    })
    MongoClient.connect(app.get('mongodb'), { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 }, (err, db) => {
        if (err) throw err
        db.db(app.get('mongodb').split('/')[3]).collection('torrentgalaxy').find({}).sort({date: -1}).limit(128).toArray((err, data) => {
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
    console.log('NodeJS started on localhost:' + app.get('port') + '; press Ctrl-C to terminate.')
})


cron.schedule('*/5 * * * *', () => {
    torrentrss.search('iptorrents', 'https://iptorrents.com/torrents/rss', app.get('mongodb'), {
        uid: process.env.IPTORRENTS_UID,
        key: process.env.IPTORRENTS_KEY,
        genre: '20',
        regex: '1080p.*(WEB-DL|WEB DL).*(CMRG|EVO)' // to remove netflix, amazon, hulu, and disney plus content '1080p.(?!(NF|AMZN|HULU|DSNP)).*(WEB-DL|WEB DL).*(CMRG|EVO)'
    })
    torrentrss.search('torrenting', 'https://torrenting.com/torrents/rss', app.get('mongodb'), {
        uid: process.env.TORRENTING_UID,
        key: process.env.TORRENTING_KEY,
        genre: '49;3;38;1;40;47;11',
        regex: '1080p.*(WEB-DL|WEB DL).*(CMRG|EVO)'
    })
    torrentrss.search('privatehd', 'https://privatehd.to/rss/torrents/movie', app.get('mongodb'), {
        pid: process.env.PRIVATEHD_PID,
        regex: '1080p.*(WEB-DL|WEB DL).*(CMRG|EVO)'
    })
    torrentrss.search('torrentgalaxy', 'https://torrentgalaxy.to/rss?user=44', app.get('mongodb'), {
        regex: '1080p.*(WEB-DL|WEB DL).*(CMRG|EVO)'
    })
})