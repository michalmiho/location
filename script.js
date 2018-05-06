function start() {
  getLocation().then(showPosition).catch(showError);
}



function getLocation() {
  return new Promise((resolve, reject) => {
    if (navigator.geolocation) {
      return navigator.geolocation.getCurrentPosition(resolve);
    } else {
      return reject(new Error("Geolocation is not supported by this browser."));
    }
  });
}

function showError(error) {
  document.body.innerHTML = "Could not load your position";
}

function showPosition(position) {
  document.body.innerHTML =
    "Latitude: " +
    position.coords.latitude +
    "<br>Longitude: " +
    position.coords.longitude;
}

window.addEventListener("load", start);
