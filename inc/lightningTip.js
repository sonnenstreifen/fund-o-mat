///////// CHANGE ME ////////
//var requestUrl = window.location.protocol + "//" + window.location.hostname + "/lightning/lightningTip.php";
var requestUrl = "https://sonnenstreifen.de/lightning/inc/lightningTip.php";
var tipAmounts      = [10000,20000,40000];
var tipAmountsLabel = ['10k sat','20k sat','40k sat'];
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
      INVOICE_EXPIRED: "Der QR Code ist abgelaufen, bitte generiere einen neuen indem du die Seite erneut aufrufst!",
      GENERATE_QR: "Generiere QR"
    };
    break;
  case 'en':
    lang = {
      NO_TIP_AMOUNT: "No tip amount set",
      MUST_BE_NUMBER: "Tip amount must be a number",
      BACKEND_FAIL: "Failed to reach Lightning Node",
      THANK_YOU: "Thank you for your Tip!",
      INVOICE_EXPIRED: "Your tip request expired!",
      GENERATE_QR: "Generate QR"
    };
    break;
  default:
    break;
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
                console.log("Start listening for invoice to get settled");
                listenInvoiceSettled(json.r_hash_str);
                invoice = json.Invoice;
                showQRCode();
                running = false;
              } else {
                showMessage(json.Error, "error");
              }
            } catch (exception) {
              console.error(exception);
              showMessage(lang.BACKEND_FAIL, "error");
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
        showMessage(lang.MUST_BE_NUMBER, "error");
      }
    } else {
      showMessage(lang.NO_TIP_AMOUNT, "error");
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
  var qrOverlay = document.getElementById("qrOverlay");
  qrOverlay.remove();

  var wrapper = document.getElementById("lightningTip");

  var thanksOverlay = document.createElement("section");
  thanksOverlay.setAttribute("id", "thanksOverlay");

  var thanksText = document.createElement("p");
  thanksText.innerHTML = lang.THANK_YOU;
  thanksOverlay.append(thanksText);
  thanksOverlay.classList.add("show");

  wrapper.append(thanksOverlay);

  setTimeout(function() {
    thanksOverlay.classList.remove("show");
  },5000);
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

    wrapper.innerHTML = "<p id=\"lightningTipLogo\">⚡</p>";
    wrapper.innerHTML += "<p id='lightningTipFinished'>" + lang.INVOICE_EXPIRED + "</p>";
}

function addLeadingZeros(value) {
    return ("0" + value).slice(-2);
}

function showQRCode() {
  var wrapper = document.getElementById("lightningTip");

  var qrOverlay = document.createElement("section");
  qrOverlay.setAttribute("id", "qrOverlay");

  var close = document.createElement("a");
  close.setAttribute("id", "closeQR");
  var x = document.createElement("div");
  x.classList.add("close");
  close.append(x);
  qrOverlay.append(close);

  var qr = document.createElement("div");
  qr.setAttribute("id", "lightningTipQR");
  qr.innerHTML = createQRCode();
  qrOverlay.append(qr);

  var invoiceSection = document.createElement("section");
  invoiceSection.setAttribute("id", "lightningTipInvoice");
  invoiceSection.innerHTML = invoice;
  qrOverlay.append(invoiceSection);

  wrapper.append(qrOverlay);

  qr.addEventListener("click", function() {
    copyToClipboard(invoice);
    showMessage("copied to clipboard", "success");
  });

  var size = document.getElementById("lightningTipInvoice").clientWidth + "px";

  var qrElement = qr.children[0];

  qrElement.style.height = size;
  qrElement.style.width = size;

  var button = document.getElementById("lightningTipGetInvoice");
  button.innerHTML = lang.GENERATE_QR;

  close.addEventListener("click", function() {
    qrOverlay.remove();
  });
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

    return qr.createImgTag(6, 0);
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

function showMessage(text, type) {
  running = false;
  var wrapper = document.getElementById("lightningTip");
  var message = document.createElement("section");
  message.classList.add("message");
  message.classList.add(type);
  message.innerHTML = text;
  wrapper.append(message);
  setTimeout(function() {
    message.classList.add("show");
  },100);
  setTimeout(function() {
    message.classList.remove("show");
  },1500);
  setTimeout(function() {
    message.classList.remove(type);
  },1700);

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

function reqListener() {
  console.log(this.responseText);
}

function populateButtons() {
  var amounts = document.querySelector('section.amounts');
  for(var i = 0; i < tipAmounts.length; i++) {
    var button = document.createElement("button");
    button.innerHTML = tipAmountsLabel[i];
    button.dataset.sat = tipAmounts[i];
    amounts.appendChild(button);
  }
}

function attachListeners() {
  var amounts = document.querySelector('section.amounts');
  var lightningTipAmount = document.getElementById('lightningTipAmount');
  var buttons = amounts.children;
  for (var i = 0; i < buttons.length; i++) {
    if (buttons[i].tagName == "BUTTON") {
      buttons[i].addEventListener("click", function(e) {
        var current = this;
        for (var i = 0; i < buttons.length; i++) {
          if (current != buttons[i]) {
            buttons[i].classList.remove('active');
          } else {
            current.classList.add('active');
            lightningTipAmount.value = buttons[i].dataset.sat;
            changeFiatLabel();
          }
        }
        e.preventDefault();
      });
    }
  };
  var customAmount = document.getElementById('customAmount');
  var customAmountLink = document.getElementById('customAmountLink');
  customAmountLink.addEventListener("click", function(e) {
    e.preventDefault();
    customAmount.classList.toggle("active");
  });
  lightningTipAmount.oninput = changeFiatLabel;
}

function changeFiatLabel() {
  var lightningTipAmount = document.getElementById('lightningTipAmount');
  var inputAmount = lightningTipAmount.value;
  var fiatPrice = calculateFiatPrice(inputAmount);
  var label = document.querySelector('#customAmount label');
  label.innerHTML = fiatPrice;
}

function calculateFiatPrice(sat) {
  var amounts = document.querySelector('section.amounts');
  switch (document.documentElement.lang) {
    case 'de':
      var price = amounts.dataset.btc_eur;
      var locale = "de-DE";
      var currency = "EUR";
      break;
    case 'en':
      var price = amounts.dataset.btc_usd;
      var locale = "en-US";
      var currency = "USD";
      break;
    default:
      var price = amounts.dataset.btc_usd;
      break;
  };
  var fiatPrice = Math.round((price * (sat / 100000000) + 0.00001) * 100) / 100;
  
  return fiatPrice.toLocaleString(locale,
                                 {style: 'currency', 
                                  currency: currency });
}

function printFiatPrice() {
  var amounts = document.querySelector('section.amounts');
  var buttons = amounts.children;
  for (var i = 0; i < buttons.length; i++) {
    if (buttons[i].tagName == "BUTTON") {
      var button = buttons[i];
      var price = calculateFiatPrice(button.dataset.sat);
      button.insertAdjacentHTML('beforeend', "<span>"+price+"</span>");
    }
  }
}

function getBitcoinPrice() {
  var request = new XMLHttpRequest();
  request.onreadystatechange = function () {
    if (request.readyState === 4 && request.status === 200) {
      var json = JSON.parse(request.responseText);
      var amounts = document.querySelector('section.amounts');
      amounts.dataset.btc_eur = json.eur;
      amounts.dataset.btc_usd = json.usd;
      printFiatPrice();
    }

  };
  // var requestUrl = window.location.href + "inc/lightningTip.php";
  request.open("POST", requestUrl, true);
  request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  var params = "Action=getfiatprice";
  request.send(params);
}

function copyToClipboard(text) {
  if (window.clipboardData && window.clipboardData.setData) {
    // IE specific code path to prevent textarea being shown while dialog is visible.
    return clipboardData.setData("Text", text); 

  } else if (document.queryCommandSupported &&
             document.queryCommandSupported("copy")) {
    var textarea = document.createElement("textarea");
    textarea.textContent = text;
    textarea.style.position = "fixed";  // Prevent scrolling to bottom of page in MS Edge.
    document.body.appendChild(textarea);
    textarea.select();
    try {
      return document.execCommand("copy");  // Security exception may be thrown by some browsers.
    } catch (ex) {
      console.warn("Copy to clipboard failed.", ex);
      return false;
    } finally {
      document.body.removeChild(textarea);
    }
  }
}

function main() {
  populateButtons();
  getBitcoinPrice();
  attachListeners();
}

main();