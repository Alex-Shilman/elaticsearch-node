const elasticsearch = require('elasticsearch');
const esPort = '9200';
const esHost = 'localhost';
const esIndex = 'osm';
const esType = 'place';
const geonames = './planet-latest-100k_geonames.tsv';

const esClient = new elasticsearch.Client({
  host: `${esHost}:${esPort}`,
  // log: 'trace',
});

const esClientPing = async (timeout = 30000) =>
  esClient.ping({
    requestTimeout: timeout
  }, error => {
    if (error) {
      console.trace(`elasticsearch cluster on ${esHost}:${esPort} is down! \n If it was just started please give it more time to start`);
    } else {
      console.log(`${esHost}:${esPort} is up and well`);
    }
  });

module.exports = {
  esPort,
  esHost,
  esIndex,
  esType,
  esClient,
  esClientPing,
  geonames,
}
