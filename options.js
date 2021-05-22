const submitButton = document.getElementById("submitButton")
const coinSelect = document.getElementById("coin")
const currencySelect = document.getElementById("currency")
const minInput = document.getElementById("minCoin")
const maxInput = document.getElementById("maxCoin")
const timerInput = document.getElementById("timer")
const priceShower = document.getElementById("price-shower")

submitButton.onclick = (e) => {
  e.preventDefault()

  if (
    coinSelect.value !== "none" &&
    currencySelect.value !== "none" &&
    timerInput.value >= 1 &&
    minInput.value >= 0 &&
    maxInput.value >= minInput.value
  ) {
    const listObject = {
      coinID: coinSelect.value,
      currency: currencySelect.value,
      timer: timerInput.value,
      min: minInput.value,
      max: maxInput.value,
    }
    if (!trackers[coinSelect.value]) {
      trackers[coinSelect.value] = listObject
      // setStorage(trackers)
      chrome.storage.local.set({ trackers })
    }

    // console.log(trackers)
    submitButton.parentElement.reset()
    renderList(trackers)
  } else {
    alert("Please provide correct input")
  }
}

renderList = (coinList = {}) => {
  const trackerCounts = document.getElementById("trackerCount")
  const listElement = document.getElementById("tracker-list")
  listElement.innerHTML = ""
  trackerCounts.innerHTML = Object.keys(coinList).length

  for (const coinID in coinList) {
    listElement.innerHTML += generateLi(coinID, coinList[coinID]).trim()
  }

  addOnClick()
  startTrackers()
}

generateLi = (Id, item) => {
  return `<li class="list-group-item d-flex justify-content-between lh-sm">
                <div>
                <div class="d-flex justify-content-between"><h6 class="my-0 ">${Id}</h6><span class="text-danger">${item.timer}min</span>
                </div>
                  
                  <small class="text-success">[${item.min}] - [${item.max}]</small>
                </div>
                
                <button id="${Id}" type="button" class="btn btn-outline-danger btn-sm">
                  X
                </button>
              </li>`
}

addOnClick = () => {
  if (trackers) {
    let trackerArray = Object.values(trackers)
    trackerArray.forEach((tracker) => {
      let btn = document.getElementById(tracker.coinID)
      btn.addEventListener("click", (e) => deleteTracker(tracker.coinID))
    })
  }
}

deleteTracker = (id) => {
  delete trackers[id]
  chrome.storage.local.set({ trackers })
  renderList(trackers)
}

renderCoinsSelect = (objectMap) => {
  for (const property in objectMap) {
    let opt = document.createElement("option")
    opt.value = objectMap[property]
    opt.innerHTML = property
    coinSelect.appendChild(opt)
  }
}

renderCurrencySelect = (currencyList) => {
  currencyList.forEach((element) => {
    let opt = document.createElement("option")
    opt.value = element
    opt.innerHTML = element
    currencySelect.appendChild(opt)
  })
}

saveToGlobal = (data) => {
  trackers = data || {}
}

startTrackers = () => {
  chrome.alarms.clearAll()
  chrome.storage.local.get(["trackers"], ({ trackers }) => {
    let trackersArray = Object.values(trackers)
    trackersArray.forEach((tracker) => {
      chrome.alarms.create(JSON.stringify(tracker), {
        periodInMinutes: parseInt(tracker.timer),
        delayInMinutes: 1,
      })
    })
  })
}

coinSelect.onchange = () => {
  if (coinSelect.value === "none") {
    currencySelect.disabled = true
  } else {
    currencySelect.disabled = false
  }
}

currencySelect.onchange = async () => {
  priceShower.innerText = "Loading..."
  let price = await fetchPrice(coinSelect.value, currencySelect.value)
  console.log(price)
  priceShower.innerText = price
}

fetchPrice = async (id, currency) => {
  const response = await fetch(
    `https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=${currency}`
  )
  const data = await response.json()
  console.log(data)
  return data[id][currency]
}

let trackers = {}
chrome.storage.local.get(
  ["trackers", "coinMap", "currencyList"],
  ({ trackers, coinMap, currencyList }) => {
    renderCoinsSelect(coinMap)
    saveToGlobal(trackers)
    renderCurrencySelect(currencyList)
    renderList(trackers)
    currencySelect.disabled = true
  }
)
