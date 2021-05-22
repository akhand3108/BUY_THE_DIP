const submitButton = document.getElementById("submitButton")
const coinSelect = document.getElementById("coin")
const currencySelect = document.getElementById("currency")
const minInput = document.getElementById("minCoin")
const maxInput = document.getElementById("maxCoin")
const timerInput = document.getElementById("timer")

submitButton.onclick = (e) => {
  e.preventDefault()
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

let trackers = {}
chrome.storage.local.get(
  ["trackers", "coinMap", "currencyList"],
  ({ trackers, coinMap, currencyList }) => {
    renderCoinsSelect(coinMap)
    saveToGlobal(trackers)
    renderCurrencySelect(currencyList)
    renderList(trackers)
  }
)
