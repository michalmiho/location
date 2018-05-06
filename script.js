function start() {
  const coordinatesCanvas = document.querySelector("#coordinates");
  const distanceCanvas = document.querySelector("#distance");
  const name = getParamFromLocation(location, "name");
  const server = getParamFromLocation(location, "server");
  const target = getParamFromLocation(location, "target");
  positionLoop(
    { coordinatesCanvas, distanceCanvas },
    20 * 60 * 1000,
    name,
    target,
    server
  );
}

function getLocation() {
  return new Promise((resolve, reject) => {
    if (navigator.geolocation) {
      console.log("coords");
      return navigator.geolocation.getCurrentPosition(resolve, reject);
    } else {
      return reject(new Error("Geolocation is not supported by this browser."));
    }
  });
}

const positionLoop = (canvas, time, name, target, server) => {
  const { coordinatesCanvas, distanceCanvas } = canvas;
  getLocation()
    .then(position => {
      showPosition(coordinatesCanvas)(position);
      return position;
    })
    .then(position => {
      return Promise.all([
        setPositionToServer(server, name, stringifyCoords(position.coords)),
        getPositionFromServer(server, target)
      ]);
    })
    .then(result => {
      const postResult = result[0];
      const getResult = result[1];
      console.log({ postResult, getResult });
      if (!postResult.success || !getResult.success) {
        distanceCanvas.innerHTML = "Could not load / post location";
        return;
      }
      const coords1 = parseCoords(postResult.location);
      const coords2 = parseCoords(postResult.location);
      const distance = getDistanceFromLatLonInKm(
        coords1.latitude,
        coords1.longitude,
        coords2.latitude,
        coords2.longitude
      );

      distanceCanvas.innerHTML =
        "[" +
        new Date().toLocaleString() +
        "]Distance: " +
        distance +
        "km" +
        "<br />" +
        distanceCanvas.innerHTML;
    })
    .then(() => {
      setTimeout(() => positionLoop(canvas, time, name, target, server), time);
    })
    .catch(showError(canvas));
};

function stringifyCoords(coords) {
  return `${coords.latitude};${coords.longitude}`;
}

function parseCoords(coordsString) {
  const [latitude, longitude] = coordsString.split(";");
  return { latitude, longitude };
}

const showError = element => error => {
  element.innerHTML = "Could not load your position";
  console.log(error);
};

const showPosition = element => position => {
  const { latitude, longitude } = position.coords;
  element.innerHTML = "Latitude: " + latitude + "<br>Longitude: " + longitude;
};

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2 - lat1); // deg2rad below
  var dLon = deg2rad(lon2 - lon1);
  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

function getParamFromLocation(loc, name) {
  return (
    (loc.search.split("?")[1] || "")
      .split("&")
      .find(str => str.startsWith(name + "=")) || "="
  ).split("=")[1];
}

function getPositionFromServer(server, name) {
  return fetch(
    "http://" +
      server +
      "/location/?action=read&name=" +
      name +
      "&r=" +
      Math.random()
  ).then(r => r.json());
}

function setPositionToServer(server, name, location) {
  return fetch(
    "http://" +
      server +
      "/location/?action=write&location=" +
      location +
      "&name=" +
      name +
      "&r=" +
      Math.random()
  ).then(r => r.json());
}

window.addEventListener("load", start);
