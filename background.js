let price = 0

chrome.runtime.onInstalled.addListener(() => {
  fetchCryptos()
  fetchCurrencies()
})

fetchCryptos = async () => {
  const resp = await fetch(
    "https://api.coingecko.com/api/v3/coins/list?include_platform=false"
  )
  const data = await resp.json()
  let coinMap = {}
  await data.forEach((coin) => {
    coinMap[coin.name] = coin.id
  })
  chrome.storage.local.set({ coinMap })
}

fetchCurrencies = async () => {
  const resp = await fetch(
    "https://api.coingecko.com/api/v3/simple/supported_vs_currencies"
  )
  const data = await resp.json()
  chrome.storage.local.set({ currencyList: data })
}

fetchPrice = async (id, currency) => {
  const response = await fetch(
    `https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=${currency}`
  )
  const data = await response.json()
  console.log(data)
  return data[id][currency]
}

startTrackers = () => {
  chrome.alarms.clearAll()
  chrome.storage.local.get(["trackers"], ({ trackers }) => {
    let trackersArray = Object.values(trackers)
    trackersArray.forEach((tracker) => {
      chrome.alarms.create(JSON.stringify(tracker), {
        periodInMinutes: parseInt(tracker.timer),
        delayInMinutes: 2,
      })
    })
  })
}

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm) {
    let alarmTracker = JSON.parse(alarm.name)
    price = await fetchPrice(alarmTracker.coinID, alarmTracker.currency)
    let buzzer = new Audio(chrome.runtime.getURL("./alert.mp3"))
    if (price < parseInt(alarmTracker.min)) {
      setTimeout(() => {
        buzzer.play()
        alert(`There's a dip, The current price is ${price}.`)
      }, 5000)
    } else if (price > parseInt(alarmTracker.max)) {
      setTimeout(() => {
        buzzer.play()
        alert(`Sell it out, the current price is ${price}.`)
      }, 5000)
    }
  }
})

chrome.runtime.onStartup.addListener(() => {
  console.log("nowwwww")
  startTrackers()
})

startTrackers()
