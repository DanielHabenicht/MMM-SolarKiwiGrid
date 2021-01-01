/*
 * Magic Mirror module for displaying Enphase Solar data
 * By Thomas Krywitsky
 * MIT Licensed
 */

Module.register("MMM-SolarKiwiGrid", {
  // Default module config.
  defaults: {
    url: "https://api.enphaseenergy.com/api/v2/systems/",
    refreshInterval: 1000 * 60 * 5 //5 minutes
  },

  start: function () {
    Log.info("Starting module: " + this.name);

    this.titles = ["Add some values"];
    this.suffixes = ["%"];
    this.results = ["Loading"];
    this.loaded = false;
    this.getSolarData();

    var self = this;
    //Schedule updates
    setInterval(function () {
      self.getSolarData();
      self.updateDom();
    }, this.config.refreshInterval);
  },

  //Import additional CSS Styles
  getStyles: function () {
    return ["solar.css"];
  },

  //Contact node helper for solar data
  getSolarData: function () {
    Log.info("SolarApp: getting data");

    this.sendSocketNotification("GET_SOLAR", {
      config: this.config
    });
  },

  //Handle node helper response
  socketNotificationReceived: function (notification, payload) {
    if (notification === "SOLAR_DATA") {
      this.titles = payload.titles;
      this.results = payload.results;
      // PowerIn
      // PowerOut
      // PowerConsumedFromGrid
      this.loaded = true;
      this.updateDom(1000);
    }
  },

  // Override dom generator.
  getDom: function () {
    var wrapper = document.createElement("div");
    if (this.config.url === "") {
      wrapper.innerHTML = "Missing configuration.";
      return wrapper;
    }

    //Display loading while waiting for API response
    if (!this.loaded) {
      wrapper.innerHTML = "Loading...";
      return wrapper;
    }

    var tb = document.createElement("table");

    if (this.config.header) {
      var imgDiv = document.createElement("div");

      var sTitle = document.createElement("p");
      sTitle.innerHTML = this.config.header;
      sTitle.className += " thin";

      if (this.config.headerIcon) {
        var icon = document.createElement("i");
        icon.className = "fas " + this.config.headerIcon;
        sTitle.style = "margin: 0px 0px 0px 15px;";
        imgDiv.appendChild(icon);
      }
      imgDiv.appendChild(sTitle);

      var divider = document.createElement("hr");
      divider.className += " dimmed";
      wrapper.appendChild(imgDiv);
      wrapper.appendChild(divider);
    }

    for (var i = 0; i < this.results.length; i++) {
      var row = document.createElement("tr");

      var titleTr = document.createElement("td");
      var dataTr = document.createElement("td");

      titleTr.innerHTML = this.titles[i] + ":";
      dataTr.innerHTML = this.results[i] + " " + this.suffixes[i];

      titleTr.className += " medium regular bright";
      dataTr.classname += " medium light normal";

      row.appendChild(titleTr);
      row.appendChild(dataTr);

      tb.appendChild(row);
    }
    wrapper.appendChild(tb);
    return wrapper;
  }
});