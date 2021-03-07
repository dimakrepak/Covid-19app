
const proxy = 'https://api.codetabs.com/v1/proxy/?quest=';
const coronaCountriesApi = `https://corona-api.com/countries`;
const countriesApi = `https://restcountries.herokuapp.com/api/v1`;
const regionBtn = document.querySelectorAll('.region')
const typeBtn = document.querySelectorAll('.type')
const dropdown = document.querySelector('.selectNames')
const newsCont = document.querySelector('.info')
console.log(newsCont)


let currentRegion
let covidData
let covidCountry




async function getCovidCountries() {
    const promise = await fetch(`${proxy}${coronaCountriesApi}`);
    const dataCountry = await promise.json();
    return dataCountry.data

}
async function getCovidByName(country) {
    const covidInfo = await getCovidCountries()
    return covidInfo.filter(c => c.name === country)

}


async function getCountry(region) {
    const promise = await fetch(`${proxy}${countriesApi}`);
    const dataCountry = await promise.json();

    const byRegion = dataCountry.filter(d => d.region === region)
    const countryByCode = await Promise.all(
        byRegion.map(c => {
            return {
                code: c.cca2, country: c.name.common,
            }
        })
    )
    return countryByCode



}

async function covidInfoCode(code) {
    let promise = await fetch(`${proxy}${coronaCountriesApi}/${code}`)
    let data = await promise.json()
    console.log(data.data);
    return data.data


}
async function getRegionInfo(region) {
    let regionCountries = await getCountry(region)
    let data = await Promise.all(
        regionCountries.map(async (c) => {
            return await covidInfoCode(c.code)
        })

    )

    return data
}





regionBtn.forEach((btn) => {
    btn.addEventListener('click', async (e) => {
        covidCountry = []
        let current
        currentRegion = (e.currentTarget).classList.item(1);
        let regionInfo = await getRegionInfo(currentRegion);
        let worldCountries = await getCovidCountries()
        current = (currentRegion === 'World') ? worldCountries : regionInfo
        current.map(c => {
            if (c !== undefined) covidCountry.push(c.name);
        })
        fillDropdown(covidCountry)
        myChart.data.labels = covidCountry
        myChart.update();
    })
})




typeBtn.forEach((btn) => {
    btn.addEventListener('click', async (e) => {
        covidData = []
        let current
        let currentTarget = e.currentTarget
        let label = currentTarget.classList.item(1)
        let regionInfo = await getRegionInfo(currentRegion);
        let worldCountries = await getCovidCountries()
        current = (currentRegion === 'World') ? worldCountries : regionInfo
        current.map(c => {
            if (c !== undefined) {
                if (currentTarget.classList.contains('confirmed')) covidData.push(c.latest_data.confirmed)
                else if (currentTarget.classList.contains('deaths')) covidData.push(c.latest_data.deaths)
                else if (currentTarget.classList.contains('recovered')) covidData.push(c.latest_data.recovered)
                else if (currentTarget.classList.contains('critical')) covidData.push(c.latest_data.critical)
            }
        })

        myChart.data.datasets[0].data = covidData
        myChart.data.datasets[0].label = label
        myChart.update();
    })
})

function fillDropdown(countriesArray) {
    dropdown.innerHTML =
        '<option value="SelectOption" selected>Select a Country</option>';
    for (const country of countriesArray) {
        dropdown.innerHTML += `<option value="${country}">${country}</option>`;
    }
    dropdown.addEventListener('change', displayInfo)

}
async function displayInfo(e) {
    console.log(e.currentTarget.value);
    const covidInfo = (await getCovidByName(`${e.currentTarget.value}`))
    covidInfo.map(c => {

        const html =
            `<h4>Total Confirmed Cases:</h4> 
               <p class="total-cases">${c.latest_data.confirmed}</p>
            <h4>Today Confirmed Cases:</h4> 
               <p class="new-cases">${c.today.confirmed}</p>
            <h4>Total Deaths Cases:</h4> 
               <p class="total-deaths">${c.latest_data.deaths}</p>
            <h4>Today Deaths Cases:</h4> 
               <p class="new-deaths">${c.today.deaths}</p>
            <h4>Total Recovered Cases:</h4> 
               <p class="total-recovered "${c.latest_data.recovered}></p>
            <h4>Total Critical Cases:</h4> 
               <p class="critical-condition"${c.latest_data.critical}></p>`

        newsCont.innerHTML = html
    })

}