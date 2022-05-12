
const { providers } = nearApi;
const { utils } = nearApi;
const near = new nearApi.Near({
    keyStore: new nearApi.keyStores.BrowserLocalStorageKeyStore(),
    networkId: 'testnet',
    nodeUrl: 'https://rpc.testnet.near.org',
    walletUrl: 'https://wallet.testnet.near.org'
  });

  // connect to the NEAR Wallet
const login = document.getElementById("login");
const wallet = new nearApi.WalletConnection(near, 'my-app');
const cancel = document.getElementById("cancel");
const progress = document.getElementById("totalprogress");
const deposit = document.getElementById("deposit");
var canPlay= false;
const ftContract = new nearApi.Contract(wallet.account(), 'wrap.testnet', {
    changeMethods: ['ft_transfer_call', 'near_deposit'],
});

const roketo = new nearApi.Contract(wallet.account(), 'streaming-r-v2.dcversus.testnet', {
    viewMethods: ['get_account', 'get_account_outgoing_streams', 'get_stream'],
    changeMethods: [ 'stop_stream']
});
const provider = new providers.JsonRpcProvider(
    "https://archival-rpc.testnet.near.org"
  );

  var lastStream;
var lastAccountStream;
if (!wallet.isSignedIn()) {
    login.textContent = "login with NEAR";
} else {
    document.getElementById("logout").style.visibility = "visible";
    const roketoAccount = await roketo.get_account({
        "account_id": wallet.getAccountId()
    });
    console.log(roketoAccount);
        lastAccountStream = await roketo.get_stream({
          "stream_id" : roketoAccount.last_created_stream
       });

    if (lastAccountStream.description == "gamesmartpay") {
        lastStream = lastAccountStream;
        console.log("last stream is gamesmartpay, hash: "+lastAccountStream.id);
        console.log(lastAccountStream); 
    } else {
    const response = await roketo.get_account_outgoing_streams({
        "account_id": wallet.getAccountId().toString(),
            "from": 0,
            "limit": 9999,
        
    });
    console.log("total streams: "+response.length);
    var count = 0;
    
    response.forEach(stream => {
        
        if(stream.description == "gamesmartpay") {
            count += 1
            console.log("finded gamesmartpay stream, hash: "+ stream.id);
            lastStream = stream;
        }
    });
    console.log("total game pay streams: "+count);
}

}
deposit.addEventListener('click', () => {
    if(wallet.isSignedIn()) {
        ftContract.near_deposit({}, 200000000000000, '1000000000000000000000000');
    } else {
    wallet.requestSignIn({
        contractId: 'wrap.testnet',
        methodNames: ['ft_transfer_call', 'near_deposit']
      });
}});
var alreadyStreamedAmount;
function UpdateTotal() {
    if(lastStream.status != "Paused") {
        alreadyStreamedAmount = Math.round(((Date.now()/1000-lastStream.timestamp_created/1000000000)*utils.format.formatNearAmount(lastStream.tokens_per_sec))*1000)/1000;
        canPlay = true;
    } else {
        alreadyStreamedAmount = utils.format.formatNearAmount(lastStream.tokens_total_withdrawn);
        canPlay = false;
    }
    document.getElementById("total").textContent = alreadyStreamedAmount+"/1 N"
    progress.value = alreadyStreamedAmount
    console.log(alreadyStreamedAmount);
}
if(lastStream){
    console.log(alreadyStreamedAmount);
    if(!lastStream.status.Finished) {
        console.log("streamed: " + alreadyStreamedAmount)
    if(alreadyStreamedAmount < 1 | !alreadyStreamedAmount) {
    console.log("laststream")
  if(lastStream.status != "Paused") {
  var t = setInterval(UpdateTotal,1000);
  cancel.style.visibility = "visible";
    console.log("active stream");
    canPlay = true;
} } else {
    document.getElementById("total").textContent = "Game purchased!";
    progress.value = 1;
    progress.style.accentColor = "#15e64c";
    clearInterval(t);
    canPlay = true;

} 
    } else {
        if(wallet.isSignedIn()) {
            deposit.style.visibility = "visible";
        }
      }
} 
if(canPlay) {
    login.textContent = "Play Game!";
 
} 
cancel.addEventListener('click', () => {
    roketo.stop_stream({"stream_id":lastStream.id},200000000000000, 1);
})
login.addEventListener('click', () => {
    if(wallet.isSignedIn()) {
        if(!canPlay) {
        ftContract.ft_transfer_call({
            receiver_id: 'streaming-r-v2.dcversus.testnet',
            amount: '1000000000000000000000000', // 1 NEAR
            memo: 'Roketo transfer',
            msg: JSON.stringify({
                Create: {
                    request: {
                        "owner_id": wallet.getAccountId(),
                        "receiver_id": "bebrab.testnet",
                        "tokens_per_sec":999999992469135802469,
                        "description": "gamesmartpay",
                        "is_auto_start_enabled": true,
                    }
                }
            }),
        }, 200000000000000, 1);
    } else {
        location.replace("./game.html")
    }
    
    } else {
    wallet.requestSignIn({
        contractId: 'wrap.testnet',
        methodNames: ['ft_transfer_call', 'near_deposit']
      });
    }
})
document.getElementById("logout").addEventListener('click', () => {
    wallet.signOut();
    location.href = 'https://'+window.location.hostname;
    window.location.reload();
    console.log("logged out");
   });
// only for NEAR, we need deposit NEAR on wrap
