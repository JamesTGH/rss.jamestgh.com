const request = require('request')
const Parser = require('rss-parser')
const parser = new Parser()
const parseTorrent = require('parse-torrent')
const {encode,decode} = require('html-entities')
const MongoClient = require('mongodb').MongoClient


module.exports = {
    search: function(provider, url, mongodb, options) {
        if (provider && url) {
            if (['iptorrents', 'torrenting', 'torrentgalaxy', 'privatehd'].includes(provider)) {
                if (provider == 'torrentgalaxy') {
                    if (options['regex']) {
                        search_next(provider, url, `${mongodb}/${provider}`, options)
                    } else {
                        console.error(`[${new Date().toISOString()}][torrentrss][error]: insufficent options defined (regex)`)
                    }
                } else if (provider == 'privatehd') {
                    if (options['pid'] && options['regex']) {
                        search_next(provider, `${url}?pid=${options['pid']}`, `${mongodb}/${provider}_${options['pid']}`, options)
                    } else {
                        console.error(`[${new Date().toISOString()}][torrentrss][error]: insufficent options defined (pid, regex)`)
                    }
                } else {
                    if (options['uid'] && options['key'] && options['genre'] && options['regex']) {
                        search_next(provider, `${url}?u=${options['uid']}&tp=${options['key']};${options['genre']};download&q=${options['regex']}`, `${mongodb}/${provider}_${options['uid']}_${options['key']}`, options)
                    } else {
                        console.error(`[${new Date().toISOString()}][torrentrss][error]: insufficent options defined (uid, key, genre, regex)`)
                    }
                }
            }
        } else {
            console.error(`[${new Date().toISOString()}][torrentrss][error]: function not satisfied with parameters given (provider, url)`)
        }
    }
}

function search_next(provider, request_url, mongodb, options) {
    request(request_url, (error, response, body) => {
        if (error) throw error
        if (response.statusCode == 200) {
            parser.parseString(body, (error, rss) => {
                if (error) throw error
                console.log(`[${new Date().toISOString()}][torrentrss]: search (${provider}) | (${new RegExp(options['regex'])})`)
                rss.items.forEach(item => {
                    if (new RegExp(options['regex']).test(item.title)) {
                        if (provider == 'privatehd') {
                            parseTorrent.remote(encode(item.enclosure.url), (error, parsedTorrent) => {
                                if (error) throw error
                                let torrent_metadata = {
                                    name: parsedTorrent.name,
                                    guid: parsedTorrent.infoHash,
                                    date: (isNaN(new Date(parsedTorrent.created))) ? new Date(item.pubDate) : new Date(parsedTorrent.created),
                                    size: parsedTorrent.length,
                                    link: decode(item.enclosure.url)
                                }
                                MongoClient.connect(mongodb.substring(0, mongodb.lastIndexOf('/')), {useUnifiedTopology: true}, (error, db) => {
                                    if (error) throw error
                                    db.db(mongodb.split('/')[3]).collection(mongodb.split('/')[4]).countDocuments({guid: parsedTorrent.infoHash}, {limit: 1}, (error, response) => {
                                        if (error) throw error
                                        if (!response) {
                                            db.db(mongodb.split('/')[3]).collection(mongodb.split('/')[4]).insertOne(torrent_metadata, (error, response) => {
                                                if (error) throw error
                                                console.log(`[${new Date().toISOString()}][torrentrss]: adding (${torrent_metadata['name']})`)
                                                db.close()
                                            })
                                        } else {
                                            // console.log(`[${new Date().toISOString()}][torrentrss]: exists (${torrent_metadata['name']})`)
                                            db.close()
                                        }
                                    })
                                })
                            })
                        } else {
                            parseTorrent.remote(encode(item.link), (error, parsedTorrent) => {
                                if (error) throw error
                                let torrent_metadata = {
                                    name: parsedTorrent.name,
                                    guid: parsedTorrent.infoHash,
                                    date: (isNaN(new Date(parsedTorrent.created))) ? new Date(item.pubDate) : new Date(parsedTorrent.created),
                                    size: parsedTorrent.length,
                                    link: decode(item.link)
                                }
                                MongoClient.connect(mongodb.substring(0, mongodb.lastIndexOf('/')), {useUnifiedTopology: true}, (error, db) => {
                                    if (error) throw error
                                    db.db(mongodb.split('/')[3]).collection(mongodb.split('/')[4]).countDocuments({guid: parsedTorrent.infoHash}, {limit: 1}, (error, response) => {
                                        if (error) throw error
                                        if (!response) {
                                            db.db(mongodb.split('/')[3]).collection(mongodb.split('/')[4]).insertOne(torrent_metadata, (error, response) => {
                                                if (error) throw error
                                                console.log(`[${new Date().toISOString()}][torrentrss]: adding (${torrent_metadata['name']})`)
                                                db.close()
                                            })
                                        } else {
                                            // console.log(`[${new Date().toISOString()}][torrentrss]: exists (${torrent_metadata['name']})`)
                                            db.close()
                                        }
                                    })
                                })
                            })
                        }
                    }
                })
            })
        } else {
            console.error(`[${new Date().toISOString()}][torrentrss][error]: request returned ${response.statusCode}`)
        }
    })
}