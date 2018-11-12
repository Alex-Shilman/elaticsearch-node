const _ = require('highland');
const fs = require('fs');
const csv = require('csv-parser');
const { geonames, esClient, esIndex, esType, esClientPing } = require('./config.js');

const batchSize = 100;

const start = async () => {
  await esClientPing(30000);
  console.log('pinged server');

  try {
    await esClient.indices.create({index: esIndex});
    console.log('created index');
  } catch (e) {
    if (e.status === 400) {
      console.log('index already exists, aborting...');
      console.log('aborted');
      return;
    } else {
      throw e;
    }
  }

  // process file
  // create steam with highland
  let currentIndex = 0;
  const stream = _(
    fs.createReadStream(geonames).pipe(
      csv({
        separator: '\t',
      })
    )
  ).on('end', () => {
    console.log('done');
    process.exit();
  });
  
   stream.map(data => {
     const {
       alternative_names,
       lon,
       lat,
       place_rank,
       importance,
       ...restData
     } = data;
     
     return {
       ...restData,
       alternative_names: alternative_names.split(','),
       lon_num: parseFloat(lon),
       lat_num: parseFloat(lat),
       place_rank_num: parseInt(place_rank, 10),
       importance_num: parseFloat(importance),
     }
   })
    .map(data => [
      {
        index: {_index: esIndex, _type: esType, _id: data.osm_id},
      },
      data,
    ])
    .batch(batchSize)
    .each(async entries => {
      stream.pause();
      // flatting the data
      const body = entries.reduce((acc, val) => acc.concat(val), []);
      await esClient.bulk({body});
      currentIndex += batchSize;
      console.log('done with indexing', currentIndex, 'batch');
      stream.resume();
    });
};

start();
