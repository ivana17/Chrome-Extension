const API_KEY = "AIzaSyBr_DbMcyaBRC8CG2OYmoir6v6m9HRbT-s";

let chromeUser = "";
let hr = 0;
let min = 0;
let sec = 0;
let total_time = 0;
let hours_counter = [0, 0, 0, 0, 0, 0];
let goal_alert = 0;
const TECH_TIME = 1;
const TECH_PAUSE = 1;
let tech_time = TECH_TIME;
let tech_pause = TECH_PAUSE;
let pause_mode = false;
const motivations = [
  "“The secret of getting ahead is getting started.” – Mark Twain",
  "“It’s hard to beat a person who never gives up.” – Babe Ruth",
  "“Do one thing every day that scares you.” – Eleanor Roosevelt",
  "“Keep your eyes on the stars, and your feet on the ground.” – Theodore Roosevelt",
  "“Never give up on a dream just because of the time it will take to accomplish it. The time will pass anyway.” – Earl Nightingale",
  "“If you work on something a little bit every day, you end up with something that is massive.” – Kenneth Goldsmith",
  "“Opportunities don't happen, you create them.” – Chris Grosser",
  "“If you don't value your time, neither will others. Stop giving away your time and talents--start charging for it.” – Kim Garst",
  "“Do the hard jobs first. The easy jobs will take care of themselves.” – Dale Carnegie",
  "“The future depends on what you do today.” – Mahatma Gandhi",
  "“Start by doing what’s necessary, then what’s possible; and suddenly you are doing the impossible.” – Saint Francis",
];
let motivIndex = Math.floor(Math.random() * (motivations.length - 1));

const currentDate = () => {
  var today = new Date();
  var date =
    today.getDate() + "." + (today.getMonth() + 1) + "." + today.getFullYear();
  return date;
};

// Chart
var myChartComponent = document.getElementById("myChart").getContext("2d");

var chartOpt = {
  responsive: true,
  title: {
    display: false,
    text: "Average studying time",
    fontSize: "20",
    fontColor: "white",
  },
  legend: {
    display: true,
    position: "right",
    labels: {
      fontColor: "white",
    },
  },
  tooltips: {
    display: true,
  },
};

var myChart = new Chart(myChartComponent, {
  type: "pie",
  data: {
    labels: [
      "Zero hours",
      "Less than 1h",
      "Between 1h and 2h",
      "Between 2h and 3h",
      "Between 3h and 5h",
      "More than 5h",
    ],
    datasets: [
      {
        backgroundColor: [
          "rgba(192, 192, 192, 0.7)",
          "#00ffff",
          "rgba(153, 102, 255, 0.6)",
          "#97fba0",
          "rgba(75, 192, 192, 0.6)",
          "#97b1fb",
        ],
        data: hours_counter,
        borderColor: "rgba(255,255,255)",
        borderWidth: "1",
      },
    ],
  },
  options: chartOpt,
});

const updateChart = () => {
  myChart.data.datasets[0].data = hours_counter;
  myChart.update();
};

const setTotalTime = () => {
  let total_h = parseInt(total_time / 3600);
  let total_m = parseInt((total_time % 3600) / 60);
  let total_s = parseInt((total_time % 3600) % 60);
  total_h = total_h === 0 ? "" : total_h + "h ";
  total_m = total_m === 0 ? "" : total_m + "m ";
  document.getElementById("book-page2").innerHTML =
    total_h + total_m + total_s + "s";
};

const loadTotalTimeFromLocalStorage = (info) => {
  if (info.updated === currentDate() && info.data.length !== 0) {
    total_time = parseInt(info.data[0]);
    setTotalTime();
  } else {
    total_time = 0;
    document.getElementById("book-page2").innerHTML = "Waiting for it!";
  }
};

// Login
const loginTheGoogleUser = () => {
  chrome.identity.getProfileUserInfo({ accountStatus: "ANY" }, (userInfo) => {
    chromeUser = userInfo.email;
  });
};

const saveTheUserState = () => {
  stopTheSwatch();
  document.querySelector(".logged-in-user").innerHTML = "";
};

const setHoursCounter = (data) => {
  hours_counter = [0, 0, 0, 0, 0, 0];
  data.forEach((time) => {
    if (time >= 0 && time < 3600) hours_counter[1]++;
    else if (time >= 3600 && time < 7200) hours_counter[2]++;
    else if (time >= 7200 && time < 10800) hours_counter[3]++;
    else if (time >= 10800 && time < 18000) hours_counter[4]++;
    else hours_counter[5]++;
  });
  if (hours_counter.every((item) => item === 0)) hours_counter[0] = 1;
  else hours_counter[0] = 0;
  updateChart();
};

// User - menu;
document.getElementById("user-menu").addEventListener("click", () => {
  document.getElementById("myPopup").classList.toggle("show");
});

// Set Goal
document.getElementById("set-goal").addEventListener("click", () => {
  document.querySelector(".goal-container").style.display = "inline-block";
});

// Clear History
document.getElementById("clear-history").addEventListener("click", () => {
  hours_counter = [0, 0, 0, 0, 0, 0];
  let info = JSON.parse(localStorage[localStorage["logged_in_user"]]);
  info.data = [];
  info.updated = currentDate();
  localStorage[localStorage["logged_in_user"]] = JSON.stringify(info);
  updateChart();
});

// Logout
document.getElementById("logout-button").addEventListener("click", () => {
  if (localStorage["logged_in_user"] !== undefined) {
    saveTheUserState();
    localStorage["logged_in_user"] = "";
    document.getElementById("unregistered").style.display = "inline-block";
    document.getElementById("myPopup").classList.toggle("show");
    document.getElementById("logout-button").style.display = "none";
    document.getElementById("user-menu").style.display = "none";
    document.getElementById("chart-div").style.display = "none";
    total_time = 0;
    document.getElementById("book-page2").innerHTML = "Waiting for it!";
    hours_counter = [0, 0, 0, 0, 0, 0];
    updateChart();
  }
});

// Login
chrome.identity.getProfileUserInfo({ accountStatus: "ANY" }, (userInfo) => {
  chromeUser = userInfo.email;
});

document.getElementById("login-done-button").addEventListener("click", () => {
  let name = document.getElementById("login-name").value;
  let passw = document.getElementById("login-psw").value;
  if (name !== "" && passw !== "") {
    if (localStorage[name] === undefined) {
      alert("Username " + name + " doesn't exist.");
    } else {
      let info = JSON.parse(localStorage[name]);
      if (info.psw !== passw) {
        alert("Wrong password. Try again.");
      } else {
        localStorage["logged_in_user"] = name;
        loadTotalTimeFromLocalStorage(info);
        setHoursCounter(info.data);

        document.getElementById("unregistered").style.display = "none";
        document.querySelector(".logged-in-user").innerHTML = name;
        document.getElementById("logout-button").style.display = "inline-block";
        document.getElementById("user-menu").style.display = "inline-block";
        document.getElementById("chart-div").style.display = "block";
      }
    }
  }
});

document.querySelector(".googleButton").addEventListener("click", () => {
  document.getElementById("login-modal").style.display = "none";
  loginTheGoogleUser();
  if (chromeUser !== "") {
    document.getElementById("unregistered").style.display = "none";
    document.querySelector(".logged-in-user").innerHTML = chromeUser;
    document.getElementById("logout-button").style.display = "inline-block";
    document.getElementById("user-menu").style.display = "inline-block";
    document.getElementById("chart-div").style.display = "block";

    localStorage["logged_in_user"] = chromeUser;
    if (localStorage[chromeUser] !== undefined) {
      let info = JSON.parse(localStorage[chromeUser]);
      loadTotalTimeFromLocalStorage(info);
      setHoursCounter(info.data);
    } else {
      localStorage[chromeUser] = JSON.stringify({
        updated: currentDate(),
        data: [],
      });
    }
  } else {
    chrome.tabs.create({ url: "https://accounts.google.com/" });
  }
});

// Register
document.getElementById("login-button").addEventListener("click", () => {
  document.getElementById("login-modal").style.display = "block";
});

document.querySelector(".register-button").addEventListener("click", () => {
  document.getElementById("signup-modal").style.display = "block";
});

document.getElementById("signup-modal-close").addEventListener("click", () => {
  document.getElementById("signup-modal").style.display = "none";
});

document.getElementById("login-modal-close").addEventListener("click", () => {
  document.getElementById("login-modal").style.display = "none";
});

document.getElementById("signup-done-button").addEventListener("click", () => {
  let name = document.getElementById("signup-name").value;
  let passw = document.getElementById("signup-psw").value;

  if (name !== "" && passw !== "") {
    if (localStorage[name] === undefined) {
      localStorage["logged_in_user"] = name;
      localStorage[name] = JSON.stringify({
        psw: passw,
        updated: currentDate(),
        data: [],
      });

      document.getElementById("unregistered").style.display = "none";

      document.querySelector(".logged-in-user").innerHTML = name;
      document.getElementById("logout-button").style.display = "inline-block";
      document.getElementById("user-menu").style.display = "inline-block";
      document.getElementById("book-page2").innerHTML = "Waiting for it!";
    } else {
      alert("user " + name + " already exists");
    }
  }
});

// On Load
window.addEventListener("load", () => {
  motivIndex = Math.floor(Math.random() * (motivations.length - 1));
  document.getElementById("motiv-text").innerHTML = motivations[motivIndex];
  if (
    localStorage["logged_in_user"] !== undefined &&
    localStorage["logged_in_user"] !== ""
  ) {
    document.getElementById("unregistered").style.display = "none";
    document.getElementById("chart-div").style.display = "block";
    document.querySelector(".logged-in-user").innerHTML =
      localStorage["logged_in_user"];
    document.getElementById("logout-button").style.display = "inline-block";
    document.getElementById("user-menu").style.display = "inline-block";
    if (localStorage[localStorage["logged_in_user"]] !== undefined) {
      let info = JSON.parse(localStorage[localStorage["logged_in_user"]]);
      loadTotalTimeFromLocalStorage(info);
      setHoursCounter(info.data);
    } else {
      total_time = 0;
      document.getElementById("book-page2").innerHTML = "Waiting for it!";
    }
  } else {
    document.getElementById("unregistered").style.display = "inline-block";
    document.getElementById("logout-button").style.display = "none";
    document.getElementById("user-menu").style.display = "none";
    document.getElementById("chart-div").style.display = "none";
    document.getElementById("book-page2").innerHTML = "Waiting for it!";
    hours_counter = [0, 0, 0, 0, 0, 0];
    total_time = 0;
  }
});

var called = 0;
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.what === "sign-in") {
    chrome.identity.getProfileUserInfo({ accountStatus: "ANY" }, (userInfo) => {
      loginTheGoogleUser();
      if (++called % 2 == 0) {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs[0].title.includes("https://myaccount.google.com/")) {
            console.log(tabs[0].title);
            chrome.tabs.remove(tabs[0].id);
            if (chromeUser !== "") {
              document.querySelector(".logged-in-user").innerHTML = chromeUser;
              localStorage["logged_in_user"] = chromeUser;
              document.getElementById("unregistered").style.display = "none";
              document.getElementById("logout-button").style.display =
                "inline-block";
              document.getElementById("user-menu").style.display =
                "inline-block";
              let info = JSON.parse(localStorage[chromeUser]);
              loadTotalTimeFromLocalStorage(info);
            }
            return true;
          }
        });
      }
    });
  } else if (msg.what === "check-in-login") {
    chrome.identity.getProfileUserInfo((userInfo) => {
      chromeUser = userInfo.email;
      if (chromeUser === "" || chromeUser !== localStorage["logged_in_user"]) {
        saveTheUserState();
      }
    });
  }
});

// Stopwatch: Buttons (Start, Pause, Stop, Reset)
let stoptime = true;
const swatch = document.getElementById("clock");

document.getElementById("start").addEventListener("click", () => {
  if (stoptime == true) {
    stoptime = false;
    timerCycle();
  }
});

const timerCycle = () => {
  if (stoptime == false) {
    let colorHour = false;
    let colorMinute = false;

    sec = parseInt(sec);
    min = parseInt(min);
    hr = parseInt(hr);

    sec = sec + 1;

    if (sec == 60) {
      min = min + 1;
      colorMinute = true;
      sec = 0;
    }
    if (min == 60) {
      hr = hr + 1;
      colorHour = true;
      min = 0;
      sec = 0;
    }

    if (sec < 10 || sec == 0) {
      sec = "0" + sec;
    }
    if (min < 10 || min == 0) {
      min = "0" + min;
    }
    if (hr < 10 || hr == 0) {
      hr = "0" + hr;
    }

    let swatchColor = pause_mode ? "red" : "#16C797";

    if (colorHour === true) {
      swatch.innerHTML =
        hr.toString().fontcolor(swatchColor) +
        ":" +
        min.toString().fontcolor(swatchColor) +
        ":" +
        sec.toString().fontcolor(swatchColor);
      colorMinute = colorHour = false;
    } else if (colorMinute === true) {
      swatch.innerHTML =
        hr +
        ":" +
        min.toString().fontcolor(swatchColor) +
        ":" +
        sec.toString().fontcolor(swatchColor);
      colorMinute = false;
    } else {
      swatch.innerHTML =
        hr + ":" + min + ":" + sec.toString().fontcolor(swatchColor);
    }

    if (parseInt(sec) === 30 || parseInt(sec) === 0) {
      motivIndex = Math.floor(Math.random() * (motivations.length - 1));
      document.getElementById("motiv-text").innerHTML = motivations[motivIndex];
    }

    var myAudio = new Audio(chrome.runtime.getURL("./sounds/alarm-sound.mp3"));

    if (
      pause_mode === false &&
      parseInt(sec) === 0 &&
      parseInt(min) === tech_time
      //parseInt(sec) === tech_time
    ) {
      document.getElementById("start-pause").style.display = "inline-block";
      document.getElementById("start").style.display = "none";
      document.getElementById("stop").style.opacity = "0.5";
      document.getElementById("reset").style.opacity = "0.5";
      document.getElementById("pause").style.opacity = "0.5";
      pause_mode = true;
      myAudio.play();
      total_time++;
      stopTheSwatch();
      setTotalTime();
    } else if (
      pause_mode === true &&
      parseInt(sec) === 0 &&
      parseInt(min) === tech_pause
      //parseInt(sec) === tech_pause
    ) {
      document.querySelector(".pause-time").style.display = "none";
      pause_mode = false;
      myAudio.play();
      total_time -= tech_pause - 1;
      stopTheSwatch();
      setTotalTime();
      document.getElementById("start-pause").style.display = "none";
      document.getElementById("start").style.display = "inline-block";
      document.getElementById("stop").style.opacity = "1";
      document.getElementById("reset").style.opacity = "1";
      document.getElementById("pause").style.opacity = "1";
    } else {
      total_time++;
      setTotalTime();
      setTimeout("timerCycle()", 1000);
    }
  }
};

document.getElementById("start-pause").addEventListener("click", () => {
  document.querySelector(".pause-time").style.display = "inline-block";
  if (stoptime == true) {
    stoptime = false;
    timerCycle();
  }
});

document.getElementById("pause").addEventListener("click", () => {
  if (stoptime == false) {
    stoptime = true;
  }
});

const stopTheSwatch = () => {
  stoptime = true;
  let user = localStorage["logged_in_user"];
  if (user !== "") {
    let info = JSON.parse(localStorage[user]);
    let seconds = parseInt(hr) * 3600 + parseInt(min) * 60 + parseInt(sec);
    if (info.updated === currentDate()) {
      if (info.data.length === 0) info.data.unshift(seconds);
      else info.data[0] += seconds;
    } else {
      const date = new Date();
      let h = date.getHours();
      let m = date.getMinutes();
      let s = date.getSeconds();
      let timePassed = parseInt(h) * 3600 + parseInt(m) * 60 + parseInt(s);
      if (seconds > timePassed) {
        if (info.data.length === 0) info.data.unshift(seconds);
        else info.data[0] += seconds;
      } else {
        info.data.unshift(seconds);
      }
    }
    info.updated = currentDate();
    setHoursCounter(info.data);
    localStorage[user] = JSON.stringify(info);
  }
  hr = min = sec = 0;
  swatch.innerHTML = "00:00:00";
};

document.getElementById("stop").addEventListener("click", stopTheSwatch);

document.getElementById("reset").addEventListener("click", () => {
  stoptime = true;
  total_time -= hr * 3600 + min * 60 + sec;
  setTotalTime();
  hr = min = sec = 0;
  swatch.innerHTML = "00:00:00";
});

// Define technique
document.getElementById("goal-close").addEventListener("click", () => {
  document.querySelector(".goal-container").style.display = "none";
});

document.getElementById("save-goal-button").addEventListener("click", () => {
  tech_time = document.getElementById("tech-time").value;
  tech_pause = document.getElementById("tech-pause").value;
  tech_time = tech_time !== "" ? parseInt(tech_time) : TECH_TIME;
  tech_pause = tech_pause !== "" ? parseInt(tech_pause) : TECH_PAUSE;
  document.querySelector(".goal-container").style.display = "none";
});

// Dark-Light button
const DL_button = document.querySelector(".dark-light-button");
const DL_circle = document.querySelector(".dark-light-circle");
let DL_buttonOn = false;

DL_button.addEventListener("click", () => {
  if (!DL_buttonOn) {
    DL_buttonOn = true;
    DL_circle.style.animation = "moveCircleRight 1s forwards";
    DL_button.style.animation = "backgroundColorChange 1s forwards";
    document.querySelector(".goal-container").style.display = "none";
    tech_time = 25;
    tech_pause = 5;
  } else {
    DL_buttonOn = false;
    DL_circle.style.animation = "moveCircleLeft 1s forwards";
    DL_button.style.animation = "backgroundReverseColorChange 1s forwards";
    tech_time = TECH_TIME;
    tech_pause = TECH_PAUSE;
    document.querySelector(".pause-time").style.display = "none";
    document.querySelector(".goal-container").style.display = "inline-block";
  }
});
