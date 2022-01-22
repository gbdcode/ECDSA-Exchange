const express = require('express');
const app = express();
const cors = require('cors');
const port = 3043;
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

app.use(cors());
app.use(express.json());

app.post('/sign', (req, res) => {
  const { key, message } = req.body;
  ecKey = ec.keyFromPrivate(key);  

  try {
    const signature = Buffer.from(ecKey.sign(Buffer.from(JSON.stringify(message))).toDER()).toString('hex')
    res.send({ signature });
  } catch (error) {
    res.send({ error: error.code });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});
