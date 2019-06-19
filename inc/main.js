var app = new Vue({
  el: '#lightning',
  data: {
    currentFunding: 0,
    pastFundingTargets: [],
    fundingTargets: [],
    currentFundingTarget: [],
    lastFundingIndex: 0,
  },
  methods: {
    fundingPercentage: function (fundingTarget) {
      this.percentage = (this.currentFunding / fundingTarget) * 100;
      if (this.percentage > 100) {
        this.percentage = 100;
      }
      return this.percentage;
    },
    addNewFundingTarget: function (fundingTarget) {
      if (fundingTarget.fundingTarget > app.currentFundingTarget.fundingTarget) {
        app.currentFundingTarget.percentage = 0;
        let percentage = app.fundingPercentage(fundingTarget.fundingTarget);
        app.pastFundingTargets.push(app.currentFundingTarget);
        app.currentFundingTarget = fundingTarget;
        setTimeout(function() {
          app.setActive();
          app.currentFundingTarget.percentage = percentage;
        }, 100);
      }
    },
    setNewFunding: function () {
      let wait = 0;
      let i = app.lastFundingIndex;
      let once = true;
      let last = i;
      if (i > 0) {
        once = false;
      }
      for (i = app.lastFundingIndex; i < app.fundingTargets.length; i++) {
        let fundingTarget = app.fundingTargets[i];
        if (app.currentFunding >= fundingTarget.fundingTarget) {

          let next = i + 1;
          if (next in app.fundingTargets) {
            wait = wait + 2100;
            app.currentFundingTarget.percentage = 100;
            setTimeout(function() {
              app.addNewFundingTarget(app.fundingTargets[next]);
            }, wait);
            last = next;
          }
        } else {
          if (once) {
            setTimeout(function() {
              app.addNewFundingTarget(app.fundingTargets[last]);
            }, wait);
            once = false;
          }
        }
        app.lastFundingIndex = last;
      }
      wait = wait + 2100;
      setTimeout(function() {
        app.resetActive();
      }, wait);
    },
    getFundingTitle: function () {
      return this.currentFundingTarget.fundingTitle;
    },
    getPercentage: function () {
      return this.currentFundingTarget.percentage + '%';
    },
    setActive: function () {
      document.querySelector('.progress').classList.add('active');
    },
    resetActive: function () {
      document.querySelector('.progress').classList.remove('active');
    },
    getOverallPercentage: function (fundingTarget) {
      let percentage = (fundingTarget / app.currentFunding) *
                       (app.currentFunding / app.currentFundingTarget.fundingTarget) * 100;
      return percentage + "%";
    },
    listenForFunding: function () {
      var request = new XMLHttpRequest();

      request.onreadystatechange = function () {
        if (request.readyState === 4 && request.status === 200) {
          var json = JSON.parse(request.responseText);

          if (json.donations && json.donations > app.currentFunding) {
            app.currentFunding = json.donations;
          }
        }

      };
      request.open("POST", requestUrl, true);
      request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
      var params = "Action=getdonations";
      request.send(params);
    }
  },
  watch: {
    currentFunding: function() {
      this.setActive();
      app.currentFundingTarget.percentage = app.fundingPercentage(app.currentFundingTarget.fundingTarget);
      app.setNewFunding();
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
      app.fundingTargets = fundingTargets;
      app.currentFundingTarget = fundingTargets[0];
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
