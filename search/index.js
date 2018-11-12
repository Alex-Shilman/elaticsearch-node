const { esClient, esIndex, esType, esClientPing } = require('./config.js');


const start = async () => {
  
  await esClientPing(30000);
  console.log('pinged server');

  const query = 'London';

  try {
    const resp = await esClient.search({
      index: esIndex,
      type: esType,
      body: {
        sort: [
          {
            place_rank_num: {order: 'desc'},
          },
          {
            importance_num: {order: 'desc'},
          },
        ],
        query: {
          bool: {
            should: [
              {
                match: {
                  name: query,
                },
              },
              {
                match: {
                  alternative_names: query,
                },
              },
            ],
          },
        },
      },
    });
    
    const {hits} = resp.hits;
    console.log(hits);
    
  } catch (error) {
    console.trace(error.message);
  }
};

start();
