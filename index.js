//===============API URL================//
const BASE_URL = 'https://lighthouse-user-api.herokuapp.com'
const INDEX_URL = BASE_URL + '/api/v1/users/'

//===============DOM NODES================//
const userDataPanel = document.querySelector('#user-data-panel')
const paginator = document.querySelector('#paginator')
const searchField = document.querySelector('#search-field')
const genderFilter = document.querySelector('.gender-filter')
const regionFilter = document.querySelector('.region-filter')
const ageFilter = document.querySelector('#age-range-silders')
const clearFiltersBtn = document.querySelector('#clear-filters-btn')
const clearSearchBtn = document.querySelector('#clear-search-btn')
const modeTogglers = document.querySelector('#mode-togglers')

//================GLOBAL VARIABLES===============//
const USERS_PER_PAGE = 24
const users = []
let usersData
let currentPage = 1
let gender = 'all'
let region = 'all'
let keyword = ''
let mode = 'card'
let ageMin = 22
let ageMax = 75

//===============EVENT LISTENERS================//
userDataPanel.addEventListener('click', onUserDataPanelClicked)
paginator.addEventListener('click', onPaginatorClicked)
searchField.addEventListener('keyup', onSearchFieldKeyup)
genderFilter.addEventListener('click', onGenderFilterClicked)
regionFilter.addEventListener('click', onRegionFilterClicked)
clearFiltersBtn.addEventListener('click', onClearFiltersBtnClicked)
clearSearchBtn.addEventListener('click', onClearSearchBtnClicked)
modeTogglers.addEventListener('click', onModeTogglersClicked)
ageFilter.addEventListener('input', onAgeFilterChanged)

//==============================================//
setDefaultAgeRange()
renderAgeFilter()
showCurrentPage()

axios.get(INDEX_URL)
  .then(function (response) {
    users.push(...response.data.results)
    users.forEach(user => user.fullName = `${user.name} ${user.surname}`)
    renderUserList(getUsersDataByPage(currentPage))
    renderPaginator(usersData.length)
    renderRegionOptions(usersData)
    renderAddBtn()
    showFavoriteCount()
  })
  .catch(function (error) {
    console.log(error)
  })

//===============FUNCTIONS================//
function renderUserList(data) {
  if (data.length === 0) {
    userDataPanel.innerText = 'no result'
    return
  } else if (mode === 'list') {
    let rawHTML = ''
    data.forEach(user => {
      rawHTML += `
      <li class="list-group-item d-flex align-items-center flex-wrap">
        <div class="list-user-avatar">
          <img src="${user.avatar}" class="avatar" data-toggle="modal" data-id="${user.id}" data-target="#user-data-modal">
        </div>
        <div class ="flex-grow-1">
          <div class="list-user-fullName">${user.fullName}</div>
          <div class="list-user-age">Age: ${user.age}</div>
          <div class="list-user-gender-icon"> 
            <i class="fas ${user.gender === 'male' ? 'fa-mars' : 'fa-venus'} fa-sm"></i>
          </div>
          <div class="list-user-region region">${user.region}</div>
        </div>
        <div class="list-user-btns">
          <button type="button" class="btn btn-warning mr-2 more" data-toggle="modal" data-id="${user.id}" data-target="#user-data-modal">More</button>
          <i class="fas fa-user-plus fa-sm" data-id="${user.id}"></i>
        </div>
      </li>`
    })
    userDataPanel.className = 'row row-cols-1'
    userDataPanel.innerHTML = rawHTML
  } else if (mode === 'card') {
    let rawHTML = ''
    data.forEach(user => {
      rawHTML += `<div class="mb-5 px-2">
          <div class="card h-100">
            <img src="${user.avatar}" class="card-img-top avatar" alt="user avatar" data-toggle="modal" data-id="${user.id}" data-target="#user-data-modal">
            <div class="card-body mb-2">
              <p class="card-text h-50 mb-1 d-flex align-items-center justify-content-center" id="user-data-full-name"><span>${user.fullName}<span>
              </p>
              <div class="gender-icon text-center">
              <i class="fas ${user.gender === 'male' ? 'fa-mars' : 'fa-venus'} fa-sm"></i>
              </div>
              <div class="age">Age: ${user.age}</div>
              <div class="region">${user.region}</div>
            </div>
            <div class="card-footer d-flex justify-content-center align-items-center">
             <button type="button" class="btn btn-warning mr-2 more" data-toggle="modal" data-id="${user.id}" data-target="#user-data-modal">More</button>
             <i class="fas fa-user-plus fa-sm" data-id="${user.id}"></i>
            </div>
          </div>
        </div>`
    })
    userDataPanel.className = 'row row-cols-2 row-cols-sm-3 row-cols-md-4 row-cols-lg-6 text-center'
    userDataPanel.innerHTML = rawHTML
  }
}

function renderPaginator(amount) {
  const pageCount = Math.ceil(amount / USERS_PER_PAGE)
  let rawHTML = `<li class="page-item"><a class="page-link" data-btn="previous-page-btn" href="#"><<</a></li>`
  for (let pageNo = 1; pageNo <= pageCount; pageNo++) {
    rawHTML += `<li class="page-item" data-page="${pageNo}"><a class="page-link" href="#" data-page="${pageNo}">${pageNo}</a></li>\n`
  }
  rawHTML += `<li class="page-item"><a class="page-link" data-btn="next-page-btn" href="#">>></a></li>`
  paginator.innerHTML = rawHTML
}

function onClearFiltersBtnClicked(e) {
  gender = 'all'
  region = 'all'
  ageMax = 75
  ageMin = 22
  currentPage = 1
  renderUserList(getUsersDataByPage(currentPage))
  renderPaginator(usersData.length)
  renderGenderFilter(e)
  renderRegionFilter(e)
  renderAgeFilter()
  setDefaultAgeRange()
  renderAddBtn()
  showCurrentPage()
}

function renderRegionOptions(data) {
  const regions = []
  data.forEach(user => regions.push(user.region))
  const UniqueRegions = [...new Set(regions)].sort()
  const regionDropdown = document.querySelector('.region-dropdown')
  let rawHTML = '<a class="dropdown-item" href="#" data-region="all">All Regions</a>'
  for (const region of UniqueRegions) {
    rawHTML += `<a class="dropdown-item" href="#" data-region="${region}">${region}</a>`
  }
  regionDropdown.innerHTML = rawHTML
}

function renderUserModal(id) {
  const selectedUserData = users.find(user => user.id === id)

  const userModalTitle = document.querySelector('#user-modal-title')
  const userModalfullName = document.querySelector('#user-modal-fullName')
  const userModalAvatar = document.querySelector('#user-modal-avatar')
  const userModalEamil = document.querySelector('#user-modal-email')
  const userModalGender = document.querySelector('#user-modal-gender')
  const userModalAge = document.querySelector('#user-modal-age')
  const userModalRegion = document.querySelector('#user-modal-region')
  const userModalBirthday = document.querySelector('#user-modal-birthday')

  userModalAvatar.innerHTML = `<img src="${selectedUserData.avatar}">`
  userModalfullName.innerText = selectedUserData.fullName
  userModalTitle.innerText = `id: ${id}`
  userModalEamil.innerText = selectedUserData.email
  userModalGender.innerText = selectedUserData.gender
  userModalAge.innerText = selectedUserData.age
  userModalRegion.innerText = selectedUserData.region
  userModalBirthday.innerText = selectedUserData.birthday
}

function toggleAddBtn(id) {
  const addBtn = document.querySelector(`#user-data-panel i[data-id="${id}"]`)
  if (addBtn === null) return
  addBtn.classList.toggle('fa-user-plus')
  addBtn.classList.toggle('fa-heart')
}

function onUserDataPanelClicked(e) {
  if (e.target.matches('.avatar, .more')) {
    renderUserModal(Number(e.target.dataset.id))
  } else if (e.target.matches('.fa-user-plus')) {
    addToFavoriteList(Number(e.target.dataset.id))
    toggleAddBtn(Number(e.target.dataset.id))
    showFavoriteCount()
  } else if (e.target.matches('.fa-heart')) {
    removeFromFavoriteList(Number(e.target.dataset.id))
    toggleAddBtn(Number(e.target.dataset.id))
    showFavoriteCount()
  }
}

function renderAddBtn() {
  const favoriteList = JSON.parse(localStorage.getItem('favoriteList'))
  if (favoriteList === null) return
  favoriteList.forEach(fav => toggleAddBtn(fav.id))
}

function onModeTogglersClicked(e) {
  if (e.target.matches('.fa-th')) {
    mode = 'card'
    renderUserList(getUsersDataByPage(currentPage))
    renderAddBtn()
  } else if (e.target.matches('.fa-bars')) {
    mode = 'list'
    renderUserList(getUsersDataByPage(currentPage))
    renderAddBtn()
  }
}

function addToFavoriteList(id) {
  const favoriteList = JSON.parse(localStorage.getItem('favoriteList')) || []
  const characterToAdd = users.find(user => user.id === id)
  favoriteList.push(characterToAdd)
  localStorage.setItem('favoriteList', JSON.stringify(favoriteList))
}

function removeFromFavoriteList(id) {
  const favoriteList = JSON.parse(localStorage.getItem('favoriteList'))
  const removedCharacterIndex = favoriteList.findIndex(user => user.id === id)
  if (removedCharacterIndex === -1) return
  favoriteList.splice(removedCharacterIndex, 1)
  localStorage.setItem('favoriteList', JSON.stringify(favoriteList))
}

function showCurrentPageBtn(page) {
  const allPageBtn = document.querySelectorAll('#paginator li[data-page]')
  allPageBtn.forEach(pageBtn => pageBtn.className = 'page-item')
  const activePageBtn = document.querySelector(`#paginator li[data-page="${page}"]`)
  activePageBtn.classList.toggle('active')
}

function onPaginatorClicked(e) {
  if (e.target.matches('[data-page]')) {
    currentPage = Number(e.target.dataset.page)
    renderUserList(getUsersDataByPage(currentPage))
    showCurrentPageBtn(currentPage)
    showCurrentPage()
    renderAddBtn()
  } else if (e.target.matches('[data-btn="previous-page-btn"]')) {
    currentPage--
    if (currentPage <= 0) return
    renderUserList(getUsersDataByPage(currentPage))
    showCurrentPageBtn(currentPage)
    showCurrentPage()
    renderAddBtn()
  } else if (e.target.matches('[data-btn="next-page-btn"]')) {
    currentPage++
    if (currentPage > Math.ceil(usersData.length / USERS_PER_PAGE)) return
    renderUserList(getUsersDataByPage(currentPage))
    showCurrentPageBtn(currentPage)
    showCurrentPage()
    renderAddBtn()
  }
}

function getUsersDataByPage(page) {
  usersData = users
  if (keyword !== '') {
    usersData = usersData.filter(user => user.fullName.toLowerCase().includes(keyword))
  }

  if (gender !== 'all') {
    usersData = usersData.filter(user => user.gender === gender)
  }

  if (region !== 'all') {
    usersData = usersData.filter(user => user.region === region)
  }

  if (ageMin !== 22 || ageMax !== 75) {
    usersData = usersData.filter(user => {
      return user.age >= ageMin && user.age <= ageMax
    })
  }
  const startIndex = (page - 1) * USERS_PER_PAGE
  return usersData.slice(startIndex, startIndex + USERS_PER_PAGE)
}

function onAgeFilterChanged(e) {
  const ageMaxInput = document.querySelector('#age-max')
  const ageMinInput = document.querySelector('#age-min')
  ageMax = Number(ageMaxInput.value)
  ageMin = Number(ageMinInput.value)
  renderUserList(getUsersDataByPage(1))
  renderPaginator(usersData.length)
  renderAgeFilter()
  renderAddBtn()
  currentPage = 1
  showCurrentPage()
}

function renderAgeFilter() {
  const showAgeMax = document.querySelector('#show-age-max')
  const showAgeMin = document.querySelector('#show-age-min')
  showAgeMax.innerText = ageMax
  showAgeMin.innerText = ageMin
}

function setDefaultAgeRange() {
  const ageMaxInput = document.querySelector('#age-max')
  const ageMinInput = document.querySelector('#age-min')
  ageMaxInput.value = ageMax
  ageMinInput.value = ageMin
}

function onSearchFieldKeyup(e) {
  keyword = searchField.value.trim().toLowerCase()
  renderUserList(getUsersDataByPage(1))
  renderPaginator(usersData.length)
  renderAddBtn()
}

function onGenderFilterClicked(e) {
  if (e.target.matches('[data-gender]')) {
    gender = e.target.dataset.gender
    renderUserList(getUsersDataByPage(1))
    renderPaginator(usersData.length)
    renderGenderFilter(e)
    renderAddBtn()
    currentPage = 1
    showCurrentPage()
  }
}

function onRegionFilterClicked(e) {
  if (e.target.matches('[data-region]')) {
    region = e.target.dataset.region
    renderUserList(getUsersDataByPage(1))
    renderPaginator(usersData.length)
    renderRegionFilter(e)
    renderAddBtn()
  }
}

function renderGenderFilter(e) {
  const genderFilterBtn = document.querySelector('#gender-filter-btn')
  if (gender === 'all') {
    genderFilterBtn.innerText = 'Gender'
  } else {
    genderFilterBtn.innerText = gender
  }
}

function renderRegionFilter(e) {
  const regionFilterBtn = document.querySelector('#region-filter-btn')
  if (region === 'all') {
    regionFilterBtn.innerText = 'Region'
  } else {
    regionFilterBtn.innerText = region
  }
}

function onClearSearchBtnClicked(e) {
  searchField.value = null
  keyword = ''
  currentPage = 1
  renderUserList(getUsersDataByPage(currentPage))
  renderPaginator(usersData.length)
  renderAddBtn()
  showCurrentPage()
}

function showFavoriteCount() {
  const favoriteList = JSON.parse(localStorage.getItem('favoriteList'))
  const favoriteCountBadge = document.querySelector('#favorite-count-badge')
  if (favoriteList === null) {
    favoriteCountBadge.innerText = 0
    return
  }
  favoriteCountBadge.innerText = favoriteList.length
}

function showCurrentPage() {
  const showCurrentBadge = document.querySelector('#show-page-badge')
  showCurrentBadge.innerText = `page: ${currentPage}`
}
// function getUsersAgeRange(data) {
//   const age = []
//   data.forEach(user => age.push(user.age))
//   let Max = Math.max(...age)
//   let min = Math.min(...age)
//   console.log(min, Max)
// }
