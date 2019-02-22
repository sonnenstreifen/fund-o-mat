var app = new Vue({
  el: '.lightning',
  data: {
    currentFunding: 0,
    pastFundingTargets: [],
    currentFundingTargets: [
      { fundingTitle: 'Lad uns auf einen Kaffee ein',
        fundingTarget: 750,
        percentage: 0,
        id: 1 }
    ],
    futureFundingTargets: [
      { fundingTitle: 'Lad uns auf eine Pizza ein',
        fundingTarget: 2000,
        percentage: 0,
        id: 2 },
      { fundingTitle: 'Hilf uns mit den Serverkosten',
        fundingTarget: 5000,
        percentage: 0,
        id: 3 },
      { fundingTitle: 'Schenke uns ein Lächeln',
        fundingTarget: 15000,
        percentage: 0,
        id: 4 }
    ],
  },
  methods: {
    fundingPercentage: function (fundingTarget) {
      this.percentage = (this.currentFunding / fundingTarget) * 100;
      console.log(this.percentage);
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
      console.log(this.currentFundingTargets[0].percentage);
      return this.currentFundingTargets[0].percentage + '%';
    },
    setActive: function () {
      document.querySelector('.progress').classList.add('active');
    },
    resetActive: function () {
      document.querySelector('.progress').classList.remove('active');
    }
  },
  watch : {
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
      }, 2000);
    }
  }
})