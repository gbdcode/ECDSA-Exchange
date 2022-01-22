const express = require('express');
const app = express();
const cors = require('cors');
const port = 3042;
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

// localhost can have cross origin errors
// depending on the browser you use!
app.use(cors());
app.use(express.json());


const keyPair1 = ec.genKeyPair();
const keyPair2 = ec.genKeyPair();
const keyPair3 = ec.genKeyPair();

const publicKey1 = keyPair1.getPublic().encode('hex');
const publicKey2 = keyPair2.getPublic().encode('hex');
const publicKey3 = keyPair3.getPublic().encode('hex');

const privateKey1 = keyPair1.getPrivate().toString(16);
const privateKey2 = keyPair2.getPrivate().toString(16);
const privateKey3 = keyPair3.getPrivate().toString(16);

const balances = {}
balances[publicKey1.toString().slice(-30)] = { balance: 90, publicKey: keyPair1.getPublic().encode('hex') };
balances[publicKey2.toString().slice(-30)] = { balance: 100, publicKey: keyPair2.getPublic().encode('hex') };
balances[publicKey3.toString().slice(-30)] = { balance: 110, publicKey: keyPair3.getPublic().encode('hex') };

console.log({ privateKey1, privateKey2, privateKey3 });
console.log(balances)

const errorResponse = (message, address) => {
  return { error: message, address: address };
}

app.get('/balance/:address', (req, res) => {
  const {address} = req.params;
  const balance = balances[address].balance || 0;
  res.send({ balance });
});

app.post('/send', (req, res) => {
  const {sender, recipient, amount} = req.body;

  if(sender === recipient) {
    res.status(422);
    res.send(errorResponse(':)', sender));
    return;
  }

  const signature = req.headers.signature;
  key = ec.keyFromPublic(balances[sender].publicKey, 'hex')

  if(!key.verify(Buffer.from(JSON.stringify(req.body)), signature)) {
    res.status(422);
    res.send(errorResponse('invalid signature', sender));
    return;
  }

  if (balances[sender].balance - amount < 0) {
    res.status(422);
    res.send(errorResponse('insufficient balance', sender));
    return;
  }

  balances[sender].balance -= amount;
  balances[recipient].balance = (balances[recipient].balance || 0) + +amount;
  res.send({ balance: balances[sender].balance });
  console.log(balances);
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});
