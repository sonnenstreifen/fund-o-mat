var app = new Vue({
  el: '.lightning',
  data: {
    currentFunding: 0,
    pastFundingTargets: [],
    currentFundingTargets: [],
    futureFundingTargets: [],
  },
  methods: {
    fundingPercentage: function (fundingTarget) {
      this.percentage = (this.currentFunding / fundingTarget) * 100;
      if (this.percentage > 100) {
        this.percentage = 100;
      }
      return this.percentage;
    },
    addNewFundingTarget: function () {
      app.pastFundingTargets.push(app.currentFundingTargets.shift());
      app.currentFundingTargets.push(app.futureFundingTargets.shift());
    },
    getPercentage: function () {
      return this.currentFundingTargets[0].percentage + '%';
    },
    setActive: function () {
      document.querySelector('.progress').classList.add('active');
    },
    resetActive: function () {
      document.querySelector('.progress').classList.remove('active');
    },
    listenForFunding: function () {
      var request = new XMLHttpRequest();

      request.onreadystatechange = function () {
        if (request.readyState === 4 && request.status === 200) {
          var json = JSON.parse(request.responseText);

          if (json.donations && json.donations != app.currentFunding) {
            console.log("new donations amount: " + json.donations);
            app.currentFunding = json.donations;
          }
        }

      };
//      var requestUrl = window.location.href + "inc/lightningTip.php";
      request.open("POST", requestUrl, true);
      request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
      var params = "Action=getdonations";
      request.send(params);
    }
  },
  watch: {
    currentFunding: function() {
      app.setActive();
      app.currentFundingTargets[0].percentage =
        app.fundingPercentage(app.currentFundingTargets[0].fundingTarget);
      if (app.currentFunding >= app.currentFundingTargets[0].fundingTarget) {
        setTimeout(function() {
          app.addNewFundingTarget();
          setTimeout(function() {
            app.currentFundingTargets[0]
              .percentage = app
                .fundingPercentage(app
                  .currentFundingTargets[0].fundingTarget);
            app.setActive();
            setTimeout(function() {
              app.resetActive();
            }, 2000);
          }, 100);
        }, 2000);
      }
      setTimeout(function() {
        app.resetActive();
      }, 1800);
    }
  },
  mounted: function() {
    this.$nextTick(function() {
      window.setInterval(function() {
        app.listenForFunding();
      },2000);
    });
  },
  created: function() {
    console.log("init");
    var lang = document.documentElement.lang;
    loadJSON(function(response) {
      var fundingTargets = JSON.parse(response);
      app.currentFundingTargets.push(fundingTargets.shift());
      app.futureFundingTargets = fundingTargets;
    }, lang);
  }
});

function loadJSON(callback, lang) {
  var xobj = new XMLHttpRequest();
      xobj.overrideMimeType("application/json");
  xobj.open('GET', './inc/' + lang + '_fundingTargets.json', true);
  xobj.onreadystatechange = function () {
    if (xobj.readyState == 4 && xobj.status == "200") {
      callback(xobj.responseText);
    }
  };
  xobj.send(null);
}
