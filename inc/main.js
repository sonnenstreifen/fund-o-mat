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
    increment: function () {
      app.currentFunding += 100;
    },
    getPercentage: function () {
      return this.currentFundingTargets[0].percentage + '%';
    },
    setActive: function () {
      document.querySelector('.progress').classList.add('active');
    },
    resetActive: function () {
      document.querySelector('.progress').classList.remove('active');
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
  created: function () {
    console.log("init");
    var lang = document.documentElement.lang;
    loadJSON(function(response) {
      var fundingTargets = JSON.parse(response);
      console.log(fundingTargets);
      app.currentFundingTargets.push(fundingTargets.shift());
      app.futureFundingTargets = fundingTargets;
    }, lang);
  }
});

function loadJSON(callback, lang) {
  var xobj = new XMLHttpRequest();
      xobj.overrideMimeType("application/json");
  xobj.open('GET', './inc/'+lang+'_fundingTargets.json', true);
  xobj.onreadystatechange = function () {
    if (xobj.readyState == 4 && xobj.status == "200") {
      callback(xobj.responseText);
    }
  };
  xobj.send(null);
}
