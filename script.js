// GIVEN a weather dashboard with form inputs
// WHEN I search for a city
// THEN I am presented with current and future conditions for that city and that city is added to the search history
// WHEN I view current weather conditions for that city
// THEN I am presented with the city name, the date, an icon representation of weather conditions, the temperature, the humidity, the wind speed, and the UV index
// WHEN I view the UV index
// THEN I am presented with a color that indicates whether the conditions are favorable, moderate, or severe
// WHEN I view future weather conditions for that city
// THEN I am presented with a 5-day forecast that displays the date, an icon representation of weather conditions, the temperature, the wind speed, and the humidity
// WHEN I click on a city in the search history
// THEN I am again presented with current and future conditions for that city


    let searchBtnEl = document.querySelector("#search-city-btn");
    let btnContainerEl = document.querySelector("#created-cities-container");
    let userSearch = document.getElementById("input-city");
    let currentWeatherContainer = document.querySelector(".current-weather-container");
    let futureForecastContainer = document.querySelector("#future-forecast-container");
    let savedBtns;
    let cityButtons = [];
    
    const apiKey = "8cf3ec2307733a32bbd3e39236609609";
    
    searchBtnEl.addEventListener("click", function () {
        currentWeatherContainer.textContent = "";
        let userSearchValue = userSearch.value;
        if (!userSearchValue) {
            window.alert("Please search for a city.")
        } else if (cityButtons.includes(userSearchValue)) {
            geoAPIurl = `https://api.openweathermap.org/geo/1.0/direct?q=${userSearchValue}&limit=5&appid=${apiKey}`;
            getCoordinates();
        } else {
            geoAPIurl = `https://api.openweathermap.org/geo/1.0/direct?q=${userSearchValue}&limit=5&appid=${apiKey}`;
            getCoordinates(userSearchValue);
            saveSearch(userSearchValue);
        }
    });
    
    function getCoordinates(city) {
        let geoAPIurl = `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=5&appid=${apiKey}`;
        fetch(geoAPIurl)
        .then(function(response) {
            return response.json();
        })
        .then(function(data){
            currentWeatherContainer.setAttribute("style", "display: block");
            lat = data[0].lat;
            lon = data[0].lon;
            getCurrentWeather(lat, lon, city);
        })
        .catch(err => console.error(err))
    };
    
    function getCurrentWeather (lat, lon, city) {
        currentWeatherContainer.innerHTML = "";
        let weatherAPIurl = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&units=imperial&appid=${apiKey}`
        fetch(weatherAPIurl)
        .then(function(response) {
                return response.json();
        })
        .then(function(data){
            console.log(data);
            
            let cityTitleEl = document.createElement("h1");
            cityTitleEl.textContent = city;
            currentWeatherContainer.appendChild(cityTitleEl)
            
            let iconEl = document.createElement("img");
            let currentIcon = data.current.weather[0].icon
            let iconUrl = `https://openweathermap.org/img/wn/${currentIcon}@2x.png`
            iconEl.setAttribute("src", iconUrl);
            cityTitleEl.appendChild(iconEl);
    
            
            let currentDate = document.createElement("h3");
            var dayname = new Date(data.current.dt * 1000).toLocaleDateString("en", { weekday: "long", month: "long", day: "numeric", year: "numeric"});
            currentDate.textContent = dayname;
            currentWeatherContainer.appendChild(currentDate);
    
        
            let currentTemp = document.createElement("p");
            
            currentTemp.textContent = `Temp: ${Math.floor(data.current.temp)}°F`;
            currentWeatherContainer.appendChild(currentTemp);
            
            let currentHumidity = document.createElement("p");
            currentHumidity.textContent = `Humidity: ${data.current.humidity}%`;
            currentWeatherContainer.appendChild(currentHumidity);
            
            let currentWind = document.createElement("p");
            currentWind.textContent = "Wind: " + data.current.wind_speed + " mph";
            currentWeatherContainer.appendChild(currentWind);
           
    
            let currentUV = document.createElement("p");
            currentUV.textContent = "UV Index: ";
            let currentIndex = document.createElement("span");
            let uvIndex = data.current.uvi
            currentIndex.textContent = uvIndex;
            if (uvIndex <= 2) {
                currentIndex.setAttribute("id", "low")
            }
            if (uvIndex > 2 && uvIndex <= 7) {
                currentIndex.setAttribute("id", "moderate")
            }
            if (uvIndex > 7 && uvIndex <= 10) {
                currentIndex.setAttribute("id", "high")
            }
            if (uvIndex > 10) {
                currentIndex.setAttribute("id", "extreme")
            }
            currentUV.appendChild(currentIndex);
            currentWeatherContainer.appendChild(currentUV);
            get5Day(data.daily);
        })
    };
    
    function get5Day(data) {
        futureForecastContainer.textContent = " "

            for (let i = 1; i < 6; i++){
                let futureCard = document.createElement("div")
                futureCard.setAttribute("class", "future-card")
                
                let futureDate = document.createElement("h4");
                var dayname = new Date(data[i].dt * 1000).toLocaleDateString("en", { month: "long", day: "numeric", year: "numeric" });
                futureDate.textContent = dayname;
                futureCard.appendChild(futureDate) ;
            
                let futureIconEl = document.createElement("img")
                let futureIcon = data[i].weather[0].icon
                let futureIconUrl = `https://openweathermap.org/img/wn/${futureIcon}@2x.png`
                futureIconEl.setAttribute("src", futureIconUrl);
                futureCard.appendChild(futureIconEl);
          
                let futureTemp = document.createElement("p");
                futureTemp.textContent = `Temp: ${Math.floor(data[i].temp.day)}°F`;
                futureCard.appendChild(futureTemp);
           
                let futureWind= document.createElement("p");
                futureWind.textContent = `Wind: ${Math.floor(data[i].wind_speed)} MPH`;
                futureCard.appendChild(futureWind);
           
                let futureHumidity = document.createElement("p");
                futureHumidity.textContent = `Humidity: ${data[i].humidity}%`;
                futureCard.appendChild(futureHumidity);
                futureForecastContainer.appendChild(futureCard)
            }
    };
    
    function makeButton() {
        btnContainerEl.innerHTML = '';
       
        for (let i = 0; i < cityButtons.length; i++){
            let newBtnEl = document.createElement("button");
            newBtnEl.textContent = cityButtons[i];
            newBtnEl.setAttribute("class", "btn")
            newBtnEl.setAttribute("class", "full-size")
            newBtnEl.setAttribute("id", "saved-button")
            newBtnEl.setAttribute("class", "btn-history")
            newBtnEl.setAttribute("data-search", cityButtons[i])
            btnContainerEl.appendChild(newBtnEl);
        }
    }
    
    btnContainerEl.onclick = handleHistoryClick;
    
    function handleHistoryClick (event) {
        if (!event.target.matches(".btn-history")) {
            return;
        } 
        let btn = event.target;
        let city = btn.getAttribute("data-search")
        getCoordinates(city);
    };
    
    function saveSearch(city) {
        cityButtons.push(city);
        localStorage.setItem("cities", JSON.stringify(cityButtons));
        makeButton();
    }
    
    
    function init () {
        let storedHistory = localStorage.getItem("cities");
        if (storedHistory) {
            cityButtons = JSON.parse(storedHistory);
        }
        makeButton();
    }
    
    init();