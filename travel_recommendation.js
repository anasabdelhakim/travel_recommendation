"use strict";

const activePage = window.location.pathname.split("/").pop();
const navLinks = document.querySelectorAll("header nav a");
const searchInput = document.querySelector(".search_Input");
const clearButton = document.getElementById("clearButton");
const searchButton = document.getElementById("searchButton");
const dataDiv = document.querySelector(".data");
const dateDiv = document.querySelector(".date-nfs");
const itemsDiv = dataDiv.querySelector(".items");

clearButton.addEventListener("click", () => {
  searchInput.value = "";
  itemsDiv.innerHTML = "";
  dateDiv.textContent = "";
});

navLinks.forEach((link) => {
  const linkPage = link.getAttribute("href");
  if (linkPage === activePage) {
    link.classList.add("active");
  }
});

let travelData = null;
async function fetchTravels() {
  try {
    const res = await fetch("./travel_recommendation_api.json");
    if (!res.ok) throw new Error("Failed to fetch data");

    travelData = await res.json();
  } catch (error) {
    console.error("An error happened:", error.message);
  }
}
fetchTravels();

function getLocalTime(timeZone) {
  const options = {
    timeZone,
    hour12: true,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  };
  return new Date().toLocaleTimeString("en-US", options);
}

function displayResults(results, locationName, timeZone) {
  itemsDiv.innerHTML = "";

  dateDiv.textContent = `Current local time (${locationName}): ${getLocalTime(
    timeZone
  )}`;

  results.forEach((item) => {
    const itemDiv = document.createElement("div");
    itemDiv.classList.add("item");
    itemDiv.innerHTML = `
      <img class="item-image" src="${item.imageUrl}" alt="${item.name}">
       <div class="listen">
      <div class="title">${item.name}</div>
      <div class="description">${item.description}</div>
      <button class="vist_btn">Visit</button>
      </div>
    `;
    itemsDiv.appendChild(itemDiv);
  });
}

searchButton.addEventListener("click", () => {
  const query = searchInput.value.trim().toLowerCase();
  if (!query || !travelData) return;

  let results = [];
  let locationName = "";
  let timeZone = "UTC";

  for (const country of travelData.countries) {
    for (const city of country.cities) {
      if (
        city.name.toLowerCase().includes(query) ||
        country.name.toLowerCase().includes(query)
      ) {
        results.push(city);
        locationName = city.name;
        timeZone = city.timeZone;
      }
    }
  }

  for (const temple of travelData.temples) {
    if (temple.name.toLowerCase().includes(query)) {
      results.push(temple);
      locationName = temple.name;
      timeZone = temple.timeZone;
    }
  }

  for (const beach of travelData.beaches) {
    if (beach.name.toLowerCase().includes(query)) {
      results.push(beach);
      locationName = beach.name;
      timeZone = beach.timeZone;
    }
  }

  if (results.length > 0) {
    displayResults(results, locationName, timeZone);
  } else {
    dateDiv.textContent = "No results found";
  }
});
