import "./index.scss";

const server = "http://localhost:3042";
const signer = "http://localhost:3043";

document.getElementById("exchange-address").addEventListener('input', ({ target: {value} }) => {
  if(value === "") {
    document.getElementById("balance").innerHTML = 0;
    return;
  }

  fetch(`${server}/balance/${value}`).then((response) => {
    return response.json();
  }).then(({ balance }) => {
    document.getElementById("balance").innerHTML = balance;
  });
});

document.getElementById("transfer-amount").addEventListener('click', () => {
  const sender = document.getElementById("exchange-address").value;
  const amount = document.getElementById("send-amount").value;
  const recipient = document.getElementById("recipient").value;
  const signature = document.getElementById("signature").value;

  const body = JSON.stringify({
    sender, recipient, amount
  });

  const request = new Request(`${server}/send`, { method: 'POST', body });

  fetch(request, { headers: { 'Content-Type': 'application/json', 'Signature': signature }}).then(response => {
    return response.json();
  }).then((body) => {
    if(body.error) {
      document.getElementById("status").innerHTML = `error - ${body.error}`;
    } else {
      document.getElementById("balance").innerHTML = body.balance;
      document.getElementById("status").innerHTML = 'ok';
    }
  });
});

document.getElementById("sign-button").addEventListener('click', ({ target: {value} }) => {
  const sender = document.getElementById("exchange-address").value;
  const amount = document.getElementById("sign-amount").value;
  const recipient = document.getElementById("sign-recipient").value;
  const privateKey = document.getElementById("sign-private-key").value;
  
  const body = JSON.stringify({
    key: privateKey,
    message: {
      sender,
      recipient,
      amount
    }
  })
  const request = new Request(`${signer}/sign`, { method: 'POST', body });

  fetch(request, { headers: { 'Content-Type': 'application/json', }}).then(response => {
    return response.json();
  }).then((body) => {
    if(body.error) {
      document.getElementById("error-signature").innerHTML = `error - ${body.error}`;
    } else {
      document.getElementById("signature").value = body.signature;
    }
  });
});
