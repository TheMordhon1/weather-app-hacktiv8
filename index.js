// testing api
const apiUrl =
  "https://api.open-meteo.com/v1/forecast?latitude=-6.1818&longitude=106.8223&daily=weather_code&timezone=Asia%2FBangkok";

fetch(apiUrl)
  .then((response) => {
    console.log(response);
    return response.json();
  })
  .then((result) => {
    const data = result;
    console.log(data);
    document.getElementById("location").innerHTML = data.timezone;
    return data;
  })
  .catch((err) => {
    console.log(err);
  });
