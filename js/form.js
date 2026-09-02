import { formatWhatsapp } from './form-utils.js'

const cityInput = document.querySelector('input[name="cidade_uf"]')
const whatsappInput = document.querySelector('input[name="whatsapp"]')

if (whatsappInput) {
  whatsappInput.addEventListener('input', () => {
    whatsappInput.value = formatWhatsapp(whatsappInput.value)
  })
}

if (cityInput) {
  const wrapper = document.createElement('div')
  const options = document.createElement('div')
  const state = { cities: [], selected: null, activeIndex: -1 }

  wrapper.className = 'city-combobox'
  wrapper.dataset.cityCombobox = ''
  options.className = 'city-options'
  options.id = 'city-options'
  options.setAttribute('role', 'listbox')
  options.hidden = true
  cityInput.placeholder = 'Busque sua cidade'
  cityInput.setAttribute('role', 'combobox')
  cityInput.setAttribute('aria-autocomplete', 'list')
  cityInput.setAttribute('aria-expanded', 'false')
  cityInput.setAttribute('aria-controls', options.id)
  cityInput.setAttribute('autocomplete', 'off')
  cityInput.setCustomValidity('Selecione uma cidade da lista.')
  cityInput.parentNode.insertBefore(wrapper, cityInput)
  wrapper.append(cityInput, options)

  const normalize = (value) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()

  const closeOptions = () => {
    options.hidden = true
    cityInput.setAttribute('aria-expanded', 'false')
    cityInput.removeAttribute('aria-activedescendant')
  }

  const selectCity = (city) => {
    state.selected = city
    cityInput.value = `${city.nome} / ${city.uf}`
    cityInput.setCustomValidity('')
    closeOptions()
  }

  const renderOptions = () => {
    const query = normalize(cityInput.value.trim())
    const matches = state.cities
      .filter((city) => normalize(`${city.nome} ${city.uf}`).includes(query))
      .slice(0, 30)

    options.innerHTML = ''
    state.activeIndex = -1

    if (!matches.length) {
      options.innerHTML = '<p class="city-empty">Nenhuma cidade encontrada.</p>'
    } else {
      matches.forEach((city, index) => {
        const option = document.createElement('button')
        option.type = 'button'
        option.className = 'city-option'
        option.id = `city-option-${index}`
        option.setAttribute('role', 'option')
        option.innerHTML = `<span>${city.nome}</span><small>${city.uf}</small>`
        option.addEventListener('mousedown', (event) => event.preventDefault())
        option.addEventListener('click', () => selectCity(city))
        options.append(option)
      })
    }

    options.hidden = false
    cityInput.setAttribute('aria-expanded', 'true')
  }

  const loadCities = async () => {
    if (state.cities.length) return
    const response = await fetch('/data/cidades.json', { headers: { Accept: 'application/json' } })
    if (!response.ok) throw new Error('Não foi possível carregar as cidades.')
    state.cities = await response.json()
  }

  cityInput.addEventListener('focus', async () => {
    try {
      await loadCities()
      renderOptions()
    } catch {
      options.innerHTML = '<p class="city-empty">Não foi possível carregar as cidades.</p>'
      options.hidden = false
      cityInput.setAttribute('aria-expanded', 'true')
    }
  })

  cityInput.addEventListener('input', async () => {
    state.selected = null
    cityInput.setCustomValidity('Selecione uma cidade da lista.')
    try {
      await loadCities()
      renderOptions()
    } catch {
      closeOptions()
    }
  })

  cityInput.addEventListener('keydown', (event) => {
    const visibleOptions = [...options.querySelectorAll('.city-option')]
    if (event.key === 'Escape') return closeOptions()
    if (!visibleOptions.length || options.hidden) return

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      state.activeIndex = (state.activeIndex + (event.key === 'ArrowDown' ? 1 : -1) + visibleOptions.length) % visibleOptions.length
      visibleOptions.forEach((option, index) => option.setAttribute('aria-selected', String(index === state.activeIndex)))
      cityInput.setAttribute('aria-activedescendant', visibleOptions[state.activeIndex].id)
    }

    if (event.key === 'Enter' && state.activeIndex >= 0) {
      event.preventDefault()
      visibleOptions[state.activeIndex].click()
    }
  })

  document.addEventListener('click', (event) => {
    if (!wrapper.contains(event.target)) closeOptions()
  })
}
