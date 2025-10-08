// === Import utility ===
import { dates } from '/utils/dates'

// === Global State ===
const tickersArr = []

// === DOM Elements ===
const generateReportBtn = document.querySelector('.generate-report-btn')
const loadingArea = document.querySelector('.loading-panel')
const apiMessage = document.getElementById('api-message')
const tickerForm = document.getElementById('ticker-input-form')
const tickerInput = document.getElementById('ticker-input')

// === Event Listeners ===
tickerForm.addEventListener('submit', handleTickerSubmit)
generateReportBtn.addEventListener('click', fetchStockData)

// === Functions ===

// Handle ticker input form
function handleTickerSubmit(e) {
    e.preventDefault()

    const label = document.getElementsByTagName('label')[0]
    const newTicker = tickerInput.value.trim().toUpperCase()

    if (newTicker.length >= 3) {
        tickersArr.push(newTicker)
        tickerInput.value = ''
        renderTickers()
        generateReportBtn.disabled = false
        label.style.color = ''
        label.textContent = 'Enter stock ticker symbol (e.g., TSLA, AAPL, META)'
    } else {
        label.style.color = 'red'
        label.textContent = 'You must add at least one ticker (3+ letters, e.g. TSLA for Tesla).'
    }
}

// Display tickers on UI
function renderTickers() {
    const tickersDiv = document.querySelector('.ticker-choice-display')
    tickersDiv.innerHTML = ''

    tickersArr.forEach((ticker) => {
        const newTickerSpan = document.createElement('span')
        newTickerSpan.textContent = ticker
        newTickerSpan.classList.add('ticker')
        tickersDiv.appendChild(newTickerSpan)
    })
}

// Fetch stock data for all tickers
async function fetchStockData() {
    document.querySelector('.action-panel').style.display = 'none'
    loadingArea.style.display = 'flex'
    apiMessage.innerText = 'Fetching stock data...'

    try {
        const stockData = await Promise.all(
            tickersArr.map(async (ticker) => {
                const url = `/api/agg/${ticker}?start=${dates.startDate}&end=${dates.endDate}`
                const response = await fetch(url)
                if (response.ok) {
                    const data = await response.text()
                    return data
                } else {
                    throw new Error(`Failed to fetch data for ${ticker}`)
                }
            })
        )

        apiMessage.innerText = 'Creating AI-powered report...'
        await fetchReport(stockData.join(''))
    } catch (err) {
        console.error('Error fetching stock data:', err)
        loadingArea.innerText = 'There was an error fetching stock data. Please try again.'
    }
}

// Ask backend to generate AI report
async function fetchReport(data) {
    const messages = [
        {
            role: 'system',
            content:
                'You are a trading guru. Given data on share prices over the past 3 days, write a report of no more than 150 words describing the stock performance and recommending whether to buy, hold, or sell. Use the examples provided between ### to match the tone and style.'
        },
        {
            role: 'user',
            content: `${data}
            ###
            OK baby, hold on tight! You are going to haate this! Over the past three days, Tesla (TSLA) shares have plummetted. The stock opened at $223.98 and closed at $202.11 on the third day... 
            ###
            Apple (AAPL) is the supernova in the stock sky – it shot up from $150.22 to a jaw-dropping $175.36 by the close of day three...
            ###`
        }
    ]

    try {
        const response = await fetch('/api/report', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages })
        })

        if (!response.ok) throw new Error('AI report request failed')

        const result = await response.json()
        renderReport(result.content)
    } catch (err) {
        console.error('Error generating AI report:', err)
        loadingArea.innerText = 'Unable to access AI. Please refresh and try again.'
    }
}

// Render the final AI report on screen
function renderReport(output) {
    loadingArea.style.display = 'none'
    const outputArea = document.querySelector('.output-panel')
    outputArea.innerHTML = '' // clear previous reports
    const report = document.createElement('p')
    report.textContent = output
    outputArea.appendChild(report)
    outputArea.style.display = 'flex'
}
