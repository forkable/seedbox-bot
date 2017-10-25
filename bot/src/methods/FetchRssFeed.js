import { httpRequest } from "../components/Http";
import FeedParser from 'feedparser';

async function FetchRssFeed(rssFeed) {
  return new Promise(async (resolve, reject) => {
    let feedparser = new FeedParser({});
    let rss = (await httpRequest({
        url: rssFeed.url,
        method: "GET",
      })
    ).body;

    feedparser.on('error', function (error) {
      reject(error);
    });

    feedparser.on('finish', function () {
      try {
        let stream = this;
        let rssItem;
        let torrents = [];
        while (rssItem = stream.read()) {
          let torrentData = {};
          if (rssItem.enclosures) {
            torrentData["url"] = rssItem.enclosures[0].url;
          } else if (rssItem.link) {
            torrentData["url"] = rssItem.link;
          }
          torrentData["title"] = rssItem.title;
          torrentData["pubDate"] = rssItem.pubDate;
          torrentData["rss_feed_id"] = rssFeed.id;
          torrents.push(torrentData);
        }

        resolve({
          ...rssFeed.dataValues,
          torrents,
        });
      } catch (error) {
        reject(error);
      }
    });

    feedparser.write(rss, () => {
      feedparser.end();
    });
  });
}

export { FetchRssFeed };