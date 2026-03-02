// ---------- helpers ----------
function setStatus(el, msg) {
  el.textContent = msg || "";
}

function showImage(imgEl, url) {
  imgEl.src = url;
  imgEl.style.display = "block";
}

async function safeFetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.json();
}

// ---------- 1) Dog API ----------
const dogBtn = document.getElementById("dogBtn");
const dogStatus = document.getElementById("dogStatus");
const dogImg = document.getElementById("dogImg");

async function loadDog() {
  try {
    setStatus(dogStatus, "Loading...");
    const data = await safeFetchJson("https://dog.ceo/api/breeds/image/random");
    showImage(dogImg, data.message);
    setStatus(dogStatus, "✅ Done");
  } catch (err) {
    setStatus(dogStatus, `❌ Error: ${err.message}`);
  }
}
dogBtn.addEventListener("click", loadDog);

// ---------- 2) Cat API ----------
const catBtn = document.getElementById("catBtn");
const catStatus = document.getElementById("catStatus");
const catImg = document.getElementById("catImg");

async function loadCat() {
  try {
    setStatus(catStatus, "Loading...");
    const data = await safeFetchJson(
      "https://api.thecatapi.com/v1/images/search",
    );
    // response is an array
    showImage(catImg, data[0].url);
    setStatus(catStatus, "✅ Done");
  } catch (err) {
    setStatus(catStatus, `❌ Error: ${err.message}`);
  }
}
catBtn.addEventListener("click", loadCat);

// ---------- 3) Weather (Open-Meteo + geocoding) ----------
const cityInput = document.getElementById("cityInput");
const weatherBtn = document.getElementById("weatherBtn");
const weatherStatus = document.getElementById("weatherStatus");
const weatherCard = document.getElementById("weatherCard");

async function loadWeather() {
  const city = cityInput.value.trim();
  if (!city) {
    setStatus(weatherStatus, "Type a city name first.");
    return;
  }

  try {
    setStatus(weatherStatus, "Finding location...");
    weatherCard.textContent = "";

    const geo = await safeFetchJson(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`,
    );

    if (!geo.results || geo.results.length === 0) {
      setStatus(weatherStatus, "❌ City not found.");
      return;
    }

    const place = geo.results[0];
    const { latitude, longitude, name, country, admin1 } = place;

    setStatus(weatherStatus, "Loading weather...");
    const w = await safeFetchJson(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,wind_speed_10m&timezone=auto`,
    );

    const temp = w.current.temperature_2m;
    const wind = w.current.wind_speed_10m;

    weatherCard.innerHTML = `
      <strong>${name}${admin1 ? `, ${admin1}` : ""}</strong><br/>
      ${country}<br/><br/>
      🌡️ Temp: <strong>${temp}°C</strong><br/>
      💨 Wind: <strong>${wind} km/h</strong>
    `;
    setStatus(weatherStatus, "✅ Updated");
  } catch (err) {
    setStatus(weatherStatus, `❌ Error: ${err.message}`);
  }
}
weatherBtn.addEventListener("click", loadWeather);

// ---------- 4) Currency (Frankfurter, no key) ----------
const usdInput = document.getElementById("usdInput");
const fxBtn = document.getElementById("fxBtn");
const fxStatus = document.getElementById("fxStatus");
const fxCard = document.getElementById("fxCard");

async function loadFX() {
  const amount = Number(usdInput.value || 1);
  if (Number.isNaN(amount) || amount < 0) {
    setStatus(fxStatus, "Enter a valid amount.");
    return;
  }

  try {
    setStatus(fxStatus, "Loading rate...");
    fxCard.textContent = "";

    const data = await safeFetchJson(
      `https://api.frankfurter.app/latest?amount=${amount}&from=USD&to=EUR`,
    );

    const eur = data.rates.EUR;
    fxCard.innerHTML = `
      <strong>${amount.toFixed(2)} USD</strong> = <strong>${eur.toFixed(2)} EUR</strong><br/>
      <span style="opacity:.8">Date: ${data.date}</span>
    `;
    setStatus(fxStatus, "✅ Converted");
  } catch (err) {
    setStatus(fxStatus, `❌ Error: ${err.message}`);
  }
}
fxBtn.addEventListener("click", loadFX);

// ---------- 5) “Trending” shows (TVMaze, no key) ----------
const showsBtn = document.getElementById("showsBtn");
const showsStatus = document.getElementById("showsStatus");
const showsList = document.getElementById("showsList");

async function loadShows() {
  try {
    setStatus(showsStatus, "Loading...");
    showsList.innerHTML = "";

    // TVMaze: list of shows (not truly "trending" but good for display)
    const data = await safeFetchJson("https://api.tvmaze.com/shows");

    const top10 = data.slice(0, 10);
    for (const show of top10) {
      const li = document.createElement("li");
      li.innerHTML = `
        <strong>${show.name}</strong><br/>
        ⭐ Rating: ${show.rating?.average ?? "N/A"} • ${show.genres?.slice(0, 2).join(", ") || "—"}
      `;
      showsList.appendChild(li);
    }

    setStatus(showsStatus, "✅ Loaded 10 shows");
  } catch (err) {
    setStatus(showsStatus, `❌ Error: ${err.message}`);
  }
}
showsBtn.addEventListener("click", loadShows);

// ---------- 6) GitHub user ----------
const ghInput = document.getElementById("ghInput");
const ghBtn = document.getElementById("ghBtn");
const ghStatus = document.getElementById("ghStatus");
const ghProfile = document.getElementById("ghProfile");

async function loadGitHubUser() {
  const user = ghInput.value.trim();
  if (!user) {
    setStatus(ghStatus, "Type a GitHub username.");
    return;
  }

  try {
    setStatus(ghStatus, "Loading...");
    ghProfile.innerHTML = "";

    const data = await safeFetchJson(
      `https://api.github.com/users/${encodeURIComponent(user)}`,
    );

    ghProfile.innerHTML = `
      <img src="${data.avatar_url}" alt="${data.login}" />
      <div>
        <div style="font-weight:800">${data.name ?? data.login}</div>
        <div style="color: rgba(231,238,248,.75); font-size:12px; margin:4px 0 8px 0;">
          @${data.login} • ${data.location ?? "Location N/A"}
        </div>
        <div style="font-size:12px; line-height:1.5;">
          👥 Followers: <strong>${data.followers}</strong> • Repos: <strong>${data.public_repos}</strong><br/>
          <a href="${data.html_url}" target="_blank" rel="noreferrer" style="color:#9dd6ff">View profile →</a>
        </div>
      </div>
    `;

    setStatus(ghStatus, "✅ Found user");
  } catch (err) {
    setStatus(ghStatus, `❌ Error: ${err.message}`);
  }
}
ghBtn.addEventListener("click", loadGitHubUser);

// ---------- 7) JokeAPI ----------
const jokeBtn = document.getElementById("jokeBtn");
const jokeStatus = document.getElementById("jokeStatus");
const jokeCard = document.getElementById("jokeCard");

async function loadJoke() {
  try {
    setStatus(jokeStatus, "Loading...");
    jokeCard.textContent = "";

    const data = await safeFetchJson(
      "https://v2.jokeapi.dev/joke/Any?safe-mode",
    );

    if (data.type === "single") {
      jokeCard.textContent = data.joke;
    } else {
      jokeCard.innerHTML = `<strong>${data.setup}</strong><br/><br/>${data.delivery}`;
    }

    setStatus(jokeStatus, "✅ Done");
  } catch (err) {
    setStatus(jokeStatus, `❌ Error: ${err.message}`);
  }
}
jokeBtn.addEventListener("click", loadJoke);

// ---------- 8) Countries (REST Countries) ----------
const countryInput = document.getElementById("countryInput");
const countryBtn = document.getElementById("countryBtn");
const countryStatus = document.getElementById("countryStatus");
const countryCard = document.getElementById("countryCard");

async function loadCountry() {
  const q = countryInput.value.trim();
  if (!q) {
    setStatus(countryStatus, "Type a country name.");
    return;
  }

  try {
    setStatus(countryStatus, "Loading...");
    countryCard.textContent = "";

    const data = await safeFetchJson(
      `https://restcountries.com/v3.1/name/${encodeURIComponent(q)}?fullText=false`,
    );

    const c = data[0];
    const name = c.name?.common ?? "Unknown";
    const capital = c.capital?.[0] ?? "N/A";
    const region = c.region ?? "N/A";
    const population = c.population ? c.population.toLocaleString() : "N/A";
    const flag = c.flags?.png || c.flags?.svg || "";

    countryCard.innerHTML = `
      <div style="display:flex; gap:10px; align-items:center;">
        ${flag ? `<img src="${flag}" alt="${name} flag" style="width:44px; height:30px; border-radius:6px; border:1px solid rgba(255,255,255,.10); object-fit:cover;" />` : ""}
        <strong style="font-size:14px;">${name}</strong>
      </div>
      <div style="margin-top:10px;">
        🏛️ Capital: <strong>${capital}</strong><br/>
        🗺️ Region: <strong>${region}</strong><br/>
        👥 Population: <strong>${population}</strong>
      </div>
    `;

    setStatus(countryStatus, "✅ Found");
  } catch (err) {
    setStatus(countryStatus, `❌ Error: ${err.message}`);
  }
}
countryBtn.addEventListener("click", loadCountry);

// ---------- initial loads ----------
loadDog();
loadCat();
loadShows();
loadJoke();
