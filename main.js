var app = new Vue({
  el: '.lightning',
  data: {
    currentFunding: 400,
    pastFundingTargets: [],
    currentFundingTargets: [
      { fundingTitle: 'Buy us a Coffee',
        fundingTarget: 500,
        active: true,
        id: 1 }
    ],
    futureFundingTargets: [
      { fundingTitle: 'Buy us a Pizza',
        fundingTarget: 2000,
        active: false,
        id: 2 },
      { fundingTitle: 'Help us with the Servercosts',
        fundingTarget: 5000,
        active: false,
        id: 3 },
      { fundingTitle: 'Buy us a Car',
        fundingTarget: 200000,
        active: false,
        id: 4 }
    ],
  },
  methods: {
    fundingPercentage: function (fundingTarget) {
      return (this.currentFunding / fundingTarget) * 100 + "%";
    },
    addNewFunding: function () {
      app.pastFundingTargets.push(app.currentFundingTargets.shift());
      app.currentFundingTargets.push(app.futureFundingTargets.shift());
    },
    increment: function () {
      app.currentFunding += 100;
    }
  },
  watch : {
    currentFunding: function() {
      if (app.currentFunding >= app.currentFundingTargets[0].fundingTarget) {
        setTimeout(function() {
          app.addNewFunding();
        }, 1000);
      }
    }
  }
})