///////// CHANGE ME ////////
var requestUrl = window.location.protocol + "//" + window.location.hostname + "/lightning/lightningTip.php";
///////// END CHANGE ME ////////

// To prohibit multiple requests at the same time
var running = false;

var invoice;
var qrCode;
var defaultGetInvoice;

// Data capacities for QR codes with mode byte and error correction level L (7%)
// Shortest invoice: 194 characters
// Longest invoice: 1223 characters (as far as I know)
var qrCodeDataCapacities = [
    {"typeNumber": 9, "capacity": 230},
    {"typeNumber": 10, "capacity": 271},
    {"typeNumber": 11, "capacity": 321},
    {"typeNumber": 12, "capacity": 367},
    {"typeNumber": 13, "capacity": 425},
    {"typeNumber": 14, "capacity": 458},
    {"typeNumber": 15, "capacity": 520},
    {"typeNumber": 16, "capacity": 586},
    {"typeNumber": 17, "capacity": 644},
    {"typeNumber": 18, "capacity": 718},
    {"typeNumber": 19, "capacity": 792},
    {"typeNumber": 20, "capacity": 858},
    {"typeNumber": 21, "capacity": 929},
    {"typeNumber": 22, "capacity": 1003},
    {"typeNumber": 23, "capacity": 1091},
    {"typeNumber": 24, "capacity": 1171},
    {"typeNumber": 25, "capacity": 1273}
];

switch (document.documentElement.lang) {
  case 'de':
    lang = {
      NO_TIP_AMOUNT: "Kein Spendenbetrag gesetzt",
      MUST_BE_NUMBER: "Spendenbetrag muss eine Zahl sein",
      BACKEND_FAIL: "Lightning Node nicht erreichbar",
      THANK_YOU: "Vielen Dank für deine Spende!",
      INVOICE_EXPIRED: "Der QR Code ist abgelaufen, bitte generiere einen neuen indem du die Seite erneut aufrufst!"
    };
    break;
  case 'en':
    lang = {
      NO_TIP_AMOUNT: "No tip amount set",
      MUST_BE_NUMBER: "Tip amount must be a number",
      BACKEND_FAIL: "Failed to reach Lightning Node",
      THANK_YOU: "Thank you for your Tip!",
      INVOICE_EXPIRED: "Your tip request expired!"
    };
    break;
  default:
    break;
}

var testnet = getVal('testnet');  //see if GET param testnet is set  (URL?testnet=1)
console.log('Testnet = ' + testnet);
if ( testnet !== null ) {
	requestUrl = requestUrl + '?testnet=1';
	console.log('requestUrl = ' + requestUrl );
}

// TODO: show invoice even if JavaScript is disabled
// TODO: fix scaling on phones
// TODO: show price in dollar?
function getInvoice() {
  if (running === false) {
    running = true;

    var tipValue = document.getElementById("lightningTipAmount");

    if (tipValue.value !== "") {
      if (!isNaN(tipValue.value)) {
        var request = new XMLHttpRequest();

        request.onreadystatechange = function () {
          if (request.readyState === 4) {
            try {
              var json = JSON.parse(request.responseText);

              if (request.status === 200) {
                console.log("Got invoice: " + json.Invoice);
                console.log("Invoice expires in: " + json.Expiry);
                console.log("Starting listening for invoice to get settled");

                listenInvoiceSettled(json.r_hash_str);

                invoice = json.Invoice;

                // Update UI
                var wrapper = document.getElementById("lightningTip");

                wrapper.innerHTML = "<div id='lightningTipQR'></div>";
                wrapper.innerHTML += "<section class='lightningTipInvoice' id='lightningTipInvoice' >" + invoice + "</section>";

                wrapper.innerHTML += "<div id='lightningTipTools'>" +
                                     "<button class='lightningTipButton' id='lightningTipCopy'>Copy</button>" +
                                     "<button class='lightningTipButton' id='lightningTipOpen'>Open</button>" +
                                     "<div id='lightningTipExpiry'></div>" +
                                     "</div>";

                starTimer(json.Expiry, document.getElementById("lightningTipExpiry"));

                // Fixes bug which caused the content of #lightningTipTools to be visually outside of #lightningTip
                document.getElementById("lightningTipTools").style.height = document.getElementById("lightningTipCopy").clientHeight + "px";

                document.getElementById("lightningTipOpen").onclick = function () {
                  location.href = "lightning:" + json.Invoice;
                };
                showQRCode();
                running = false;
              } else {
                showErrorMessage(json.Error);
              }
            } catch (exception) {
              console.error(exception);
              showErrorMessage(lang.BACKEND_FAIL);
            }
          }
        };
        request.open("POST", requestUrl , true);
        request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        var params = "Action=getinvoice&Amount=" + parseInt(tipValue.value) + "&Message=" + encodeURIComponent(document.getElementById("lightningTipMessage").value);
        console.log(params);
        request.send(params);
        var button = document.getElementById("lightningTipGetInvoice");
        defaultGetInvoice = button.innerHTML;
        button.innerHTML = "<div class='spinner'></div>";
      } else {
        showErrorMessage(lang.MUST_BE_NUMBER);
      }
    } else {
      showErrorMessage(lang.NO_TIP_AMOUNT);
    }
  } else {
    console.warn("Last request still pending");
  }
}

function listenInvoiceSettled(r_hash_str) {
  var interval = setInterval(function () {
    var request = new XMLHttpRequest();

    //Prevent multiple calls for same invoice settled over slow networks.
    var IsSettled = false;
    if ( IsSettled == true) {
      return;
    }

    request.onreadystatechange = function () {
      if (request.readyState === 4 && request.status === 200) {
        var json = JSON.parse(request.responseText);

        if (json.settled) {
          console.log("Invoice settled");
          IsSettled = true;
          clearInterval(interval);
          showThankYouScreen();
        }

      }

    };

    request.open("POST", requestUrl, true);
    request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    var params = "Action=invoicesettled&r_hash_str=" + r_hash_str;
    request.send(params);

  }, 2000);
}

function showThankYouScreen() {
  var wrapper = document.getElementById("lightningTip");

  wrapper.innerHTML = "<p id='lightningTipLogo'>⚡</p>";
  wrapper.innerHTML += "<p id='lightningTipFinished'>" + lang.THANK_YOU + "</p>";
}

function starTimer(duration, element) {
  showTimer(duration, element);

  var interval = setInterval(function () {
    if (duration > 1) {
      duration--;

      showTimer(duration, element);

    } else {
      showExpired();

      clearInterval(interval);
    }

  }, 1000);

}

function showTimer(duration, element) {
  var seconds = Math.floor(duration % 60);
  var minutes = Math.floor((duration / 60) % 60);
  var hours = Math.floor((duration / (60 * 60)) % 24);

  seconds = addLeadingZeros(seconds);
  minutes = addLeadingZeros(minutes);

  if (hours > 0) {
    element.innerHTML = hours + ":" + minutes + ":" + seconds;
  } else {
    element.innerHTML = minutes + ":" + seconds;
  }
}

function showExpired() {
  var wrapper = document.getElementById("lightningTip");

  wrapper.innerHTML = "<p id='lightningTipLogo'>⚡</p>";
  wrapper.innerHTML += "<p id='lightningTipFinished'>" + lang.INVOICE_EXPIRED + "</p>";
}

function addLeadingZeros(value) {
  return ("0" + value).slice(-2);
}

function showQRCode() {
  var element = document.getElementById("lightningTipQR");

  createQRCode();

  element.innerHTML = qrCode;

  var size = document.getElementById("lightningTipInvoice").clientWidth + "px";

  var qrElement = element.children[0];

  qrElement.style.height = size;
  qrElement.style.width = size;
}

function createQRCode() {
  var invoiceLength = invoice.length;

  // Just in case an invoice bigger than expected gets created
  var typeNumber = 26;

  for (var i = 0; i < qrCodeDataCapacities.length; i++) {
    var dataCapacity = qrCodeDataCapacities[i];

    if (invoiceLength < dataCapacity.capacity) {
      typeNumber = dataCapacity.typeNumber;
      break;
    }
  }

  console.log("Creating QR code with type number: " + typeNumber);

  var qr = qrcode(typeNumber, "L");

  qr.addData(invoice);
  qr.make();

  qrCode = qr.createImgTag(6, 0);
}

function showErrorMessage(message) {
  running = false;

  console.error(message);

  var error = document.getElementById("lightningTipError");

  error.parentElement.style.marginTop = "0.5em";
  error.innerHTML = message;
  error.classList.add("show");
  setTimeout(function() {
    error.classList.remove("show");
  },2000);

  var button = document.getElementById("lightningTipGetInvoice");

  // Only necessary if it has a child (div with class spinner)
  if (button.children.length !== 0) {
    button.innerHTML = defaultGetInvoice;
  }

}

function divRestorePlaceholder(element) {
  // <br> and <div><br></div> mean that there is no user input
  if (element.innerHTML === "<br>" || element.innerHTML === "<div><br></div>") {
    element.innerHTML = "";
  }
}

function getVal(str) {
  var v = window.location.search.match(new RegExp('(?:[\?\&]'+str+'=)([^&]+)'));
  return v ? v[1] : null;
}
